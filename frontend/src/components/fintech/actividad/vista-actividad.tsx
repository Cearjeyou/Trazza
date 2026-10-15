"use client"

import { useMemo, useState } from "react"
import { useTable } from "@tanstack/react-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { TipoEvento } from "@/lib/dominio/tipos"
import { abreviarHuella, formatoEntero, formatoFechaHora, plural } from "@/lib/formato"
import { useEventos, useNombresFondeadores } from "@/lib/store/selectores"
import { Buscador } from "../buscador"
import { describirEvento } from "../evento"
import { Huella } from "../huella"
import { InsigniaRed, InsigniaTipo, NOMBRE_TIPO } from "../insignias"
import { columnas, funcionesTabla, TablaDatos } from "../tabla-datos"

interface Fila {
  id: string
  fecha: string
  tipo: TipoEvento
  detalle: string
  fondeador: string
  huella: string
  ledger: number
  txHash: string
}

const col = columnas<Fila>()
const COLUMNAS = col.columns([
  col.accessor("fecha", {
    header: "Fecha",
    cell: (c) => <span className="whitespace-nowrap tabular-nums">{formatoFechaHora(c.getValue())}</span>,
  }),
  col.accessor("tipo", {
    header: "Tipo",
    cell: (c) => <InsigniaTipo tipo={c.getValue()} />,
  }),
  // El valor reúne detalle, fondeador e id para que la búsqueda los encuentre.
  col.accessor((f) => `${f.detalle} ${f.fondeador} ${f.id}`, {
    id: "detalle",
    header: "Detalle",
    cell: (c) => (
      <span className="flex flex-col">
        <span className="font-medium">{c.row.original.detalle}</span>
        <span className="text-xs text-muted-foreground">
          {c.row.original.id} · {c.row.original.fondeador}
        </span>
      </span>
    ),
  }),
  col.accessor("huella", {
    header: "Huella",
    enableSorting: false,
    cell: (c) => <Huella valor={c.getValue()} />,
  }),
  col.accessor("ledger", {
    header: "En la red",
    cell: (c) => (
      <span className="flex flex-col items-start gap-1">
        <InsigniaRed />
        <span className="font-mono text-xs text-muted-foreground" title={c.row.original.txHash}>
          #{formatoEntero(c.getValue())} · tx {abreviarHuella(c.row.original.txHash, 4)}
        </span>
      </span>
    ),
  }),
])

const FILTROS = ["todos", "asignacion", "mora", "sustitucion"] as const

export function VistaActividad() {
  const eventos = useEventos()
  const nombres = useNombresFondeadores()
  const [busqueda, setBusqueda] = useState("")
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]>("todos")

  const filas = useMemo<Fila[]>(
    () =>
      eventos
        .filter((e) => filtro === "todos" || e.datos.tipo === filtro)
        .map((e) => ({
          id: e.id,
          fecha: e.fecha,
          tipo: e.datos.tipo,
          detalle: describirEvento(e, nombres),
          fondeador: nombres.get(e.datos.fondeadorId) ?? e.datos.fondeadorId,
          huella: e.huella,
          ledger: e.registro.ledger,
          txHash: e.registro.txHash,
        }))
        .reverse(),
    [eventos, nombres, filtro],
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Eventos registrados</CardTitle>
        <CardDescription>
          {plural(eventos.length, "evento")}. En la red solo se publica la huella: ningún dato personal de los deudores.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Buscador valor={busqueda} alCambiar={setBusqueda} placeholder="Buscar crédito, fondeador o huella" />
          <ToggleGroup
            aria-label="Filtrar por tipo"
            variant="outline"
            size="sm"
            value={[filtro]}
            onValueChange={(v) => v[0] && setFiltro(v[0] as (typeof FILTROS)[number])}
            className="flex-wrap"
          >
            {FILTROS.map((f) => (
              <ToggleGroupItem key={f} value={f}>
                {f === "todos" ? "Todos" : NOMBRE_TIPO[f]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <TablaDatos table={table} etiqueta="Eventos registrados en la red" vacio="Ningún evento coincide con la búsqueda." />
      </CardContent>
    </Card>
  )
}
