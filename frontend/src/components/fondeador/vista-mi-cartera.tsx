"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { useTable } from "@tanstack/react-table"
import { BarraLimite } from "@/components/fintech/barra-limite"
import { Buscador } from "@/components/fintech/buscador"
import { InsigniaEstado } from "@/components/fintech/insignias"
import { columnas, funcionesTabla, TablaDatos } from "@/components/fintech/tabla-datos"
import { Icono, ICONOS } from "@/components/iconos"
import { Indicador } from "@/components/portal/indicador"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { creditosDe, resumenFondeador } from "@/lib/dominio/reglas"
import type { Credito } from "@/lib/dominio/tipos"
import { formatoFecha, formatoPct, formatoPesos, plural } from "@/lib/formato"
import {
  useAlertas,
  useAsignaciones,
  useCreditos,
  useEstadosCreditos,
  type EstadoCredito,
} from "@/lib/store/selectores"
import { useFondeadorActivo } from "./marco-fondeador"

interface Fila extends Credito {
  estado: EstadoCredito
  desde: string
}

const col = columnas<Fila>()
const COLUMNAS = col.columns([
  col.accessor("id", {
    header: "Crédito",
    cell: (c) => <span className="font-mono font-medium">{c.getValue()}</span>,
  }),
  col.accessor("sector", { header: "Sector" }),
  col.accessor("saldo", { header: "Saldo", cell: (c) => formatoPesos(c.getValue()), meta: { alinear: "fin" } }),
  col.accessor("diasMora", { header: "Días de mora", meta: { alinear: "fin" } }),
  col.accessor("estado", { header: "Estado", cell: (c) => <InsigniaEstado estado={c.getValue()} /> }),
  col.accessor("desde", { header: "Asignado desde", cell: (c) => formatoFecha(c.getValue()) }),
  col.display({
    id: "historial",
    header: () => <span className="sr-only">Historial</span>,
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        render={<Link href={`/fondeador/creditos/${row.original.id}`} />}
        aria-label={`Ver historial de ${row.original.id}`}
      >
        Historial
        <Icono icon={ICONOS.siguiente} data-icon="inline-end" />
      </Button>
    ),
    meta: { alinear: "fin" },
  }),
])

export function VistaMiCartera() {
  const fondeador = useFondeadorActivo()
  const creditos = useCreditos()
  const asignaciones = useAsignaciones()
  const estados = useEstadosCreditos()
  const alertas = useAlertas()
  const [busqueda, setBusqueda] = useState("")

  const propios = useMemo(
    () => (fondeador ? creditosDe(fondeador.id, creditos, asignaciones) : []),
    [fondeador, creditos, asignaciones],
  )
  const filas = useMemo<Fila[]>(
    () =>
      propios.map((c) => ({
        ...c,
        estado: estados.get(c.id) ?? "al_dia",
        desde: asignaciones[c.id]?.fecha ?? "",
      })),
    [propios, estados, asignaciones],
  )

  const table = useTable({
    features: funcionesTabla,
    columns: COLUMNAS,
    data: filas,
    getRowId: (f) => f.id,
    state: { globalFilter: busqueda },
    onGlobalFilterChange: setBusqueda,
    globalFilterFn: "includesString",
  })

  if (!fondeador) return null
  const { condiciones } = fondeador
  const resumen = resumenFondeador(fondeador, propios)
  const misAlertas = alertas.filter((a) => a.fondeadorId === fondeador.id)

  return (
    <>
      <section aria-label="Indicadores" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Indicador
          titulo="Saldo invertido"
          valor={formatoPesos(resumen.saldoTotal, true)}
          detalle={plural(resumen.numeroCreditos, "crédito")}
          icono={ICONOS.saldo}
        />
        <Indicador
          titulo="Crédito más grande"
          valor={formatoPct(resumen.concentracion.maximaPct)}
          detalle={`Tu límite: ${formatoPct(condiciones.concentracionMaximaPct, 0)}`}
          icono={ICONOS.resumen}
          destacado={!resumen.concentracion.cumple}
        />
        <Indicador
          titulo="Saldo en mora"
          valor={formatoPct(resumen.moraCarteraPct)}
          detalle={`Tu límite: ${formatoPct(condiciones.moraMaximaCarteraPct, 0)}`}
          icono={ICONOS.reloj}
          destacado={!resumen.cumpleMoraCartera}
        />
        <Indicador
          titulo="Créditos por sustituir"
          valor={String(misAlertas.length)}
          detalle={`Superan ${plural(condiciones.moraMaximaDias, "día")} de mora`}
          icono={ICONOS.alertas}
          destacado={misAlertas.length > 0}
        />
      </section>

      <section aria-label="Cumplimiento" className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tus condiciones</CardTitle>
            <CardDescription>Lo que acordaste con la fintech y cómo va hoy tu cartera.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <BarraLimite
              etiqueta="Crédito más grande"
              valor={resumen.concentracion.maximaPct}
              limite={condiciones.concentracionMaximaPct}
            />
            <BarraLimite
              etiqueta="Saldo en mora"
              valor={resumen.moraCarteraPct}
              limite={condiciones.moraMaximaCarteraPct}
            />
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Mora máxima por crédito</dt>
                <dd className="font-medium">{plural(condiciones.moraMaximaDias, "día")}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Plazo para sustituir</dt>
                <dd className="font-medium">{plural(condiciones.plazoSustitucionDias, "día")}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Créditos que la fintech debe sustituir</CardTitle>
            <CardDescription>
              Superan tu mora máxima. La fintech tiene {plural(condiciones.plazoSustitucionDias, "día")} para cambiarlos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {misAlertas.length === 0 ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icono icon={ICONOS.correcto} className="size-4 text-chart-2" />
                Ninguno de tus créditos supera la mora máxima.
              </p>
            ) : (
              <ul className="flex flex-col divide-y">
                {misAlertas.map((a) => (
                  <li key={a.creditoId} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                    <Link href={`/fondeador/creditos/${a.creditoId}`} className="font-mono font-medium underline-offset-4 hover:underline">
                      {a.creditoId}
                    </Link>
                    <span className="text-sm text-muted-foreground">{a.diasMora} días de mora</span>
                    <span className="ml-auto">
                      {a.vencido ? (
                        <Badge variant="destructive">Plazo vencido el {formatoFecha(a.fechaLimite)}</Badge>
                      ) : (
                        <Badge variant="aviso">Plazo hasta el {formatoFecha(a.fechaLimite)}</Badge>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Tus créditos</CardTitle>
          <CardDescription>
            Cada crédito tiene su historial con las huellas registradas en la red.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Buscador valor={busqueda} alCambiar={setBusqueda} placeholder="Buscar crédito o sector" />
          <TablaDatos table={table} etiqueta="Tus créditos" vacio="Aún no tienes créditos asignados." />
        </CardContent>
      </Card>
    </>
  )
}
