"use client"

import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  metaHelper,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  tableFeatures,
  type ReactTable,
  type RowData,
} from "@tanstack/react-table"
import { Icono, ICONOS } from "@/components/iconos"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

// Mismas capacidades para todas las tablas de los portales: ordenar, buscar y
// seleccionar filas.
export const funcionesTabla = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic },
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: filterFn_includesString },
  rowSelectionFeature,
  columnMeta: metaHelper<{ alinear?: "fin"; ancho?: string }>(),
})

export type FuncionesTabla = typeof funcionesTabla

export function columnas<T extends RowData>() {
  return createColumnHelper<FuncionesTabla, T>()
}

export function TablaDatos<T extends RowData>({
  table,
  vacio = "No hay filas que mostrar.",
  claseFila,
  etiqueta,
}: {
  table: ReactTable<FuncionesTabla, T>
  vacio?: string
  claseFila?: (fila: T) => string | undefined
  etiqueta: string
}) {
  const filas = table.getRowModel().rows

  return (
    <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
      <Table aria-label={etiqueta}>
        <TableHeader>
          {table.getHeaderGroups().map((grupo) => (
            <TableRow key={grupo.id} className="hover:bg-transparent">
              {grupo.headers.map((header) => {
                const meta = header.column.columnDef.meta
                const orden = header.column.getIsSorted()
                return (
                  <TableHead
                    key={header.id}
                    style={meta?.ancho ? { width: meta.ancho } : undefined}
                    className={cn(meta?.alinear === "fin" && "text-right")}
                    aria-sort={orden === "asc" ? "ascending" : orden === "desc" ? "descending" : undefined}
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className={cn(
                          "-mx-1 inline-flex items-center gap-1 rounded-md px-1 py-0.5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                          meta?.alinear === "fin" && "flex-row-reverse",
                        )}
                      >
                        <table.FlexRender header={header} />
                        <Icono
                          icon={
                            orden === "asc"
                              ? ICONOS.ascendente
                              : orden === "desc"
                                ? ICONOS.descendente
                                : ICONOS.ordenar
                          }
                          className={cn("size-3.5", !orden && "opacity-40")}
                        />
                      </button>
                    ) : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {filas.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={table.getAllLeafColumns().length}>
                <Empty className="py-10">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Icono icon={ICONOS.buscar} />
                    </EmptyMedia>
                    <EmptyTitle>Sin resultados</EmptyTitle>
                    <EmptyDescription>{vacio}</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </TableCell>
            </TableRow>
          ) : (
            filas.map((fila) => (
              <TableRow
                key={fila.id}
                data-state={fila.getIsSelected() ? "selected" : undefined}
                className={claseFila?.(fila.original)}
              >
                {fila.getAllCells().map((celda) => (
                  <TableCell
                    key={celda.id}
                    className={cn(celda.column.columnDef.meta?.alinear === "fin" && "text-right tabular-nums")}
                  >
                    <table.FlexRender cell={celda} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
