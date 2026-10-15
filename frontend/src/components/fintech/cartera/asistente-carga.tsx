"use client"

import { useMemo, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
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
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "@/components/ui/toast"
import { COLUMNAS, compararCartera, leerCartera, type ResultadoCartera } from "@/lib/dominio/cartera"
import type { Evento } from "@/lib/dominio/tipos"
import { formatoEntero, plural } from "@/lib/formato"
import { useAsignaciones, useCreditos, useNombresFondeadores } from "@/lib/store/selectores"
import { useDemo } from "@/lib/store/store"
import { cn } from "@/lib/utils"
import { describirEvento } from "../evento"
import { Huella } from "../huella"

const PASOS = ["Subir archivo", "Revisar columnas", "Validar filas", "Confirmar"] as const

const EJEMPLOS = [
  {
    archivo: "/ejemplo-cartera.csv",
    nombre: "Cartera completa",
    descripcion: "Los 15 créditos actuales más 10 nuevos.",
  },
  {
    archivo: "/ejemplo-cartera-mora.csv",
    nombre: "Nuevo corte de mora",
    descripcion: "La mora avanza: genera eventos y alertas nuevas.",
  },
]

function Pasos({ actual }: { actual: number }) {
  return (
    <ol className="flex flex-wrap gap-2" aria-label="Pasos de la carga">
      {PASOS.map((paso, i) => (
        <li
          key={paso}
          aria-current={i === actual ? "step" : undefined}
          className={cn(
            "flex items-center gap-2 rounded-full border px-3 py-1 text-sm",
            i === actual && "border-primary bg-primary text-primary-foreground",
            i < actual && "text-muted-foreground",
          )}
        >
          <span className="flex size-5 items-center justify-center rounded-full bg-background/20 text-xs font-bold tabular-nums">
            {i < actual ? <Icono icon={ICONOS.marca} className="size-3.5" /> : i + 1}
          </span>
          {paso}
        </li>
      ))}
    </ol>
  )
}

export function AsistenteCarga() {
  const creditos = useCreditos()
  const asignaciones = useAsignaciones()
  const nombres = useNombresFondeadores()
  const cargarCartera = useDemo((s) => s.cargarCartera)

  const [paso, setPaso] = useState(0)
  const [archivo, setArchivo] = useState<string | null>(null)
  const [lectura, setLectura] = useState<ResultadoCartera | null>(null)
  const [arrastrando, setArrastrando] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [eventos, setEventos] = useState<Evento[] | null>(null)

  const comparacion = useMemo(
    () => (lectura ? compararCartera(creditos, lectura.creditos) : null),
    [creditos, lectura],
  )
  const moraAsignados = comparacion?.cambiosMora.filter((c) => asignaciones[c.creditoId]) ?? []

  function leer(nombre: string, texto: string) {
    setArchivo(nombre)
    setLectura(leerCartera(texto))
    setEventos(null)
    setPaso(1)
  }

  async function leerArchivo(file: File | undefined) {
    if (!file) return
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.add({ type: "error", title: "Ese archivo no es un CSV" })
      return
    }
    leer(file.name, await file.text())
  }

  async function usarEjemplo(ruta: string) {
    const respuesta = await fetch(ruta)
    leer(ruta.slice(1), await respuesta.text())
  }

  async function confirmar() {
    if (!lectura) return
    setCargando(true)
    let resultado
    try {
      resultado = await cargarCartera(lectura.creditos)
    } catch {
      toast.add({ type: "error", title: "No se pudo cargar la cartera", description: "Inténtalo de nuevo." })
      return
    } finally {
      setCargando(false)
    }
    setEventos(resultado.eventosMora)
    toast.add({
      type: "success",
      title: "Cartera cargada",
      description: `${plural(resultado.nuevos, "crédito nuevo", "créditos nuevos")}, ${plural(resultado.actualizados, "actualizado", "actualizados")} y ${plural(resultado.eventosMora.length, "evento", "eventos")} en la red.`,
    })
  }

  function reiniciar() {
    setPaso(0)
    setArchivo(null)
    setLectura(null)
    setEventos(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cargar cartera</CardTitle>
        <CardDescription>
          Sube el archivo con el identificador anónimo, saldo y días de mora de cada crédito. Si
          cambia la mora de un crédito asignado, el cambio queda registrado en la red.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <Pasos actual={eventos ? 4 : paso} />

        {paso === 0 && (
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <label
              onDragOver={(e) => {
                e.preventDefault()
                setArrastrando(true)
              }}
              onDragLeave={() => setArrastrando(false)}
              onDrop={(e) => {
                e.preventDefault()
                setArrastrando(false)
                void leerArchivo(e.dataTransfer.files[0])
              }}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition-colors hover:border-ring hover:bg-accent/40 focus-within:border-ring",
                arrastrando && "border-ring bg-accent/60",
              )}
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <Icono icon={ICONOS.cartera} className="size-6" />
              </span>
              <span className="font-medium">Arrastra tu archivo CSV o haz clic para elegirlo</span>
              <span className="text-sm text-muted-foreground">
                Separado por comas o por punto y coma, como lo exporta Excel.
              </span>
              <input
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                onChange={(e) => {
                  void leerArchivo(e.target.files?.[0])
                  e.target.value = ""
                }}
              />
            </label>
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">¿No tienes un archivo? Prueba con uno de ejemplo:</p>
              {EJEMPLOS.map((ejemplo) => (
                <div key={ejemplo.archivo} className="flex items-center gap-3 rounded-2xl border p-3">
                  <Icono icon={ICONOS.csv} className="size-6 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{ejemplo.nombre}</p>
                    <p className="text-sm text-muted-foreground">{ejemplo.descripcion}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Descargar ${ejemplo.nombre}`}
                    nativeButton={false}
                    render={<a href={ejemplo.archivo} download />}
                  >
                    <Icono icon={ICONOS.descargar} />
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => usarEjemplo(ejemplo.archivo)}>
                    Usar
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {paso === 1 && lectura && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-mono text-foreground">{archivo}</span> ·{" "}
              {plural(lectura.creditos.length + new Set(lectura.errores.filter((e) => e.columna).map((e) => e.linea)).size, "fila")} de datos
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {COLUMNAS.map((c) => {
                const falta = lectura.columnasFaltantes.includes(c.clave)
                return (
                  <div
                    key={c.clave}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-3 py-2",
                      falta && "border-destructive/50 bg-destructive/10",
                    )}
                  >
                    <Icono
                      icon={falta ? ICONOS.rechazado : ICONOS.correcto}
                      className={cn("size-4 shrink-0", falta ? "text-destructive" : "text-chart-2")}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{c.nombre}</p>
                      <p className="truncate font-mono text-xs text-muted-foreground">{c.clave}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            {lectura.columnasIgnoradas.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Se ignorarán: {lectura.columnasIgnoradas.map((c) => (
                  <Badge key={c} variant="outline" className="mr-1 font-mono">{c}</Badge>
                ))}
              </p>
            )}
            {lectura.columnasFaltantes.length > 0 && (
              <Alert variant="destructive">
                <Icono icon={ICONOS.rechazado} />
                <AlertTitle>Faltan columnas</AlertTitle>
                <AlertDescription>
                  Agrega {lectura.columnasFaltantes.join(", ")} al archivo y vuelve a subirlo.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {paso === 2 && lectura && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="exito">{plural(lectura.creditos.length, "fila válida", "filas válidas")}</Badge>
              {lectura.errores.length > 0 && (
                <Badge variant="destructive">{plural(lectura.errores.length, "error", "errores")}</Badge>
              )}
            </div>
            {lectura.errores.length === 0 ? (
              <Alert>
                <Icono icon={ICONOS.correcto} />
                <AlertTitle>Todo en orden</AlertTitle>
                <AlertDescription>Todas las filas tienen datos válidos.</AlertDescription>
              </Alert>
            ) : (
              <div className="max-h-72 overflow-auto rounded-xl border">
                <Table aria-label="Errores del archivo">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Línea</TableHead>
                      <TableHead className="w-40">Columna</TableHead>
                      <TableHead>Problema</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lectura.errores.map((e, i) => (
                      <TableRow key={i}>
                        <TableCell className="tabular-nums">{e.linea}</TableCell>
                        <TableCell className="font-mono text-xs">{e.columna ?? "—"}</TableCell>
                        <TableCell>{e.mensaje}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {lectura.errores.length > 0 && lectura.creditos.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Puedes continuar solo con las filas válidas o corregir el archivo y subirlo otra vez.
              </p>
            )}
          </div>
        )}

        {paso === 3 && comparacion && !eventos && (
          <div className="flex flex-col gap-4">
            <dl className="grid gap-3 sm:grid-cols-3">
              {[
                ["Créditos nuevos", comparacion.nuevos.length],
                ["Créditos actualizados", comparacion.actualizados.length],
                ["Sin cambios", comparacion.sinCambios.length],
              ].map(([etiqueta, valor]) => (
                <div key={etiqueta} className="rounded-2xl border p-4">
                  <dt className="text-sm text-muted-foreground">{etiqueta}</dt>
                  <dd className="font-heading text-2xl font-bold tabular-nums">{formatoEntero(Number(valor))}</dd>
                </div>
              ))}
            </dl>
            {moraAsignados.length > 0 ? (
              <Alert>
                <Icono icon={ICONOS.red} />
                <AlertTitle>
                  Se registrarán {plural(moraAsignados.length, "cambio", "cambios")} de mora en la red
                </AlertTitle>
                <AlertDescription>
                  {moraAsignados.map((c) => `${c.creditoId} (${c.antes} → ${c.despues} días)`).join(", ")}
                </AlertDescription>
              </Alert>
            ) : (
              <p className="text-sm text-muted-foreground">
                Ningún crédito asignado cambia de mora: no se registrará nada en la red.
              </p>
            )}
          </div>
        )}

        <AnimatePresence>
          {eventos && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-3"
            >
              <Alert>
                <Icono icon={ICONOS.correcto} />
                <AlertTitle>Carga terminada</AlertTitle>
                <AlertDescription>
                  {eventos.length === 0
                    ? "No hubo cambios de mora en créditos asignados."
                    : `Quedaron registrados ${plural(eventos.length, "evento", "eventos")} de mora con su huella.`}
                </AlertDescription>
              </Alert>
              {eventos.length > 0 && (
                <ul className="flex flex-col divide-y rounded-2xl border">
                  {eventos.map((evento) => (
                    <li key={evento.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
                      <span className="font-mono text-xs text-muted-foreground">{evento.id}</span>
                      <span className="min-w-0 flex-1 font-medium">{describirEvento(evento, nombres)}</span>
                      <Huella valor={evento.huella} revelar />
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      {paso > 0 && (
        <CardFooter className="justify-between gap-2">
          {eventos ? (
            <Button variant="outline" onClick={reiniciar}>
              Cargar otro archivo
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => (paso === 1 ? reiniciar() : setPaso(paso - 1))} disabled={cargando}>
                <Icono icon={ICONOS.anterior} data-icon="inline-start" />
                {paso === 1 ? "Elegir otro archivo" : "Atrás"}
              </Button>
              {paso < 3 ? (
                <Button
                  onClick={() => setPaso(paso + 1)}
                  disabled={!lectura || lectura.columnasFaltantes.length > 0 || (paso === 2 && lectura.creditos.length === 0)}
                >
                  {paso === 2 && lectura && lectura.errores.length > 0
                    ? `Continuar con ${plural(lectura.creditos.length, "fila", "filas")}`
                    : "Continuar"}
                  <Icono icon={ICONOS.siguiente} data-icon="inline-end" />
                </Button>
              ) : (
                <Button onClick={confirmar} disabled={cargando}>
                  {cargando && <Spinner etiqueta="Registrando en la red" />}
                  {cargando ? "Registrando en la red…" : "Confirmar carga"}
                </Button>
              )}
            </>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
