"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { describirEvento } from "@/components/fintech/evento"
import { Huella } from "@/components/fintech/huella"
import { InsigniaEstado, InsigniaTipo } from "@/components/fintech/insignias"
import { Icono, ICONOS } from "@/components/iconos"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { formatoEntero, formatoFecha, formatoFechaHora, formatoPesos } from "@/lib/formato"
import { verificarExclusividad, type ResultadoExclusividad } from "@/lib/ledger/verificacion"
import { eventosDeCredito } from "@/lib/store/operaciones"
import {
  useCreditos,
  useEstadosCreditos,
  useEventos,
  useLedgerConsulta,
  useNombresFondeadores,
} from "@/lib/store/selectores"
import { BotonVerificar } from "./boton-verificar"
import { useFondeadorActivo } from "./marco-fondeador"

function Exclusividad({ creditoId, fondeadorId }: { creditoId: string; fondeadorId: string }) {
  const ledger = useLedgerConsulta()
  const nombres = useNombresFondeadores()
  const [resultado, setResultado] = useState<ResultadoExclusividad | null>(null)

  useEffect(() => {
    let vigente = true
    void verificarExclusividad(creditoId, fondeadorId, ledger).then((r) => vigente && setResultado(r))
    return () => {
      vigente = false
    }
  }, [creditoId, fondeadorId, ledger])

  if (!resultado) return null
  if (resultado.exclusivo) {
    return (
      <Badge variant="exito">
        <Icono icon={ICONOS.correcto} data-icon="inline-start" />
        El contrato lo tiene asignado solo a ti
      </Badge>
    )
  }
  return (
    <Badge variant="outline">
      {resultado.asignadoA
        ? `Hoy pertenece a ${nombres.get(resultado.asignadoA) ?? resultado.asignadoA}`
        : "Ya no está asignado a ti"}
    </Badge>
  )
}

export function VistaCredito() {
  const { id } = useParams<{ id: string }>()
  const fondeador = useFondeadorActivo()
  const creditos = useCreditos()
  const eventos = useEventos()
  const estados = useEstadosCreditos()
  const nombres = useNombresFondeadores()

  if (!fondeador) return null
  const credito = creditos.find((c) => c.id === id)
  // Solo los eventos registrados a nombre de este fondeador.
  const historial = eventosDeCredito(eventos, id).filter((e) => e.datos.fondeadorId === fondeador.id)

  if (!credito || historial.length === 0) {
    return (
      <Card>
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Icono icon={ICONOS.buscar} />
              </EmptyMedia>
              <EmptyTitle>Sin registros a tu nombre</EmptyTitle>
              <EmptyDescription>
                {id} no tiene eventos registrados para {fondeador.nombre}.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" nativeButton={false} render={<Link href="/fondeador" />}>
                Volver a mi cartera
              </Button>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Button variant="ghost" size="sm" className="self-start" nativeButton={false} render={<Link href="/fondeador" />}>
        <Icono icon={ICONOS.anterior} data-icon="inline-start" />
        Mi cartera
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="font-mono text-2xl">{credito.id}</CardTitle>
          <CardDescription>
            {credito.sector} · desembolsado el {formatoFecha(credito.fechaDesembolso)} a {credito.plazoMeses} meses
          </CardDescription>
          <CardAction>
            <InsigniaEstado estado={estados.get(credito.id) ?? "sin_asignar"} />
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["Saldo", formatoPesos(credito.saldo)],
              ["Monto original", formatoPesos(credito.montoOriginal)],
              ["Días de mora", formatoEntero(credito.diasMora)],
              ["Eventos registrados", formatoEntero(historial.length)],
            ].map(([etiqueta, valor]) => (
              <div key={etiqueta}>
                <dt className="text-sm text-muted-foreground">{etiqueta}</dt>
                <dd className="font-heading text-lg font-bold tabular-nums">{valor}</dd>
              </div>
            ))}
          </dl>
          <Exclusividad creditoId={credito.id} fondeadorId={fondeador.id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Línea de tiempo</CardTitle>
          <CardDescription>
            Cada evento quedó fijado en la red con su huella. Verifícalo para comprobar que los datos
            no cambiaron después.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="relative flex flex-col gap-6 border-l pl-6">
            {[...historial].reverse().map((evento) => (
              <li key={evento.id} className="relative flex flex-col gap-2">
                <span
                  aria-hidden="true"
                  className="absolute top-1.5 -left-[1.95rem] size-3 rounded-full bg-chart-2 ring-4 ring-card"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <InsigniaTipo tipo={evento.datos.tipo} />
                  <span className="text-sm text-muted-foreground">{formatoFechaHora(evento.fecha)}</span>
                </div>
                <p className="font-medium">{describirEvento(evento, nombres)}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <Huella valor={evento.huella} />
                  <span className="font-mono text-xs text-muted-foreground">
                    {evento.id} · ledger #{formatoEntero(evento.registro.ledger)}
                  </span>
                </div>
                <BotonVerificar evento={evento} />
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </>
  )
}
