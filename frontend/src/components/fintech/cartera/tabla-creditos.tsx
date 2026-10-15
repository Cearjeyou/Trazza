"use client"

import { useMemo, useState } from "react"
import { useTable } from "@tanstack/react-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { Credito } from "@/lib/dominio/tipos"
import { formatoFecha, formatoPesos, plural } from "@/lib/formato"
import {
  NOMBRE_ESTADO,
  useAsignaciones,
  useCreditos,
  useEstadosCreditos,
  useNombresFondeadores,
  type EstadoCredito,
} from "@/lib/store/selectores"
import { Buscador } from "../buscador"
import { InsigniaEstado } from "../insignias"
import { columnas, funcionesTabla, TablaDatos } from "../tabla-datos"

interface Fila extends Credito {
  estado: EstadoCredito
  fondeador: string
}

const col = columnas<Fila>()
const COLUMNAS = col.columns([
  col.accessor("id", {
    header: "Crédito",
    cell: (c) => <span className="font-mono font-medium">{c.getValue()}</span>,
  }),
  col.accessor("sector", { header: "Sector" }),
  col.accessor("saldo", {
    header: "Saldo",
    cell: (c) => formatoPesos(c.getValue()),
    meta: { alinear: "fin" },
  }),
  col.accessor("diasMora", {
    header: "Días de mora",
    meta: { alinear: "fin" },
  }),
  col.accessor("estado", {
    header: "Estado",
    cell: (c) => <InsigniaEstado estado={c.getValue()} />,
  }),
  col.accessor("fondeador", {
    header: "Fondeador",
    cell: (c) => c.getValue() || <span className="text-muted-foreground">—</span>,
  }),
  col.accessor("fechaDesembolso", {
    header: "Desembolso",
    cell: (c) => formatoFecha(c.getValue()),
  }),
])

const FILTROS = ["todos", "al_dia", "en_mora", "sobre_limite", "sin_asignar"] as const

export function TablaCreditos() {
  const creditos = useCreditos()
  const asignaciones = useAsignaciones()
  const estados = useEstadosCreditos()
  const nombres = useNombresFondeadores()
  const [busqueda, setBusqueda] = useState("")
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]>("todos")

  const filas = useMemo<Fila[]>(
    () =>
      creditos
        .map((c) => ({
          ...c,
          estado: estados.get(c.id) ?? "sin_asignar",
          fondeador: nombres.get(asignaciones[c.id]?.fondeadorId ?? "") ?? "",
        }))
        .filter((f) => filtro === "todos" || f.estado === filtro),
    [creditos, estados, nombres, asignaciones, filtro],
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
        <CardTitle>Créditos</CardTitle>
        <CardDescription>
          {plural(creditos.length, "crédito")} en la cartera. El estado depende de la mora máxima de su fondeador.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Buscador valor={busqueda} alCambiar={setBusqueda} placeholder="Buscar crédito, sector o fondeador" />
          <ToggleGroup
            aria-label="Filtrar por estado"
            variant="outline"
            size="sm"
            value={[filtro]}
            onValueChange={(v) => v[0] && setFiltro(v[0] as (typeof FILTROS)[number])}
            className="flex-wrap"
          >
            {FILTROS.map((f) => (
              <ToggleGroupItem key={f} value={f}>
                {f === "todos" ? "Todos" : NOMBRE_ESTADO[f]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <TablaDatos table={table} etiqueta="Créditos de la cartera" vacio="Ningún crédito coincide con la búsqueda." />
      </CardContent>
    </Card>
  )
}
