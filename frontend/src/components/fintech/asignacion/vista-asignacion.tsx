"use client"

import { useMemo, useState } from "react"
import { useTable, type RowSelectionState } from "@tanstack/react-table"
import { Icono, ICONOS } from "@/components/iconos"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { creditosDe, resumenFondeador } from "@/lib/dominio/reglas"
import type { Credito } from "@/lib/dominio/tipos"
import { formatoPesos, plural } from "@/lib/formato"
import {
  useAsignaciones,
  useCreditos,
  useFondeadores,
  useNombresFondeadores,
} from "@/lib/store/selectores"
import type { ResultadoAsignacion } from "@/lib/store/operaciones"
import { useDemo } from "@/lib/store/store"
import { BarraLimite } from "../barra-limite"
import { Buscador } from "../buscador"
import { ResultadoRegistro } from "../resultado-registro"
import { columnas, funcionesTabla, TablaDatos } from "../tabla-datos"

interface Fila extends Credito {
  /** Nombre del fondeador que ya lo tiene, o "" si está libre. */
  duenoActual: string
}

const col = columnas<Fila>()
const COLUMNAS = col.columns([
  col.display({
    id: "seleccion",
    header: ({ table }) => (
      <Checkbox
        aria-label="Seleccionar todos"
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onCheckedChange={(v) => table.toggleAllRowsSelected(!!v)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={`Seleccionar ${row.original.id}`}
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
      />
    ),
    meta: { ancho: "2.5rem" },
  }),
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
  col.accessor("diasMora", { header: "Días de mora", meta: { alinear: "fin" } }),
  col.accessor("duenoActual", {
    header: "Situación",
    cell: (c) =>
      c.getValue() ? (
        <Badge variant="outline">De {c.getValue()}</Badge>
      ) : (
        <Badge variant="exito">Libre</Badge>
      ),
  }),
])

export function VistaAsignacion() {
  const fondeadores = useFondeadores()
  const creditos = useCreditos()
  const asignaciones = useAsignaciones()
  const nombres = useNombresFondeadores()
  const asignar = useDemo((s) => s.asignar)

  const [fondeadorId, setFondeadorId] = useState(fondeadores[0]?.id ?? "")
  const [seleccion, setSeleccion] = useState<RowSelectionState>({})
  const [busqueda, setBusqueda] = useState("")
  const [registrando, setRegistrando] = useState(false)
  const [resultados, setResultados] = useState<ResultadoAsignacion[] | null>(null)

  const fondeador = fondeadores.find((f) => f.id === fondeadorId)

  // Libres primero; también aparecen los de otros fondeadores para mostrar
  // que el contrato los rechaza.
  const filas = useMemo<Fila[]>(
    () =>
      creditos
        .filter((c) => asignaciones[c.id]?.fondeadorId !== fondeadorId)
        .map((c) => ({ ...c, duenoActual: nombres.get(asignaciones[c.id]?.fondeadorId ?? "") ?? "" }))
        .sort((a, b) => Number(!!a.duenoActual) - Number(!!b.duenoActual) || a.id.localeCompare(b.id)),
    [creditos, asignaciones, fondeadorId, nombres],
  )

  const table = useTable({
    features: funcionesTabla,
    columns: COLUMNAS,
    data: filas,
    getRowId: (f) => f.id,
    state: { rowSelection: seleccion, globalFilter: busqueda },
    onRowSelectionChange: setSeleccion,
    onGlobalFilterChange: setBusqueda,
    globalFilterFn: "includesString",
  })

  const elegidos = filas.filter((f) => seleccion[f.id])
  const libres = elegidos.filter((f) => !f.duenoActual)
  const ajenos = elegidos.filter((f) => f.duenoActual)

  const actuales = fondeador ? creditosDe(fondeador.id, creditos, asignaciones) : []
  const antes = fondeador ? resumenFondeador(fondeador, actuales) : null
  const despues = fondeador ? resumenFondeador(fondeador, [...actuales, ...libres]) : null

  function cambiarFondeador(id: string) {
    setFondeadorId(id)
    setSeleccion({})
    setResultados(null)
  }

  async function registrar() {
    if (!fondeador || elegidos.length === 0) return
    setRegistrando(true)
    setResultados(null)
    let r
    try {
      r = await asignar(fondeador.id, elegidos.map((e) => e.id))
    } catch {
      toast.add({ type: "error", title: "No se pudo registrar la asignación", description: "Inténtalo de nuevo." })
      return
    } finally {
      setRegistrando(false)
    }
    // Los rechazos primero: son lo que hay que mirar.
    setResultados([...r].sort((a, b) => Number(a.ok) - Number(b.ok)))
    setSeleccion({})
    const aceptados = r.filter((x) => x.ok).length
    const rechazados = r.length - aceptados
    toast.add({
      type: rechazados > 0 ? "warning" : "success",
      title: rechazados > 0 ? "Asignación registrada con rechazos" : "Asignación registrada",
      description: `${plural(aceptados, "crédito registrado", "créditos registrados")}${rechazados > 0 ? `, ${plural(rechazados, "rechazado", "rechazados")} por el contrato` : ""}.`,
    })
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[1fr_22rem]">
      <Card>
        <CardHeader>
          <CardTitle>Elige los créditos</CardTitle>
          <CardDescription>
            Cada crédito se registra por separado. Si ya pertenece a otro fondeador, el contrato rechaza
            el registro: así se evita el doble fondeo.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Field className="sm:max-w-xs">
              <FieldLabel htmlFor="fondeador">Fondeador</FieldLabel>
              <Select
                value={fondeadorId}
                onValueChange={(v) => v && cambiarFondeador(v)}
                items={fondeadores.map((f) => ({ value: f.id, label: f.nombre }))}
              >
                <SelectTrigger id="fondeador" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {fondeadores.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.nombre}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Buscador valor={busqueda} alCambiar={setBusqueda} placeholder="Buscar crédito o sector" className="sm:ml-auto" />
          </div>
          <TablaDatos
            table={table}
            etiqueta="Créditos disponibles para asignar"
            vacio="No hay créditos que coincidan."
            claseFila={(f) => (f.duenoActual ? "text-muted-foreground" : undefined)}
          />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 xl:sticky xl:top-28 xl:max-h-[calc(100svh-8rem)] xl:overflow-y-auto xl:pb-1">
        {fondeador && antes && despues && (
          <Card>
            <CardHeader>
              <CardTitle>Así quedaría {fondeador.nombre}</CardTitle>
              <CardDescription>
                {plural(antes.numeroCreditos, "crédito")} hoy
                {libres.length > 0 && ` → ${plural(despues.numeroCreditos, "crédito")}`} ·{" "}
                {formatoPesos(despues.saldoTotal, true)}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <BarraLimite
                etiqueta="Crédito más grande"
                valor={despues.concentracion.maximaPct}
                limite={fondeador.condiciones.concentracionMaximaPct}
              />
              <BarraLimite
                etiqueta="Saldo en mora"
                valor={despues.moraCarteraPct}
                limite={fondeador.condiciones.moraMaximaCarteraPct}
              />
              {libres.length > 0 && !despues.concentracion.cumple && (
                <Alert>
                  <Icono icon={ICONOS.alertas} />
                  <AlertTitle>Supera la concentración</AlertTitle>
                  <AlertDescription>
                    {despues.concentracion.creditoMayorId} pesaría más del{" "}
                    {fondeador.condiciones.concentracionMaximaPct} % acordado. Agrega más créditos o
                    elige otros.
                  </AlertDescription>
                </Alert>
              )}
              {ajenos.length > 0 && (
                <Alert variant="destructive">
                  <Icono icon={ICONOS.rechazado} />
                  <AlertTitle>{plural(ajenos.length, "crédito ya tiene", "créditos ya tienen")} fondeador</AlertTitle>
                  <AlertDescription>
                    {ajenos.map((a) => a.id).join(", ")}. El contrato rechazará esos registros.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={registrar} disabled={registrando || elegidos.length === 0}>
                {registrando && <Spinner etiqueta="Registrando en la red" />}
                {registrando
                  ? "Registrando en la red…"
                  : elegidos.length === 0
                    ? "Selecciona créditos"
                    : `Registrar ${plural(elegidos.length, "asignación", "asignaciones")}`}
              </Button>
            </CardFooter>
          </Card>
        )}

        {resultados && (
          <Card size="sm">
            <CardHeader>
              <CardTitle>Resultado del registro</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2">
                {resultados.map((r, i) =>
                  r.ok ? (
                    <ResultadoRegistro
                      key={r.creditoId}
                      indice={i}
                      titulo={r.creditoId}
                      detalle={`Registrado en el ledger #${r.evento.registro.ledger}`}
                      huella={r.evento.huella}
                    />
                  ) : (
                    <ResultadoRegistro
                      key={r.creditoId}
                      indice={i}
                      rechazado
                      titulo={r.creditoId}
                      detalle={
                        r.error === "asignado_a_otro"
                          ? `Rechazado por el contrato: ya pertenece a ${nombres.get(r.asignadoA ?? "") ?? r.asignadoA}.`
                          : "Rechazado por el contrato."
                      }
                    />
                  ),
                )}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
