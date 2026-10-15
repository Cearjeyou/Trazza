"use client"

import Link from "next/link"
import { useState } from "react"
import { Icono, ICONOS } from "@/components/iconos"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import type { AlertaMora } from "@/lib/dominio/reglas"
import { formatoFecha, formatoFechaHora, formatoPesos, plural } from "@/lib/formato"
import { listarSustituciones } from "@/lib/store/operaciones"
import { useAlertas, useCreditos, useEventos, useFondeadores, useNombresFondeadores } from "@/lib/store/selectores"
import { PanelSustitucion } from "./panel-sustitucion"

function InsigniaPlazo({ alerta }: { alerta: AlertaMora }) {
  if (alerta.vencido) return <Badge variant="destructive">Plazo vencido hace {plural(-alerta.diasRestantes, "día")}</Badge>
  if (alerta.diasRestantes <= 3) {
    return <Badge variant="aviso">{alerta.diasRestantes === 0 ? "Vence hoy" : `Quedan ${plural(alerta.diasRestantes, "día")}`}</Badge>
  }
  return <Badge variant="secondary">Quedan {plural(alerta.diasRestantes, "día")}</Badge>
}

export function VistaAlertas() {
  const alertas = useAlertas()
  const fondeadores = useFondeadores()
  const creditos = useCreditos()
  const eventos = useEventos()
  const nombres = useNombresFondeadores()
  const [abierta, setAbierta] = useState<AlertaMora | null>(null)

  const sustituciones = listarSustituciones(eventos).slice(0, 5)

  return (
    <>
      {alertas.length === 0 ? (
        <Card>
          <CardContent>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Icono icon={ICONOS.correcto} />
                </EmptyMedia>
                <EmptyTitle>Sin alertas</EmptyTitle>
                <EmptyDescription>
                  Ningún crédito asignado supera la mora permitida por su fondeador.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" nativeButton={false} render={<Link href="/fintech/cartera" />}>
                  Cargar un corte de mora
                </Button>
              </EmptyContent>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <section aria-label="Alertas de mora" className="grid gap-4 lg:grid-cols-2">
          {alertas.map((alerta) => {
            const fondeador = fondeadores.find((f) => f.id === alerta.fondeadorId)
            const credito = creditos.find((c) => c.id === alerta.creditoId)
            return (
              <Card key={alerta.creditoId} className={alerta.vencido ? "ring-destructive/60" : undefined}>
                <CardHeader>
                  <CardTitle className="font-mono text-lg">{alerta.creditoId}</CardTitle>
                  <CardDescription>{fondeador?.nombre}</CardDescription>
                  <CardAction>
                    <InsigniaPlazo alerta={alerta} />
                  </CardAction>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <dl className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Días de mora</dt>
                      <dd className="font-heading text-xl font-bold text-destructive tabular-nums">
                        {alerta.diasMora}
                        <span className="text-sm font-normal text-muted-foreground"> / {fondeador?.condiciones.moraMaximaDias}</span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Sustituir antes de</dt>
                      <dd className="font-medium">{formatoFecha(alerta.fechaLimite)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Saldo</dt>
                      <dd className="font-medium tabular-nums">{credito ? formatoPesos(credito.saldo, true) : "—"}</dd>
                    </div>
                  </dl>
                  <Button onClick={() => setAbierta(alerta)} className="self-start">
                    <Icono icon={ICONOS.sustitucion} data-icon="inline-start" />
                    Sustituir
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </section>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Sustituciones recientes</CardTitle>
          <CardDescription>El fondeador ve este mismo historial en su portal.</CardDescription>
        </CardHeader>
        <CardContent>
          {sustituciones.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no hay sustituciones.</p>
          ) : (
            <ul className="flex flex-col divide-y">
              {sustituciones.map((s) => (
                <li key={s.eventoId} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                  <span className="font-mono font-medium">
                    {s.creditoSalienteId} → {s.creditoEntranteId}
                  </span>
                  <span className="text-sm text-muted-foreground">{nombres.get(s.fondeadorId)}</span>
                  <span className="ml-auto flex items-center gap-3">
                    {s.dentroDelPlazo === null ? (
                      <Badge variant="outline">Sin plazo</Badge>
                    ) : s.dentroDelPlazo ? (
                      <Badge variant="exito">Dentro del plazo</Badge>
                    ) : (
                      <Badge variant="destructive">Fuera del plazo</Badge>
                    )}
                    <span className="text-xs whitespace-nowrap text-muted-foreground">{formatoFechaHora(s.fecha)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <PanelSustitucion key={abierta?.creditoId ?? "ninguna"} alerta={abierta} alCerrar={() => setAbierta(null)} />
    </>
  )
}
