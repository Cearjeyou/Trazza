"use client"

import Link from "next/link"
import { Huella } from "@/components/fintech/huella"
import { Icono, ICONOS } from "@/components/iconos"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import type { MotivoSustitucion, Sustitucion } from "@/lib/dominio/tipos"
import { formatoFechaHora, plural } from "@/lib/formato"
import { listarSustituciones } from "@/lib/store/operaciones"
import { useEventos } from "@/lib/store/selectores"
import { BotonVerificar } from "./boton-verificar"
import { useFondeadorActivo } from "./marco-fondeador"

const MOTIVO: Record<MotivoSustitucion, string> = {
  mora: "Mora",
  prepago: "Prepago",
  otro: "Otro motivo",
}

function InsigniaPlazo({ s }: { s: Sustitucion }) {
  if (s.dentroDelPlazo === null) return <Badge variant="outline">No aplica plazo</Badge>
  return s.dentroDelPlazo ? (
    <Badge variant="exito">
      <Icono icon={ICONOS.correcto} data-icon="inline-start" />
      Dentro del plazo
    </Badge>
  ) : (
    <Badge variant="destructive">
      <Icono icon={ICONOS.rechazado} data-icon="inline-start" />
      Fuera del plazo
    </Badge>
  )
}

function EnlaceCredito({ id }: { id: string }) {
  return (
    <Link href={`/fondeador/creditos/${id}`} className="font-mono font-medium underline-offset-4 hover:underline">
      {id}
    </Link>
  )
}

export function VistaSustituciones() {
  const fondeador = useFondeadorActivo()
  const eventos = useEventos()
  if (!fondeador) return null

  const sustituciones = listarSustituciones(eventos, fondeador.id)
  const porId = new Map(eventos.map((e) => [e.id, e]))
  const fuera = sustituciones.filter((s) => s.dentroDelPlazo === false).length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de sustituciones</CardTitle>
        <CardDescription>
          {sustituciones.length === 0
            ? "La fintech no ha sustituido ninguno de tus créditos."
            : `${plural(sustituciones.length, "sustitución", "sustituciones")}${fuera > 0 ? `, ${fuera} fuera del plazo de ${plural(fondeador.condiciones.plazoSustitucionDias, "día")}` : `, todas dentro del plazo de ${plural(fondeador.condiciones.plazoSustitucionDias, "día")}`}. Cada una quedó registrada en la red: verifícala.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sustituciones.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Icono icon={ICONOS.sustitucion} />
              </EmptyMedia>
              <EmptyTitle>Sin sustituciones</EmptyTitle>
              <EmptyDescription>Cuando la fintech cambie uno de tus créditos, aparecerá aquí.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="flex flex-col gap-3">
            {sustituciones.map((s) => {
              const evento = porId.get(s.eventoId)
              return (
                <li key={s.eventoId} className="flex flex-col gap-3 rounded-2xl border p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-2 text-lg">
                      <EnlaceCredito id={s.creditoSalienteId} />
                      <Icono icon={ICONOS.siguiente} className="size-4 text-muted-foreground" />
                      <EnlaceCredito id={s.creditoEntranteId} />
                    </span>
                    <Badge variant="secondary">{MOTIVO[s.motivo]}</Badge>
                    <InsigniaPlazo s={s} />
                    <span className="ml-auto text-sm text-muted-foreground">{formatoFechaHora(s.fecha)}</span>
                  </div>
                  {evento && (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <Huella valor={evento.huella} />
                      <BotonVerificar evento={evento} />
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
