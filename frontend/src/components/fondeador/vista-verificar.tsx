"use client"

import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { describirEvento } from "@/components/fintech/evento"
import { Huella } from "@/components/fintech/huella"
import { Icono, ICONOS } from "@/components/iconos"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { serializarEstable } from "@/lib/dominio/huella"
import type { ContenidoEvento, Evento } from "@/lib/dominio/tipos"
import { abreviarHuella, formatoEntero, formatoFechaHora } from "@/lib/formato"
import {
  verificarEvento,
  verificarExclusividad,
  type ResultadoExclusividad,
  type ResultadoVerificacion,
} from "@/lib/ledger/verificacion"
import { useEventos, useLedgerConsulta, useNombresFondeadores } from "@/lib/store/selectores"
import { cn } from "@/lib/utils"
import { useFondeadorActivo } from "./marco-fondeador"

// Pausa entre pasos para que se lea cada uno; la consulta real a la red
// también tardará.
const PAUSA = 700

const ETIQUETAS: Record<string, string> = {
  fecha: "Fecha del registro",
  creditoId: "Crédito",
  fondeadorId: "Fondeador",
  saldo: "Saldo",
  diasMora: "Días de mora",
  diasMoraAnterior: "Días de mora anteriores",
  creditoSalienteId: "Crédito que sale",
  creditoEntranteId: "Crédito que entra",
  motivo: "Motivo",
}

function contenidoDe(evento: Evento): ContenidoEvento {
  return structuredClone({ id: evento.id, fecha: evento.fecha, datos: evento.datos })
}

function creditoAsignado(contenido: ContenidoEvento) {
  const { datos } = contenido
  return datos.tipo === "sustitucion" ? datos.creditoEntranteId : datos.creditoId
}

function Paso({
  numero,
  titulo,
  children,
}: {
  numero: number
  titulo: string
  children: React.ReactNode
}) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-4"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent font-heading font-bold text-accent-foreground">
        {numero}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1">
        <p className="font-medium">{titulo}</p>
        {children}
      </div>
    </motion.li>
  )
}

export function VistaVerificar() {
  const fondeador = useFondeadorActivo()
  const eventos = useEventos()
  const nombres = useNombresFondeadores()
  const ledger = useLedgerConsulta()
  const pedido = useSearchParams().get("evento")

  const mios = fondeador ? eventos.filter((e) => e.datos.fondeadorId === fondeador.id).toReversed() : []
  const inicial = mios.find((e) => e.id === pedido) ?? mios[0]

  const [eventoId, setEventoId] = useState(inicial?.id ?? "")
  const evento = mios.find((e) => e.id === eventoId)
  const [contenido, setContenido] = useState<ContenidoEvento | null>(inicial ? contenidoDe(inicial) : null)
  const [paso, setPaso] = useState(0)
  const [verificacion, setVerificacion] = useState<ResultadoVerificacion | null>(null)
  const [exclusividad, setExclusividad] = useState<ResultadoExclusividad | null>(null)

  if (!fondeador) return null
  if (!evento || !contenido) {
    return (
      <Alert>
        <Icono icon={ICONOS.info} />
        <AlertTitle>Aún no hay registros a tu nombre</AlertTitle>
        <AlertDescription>Cuando la fintech te asigne créditos, podrás verificarlos aquí.</AlertDescription>
      </Alert>
    )
  }

  const alterado = serializarEstable(contenido) !== serializarEstable(contenidoDe(evento))

  function reiniciarPasos() {
    setPaso(0)
    setVerificacion(null)
    setExclusividad(null)
  }

  function elegir(id: string) {
    const nuevo = mios.find((e) => e.id === id)
    if (!nuevo) return
    setEventoId(id)
    setContenido(contenidoDe(nuevo))
    reiniciarPasos()
  }

  function editar(clave: string, valor: string) {
    setContenido((actual) => {
      if (!actual) return actual
      const copia = structuredClone(actual)
      if (clave === "fecha") copia.fecha = valor
      else {
        const datos = copia.datos as unknown as Record<string, unknown>
        datos[clave] = typeof datos[clave] === "number" ? Number(valor) : valor
      }
      return copia
    })
    reiniciarPasos()
  }

  async function verificar() {
    if (!contenido || !fondeador) return
    const espera = () => new Promise((r) => setTimeout(r, PAUSA))
    reiniciarPasos()
    setPaso(1)
    const resultado = await verificarEvento(contenido, ledger)
    setVerificacion(resultado)
    await espera()
    setPaso(2)
    await espera()
    setPaso(3)
    await espera()
    setExclusividad(await verificarExclusividad(creditoAsignado(contenido), fondeador.id, ledger))
    setPaso(4)
  }

  const campos: [string, string | number][] = [
    ["fecha", contenido.fecha],
    ...Object.entries(contenido.datos).filter(
      (entrada): entrada is [string, string | number] =>
        entrada[0] !== "tipo" && (typeof entrada[1] === "string" || typeof entrada[1] === "number"),
    ),
  ]

  return (
    <div className="grid items-start gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>1. Elige un registro</CardTitle>
          <CardDescription>
            Estos son los datos que la fintech te muestra. Cámbialos si quieres: así ves que cualquier
            alteración deja de coincidir con la red.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <Field>
            <FieldLabel htmlFor="evento">Registro</FieldLabel>
            <Select
              value={eventoId}
              onValueChange={(v) => v && elegir(v)}
              items={mios.map((e) => ({ value: e.id, label: `${e.id} · ${describirEvento(e, nombres)}` }))}
            >
              <SelectTrigger id="evento" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {mios.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.id} · {describirEvento(e, nombres)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <FieldDescription>Registrado el {formatoFechaHora(evento.fecha)}</FieldDescription>
          </Field>

          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            {campos.map(([clave, valor]) => (
              <Field key={clave}>
                <FieldLabel htmlFor={`campo-${clave}`}>{ETIQUETAS[clave] ?? clave}</FieldLabel>
                <Input
                  id={`campo-${clave}`}
                  type={typeof valor === "number" ? "number" : "text"}
                  value={valor}
                  onChange={(e) => editar(clave, e.target.value)}
                  className="font-mono"
                />
              </Field>
            ))}
          </FieldGroup>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Texto que se resume en la huella</p>
            <pre className="max-h-40 overflow-auto rounded-xl bg-muted p-3 font-mono text-xs break-all whitespace-pre-wrap">
              {serializarEstable(contenido)}
            </pre>
          </div>
        </CardContent>
        <CardFooter className="flex-wrap justify-between gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setContenido(contenidoDe(evento))
              reiniciarPasos()
            }}
            disabled={!alterado}
          >
            <Icono icon={ICONOS.reiniciar} data-icon="inline-start" />
            Restaurar datos
          </Button>
          <Button onClick={verificar} disabled={paso > 0 && paso < 4}>
            <Icono icon={ICONOS.huella} data-icon="inline-start" />
            Verificar
          </Button>
        </CardFooter>
      </Card>

      <Card className="xl:sticky xl:top-28">
        <CardHeader>
          <CardTitle>2. Comprueba con la red</CardTitle>
          <CardDescription>
            Trazza no te pide confiar: recalculas la huella con los datos y la comparas con la que quedó
            publicada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paso === 0 ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icono icon={ICONOS.info} className="size-4" />
              {alterado
                ? "Cambiaste datos. Pulsa Verificar para ver qué pasa."
                : "Pulsa Verificar para empezar."}
            </p>
          ) : (
            <ol className="flex flex-col gap-5" aria-live="polite">
              <AnimatePresence>
                {paso >= 1 && (
                  <Paso key="calcular" numero={1} titulo="Calculas la huella SHA-256 de estos datos">
                    {verificacion ? (
                      <Huella valor={verificacion.calculada} completa revelar />
                    ) : (
                      <Spinner estado="working" etiqueta="Calculando la huella" />
                    )}
                  </Paso>
                )}
                {paso >= 2 && verificacion && (
                  <Paso key="consultar" numero={2} titulo="Consultas la huella publicada en la red">
                    {verificacion.publicado ? (
                      <>
                        <Huella valor={verificacion.publicado.huella} completa />
                        <p className="font-mono text-xs text-muted-foreground">
                          ledger #{formatoEntero(verificacion.publicado.ledger)} · tx{" "}
                          {abreviarHuella(verificacion.publicado.txHash, 8)}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-destructive">No hay ningún registro publicado con ese id.</p>
                    )}
                  </Paso>
                )}
                {paso >= 3 && verificacion && (
                  <Paso key="comparar" numero={3} titulo="Comparas las dos">
                    <Alert
                      variant={verificacion.coincide ? "default" : "destructive"}
                      className={cn(verificacion.coincide && "ring-chart-2/50")}
                    >
                      <Icono icon={verificacion.coincide ? ICONOS.correcto : ICONOS.rechazado} />
                      <AlertTitle>{verificacion.coincide ? "Coinciden" : "No coinciden"}</AlertTitle>
                      <AlertDescription>
                        {verificacion.coincide
                          ? "Los datos son exactamente los que se registraron. Nadie los cambió después."
                          : "Estos datos no son los que se registraron en la red. Algo cambió después del registro."}
                      </AlertDescription>
                    </Alert>
                  </Paso>
                )}
                {paso >= 3 && (
                  <Paso key="exclusividad" numero={4} titulo="Confirmas que el crédito es solo tuyo">
                    {exclusividad ? (
                      <p className={cn("text-sm", exclusividad.exclusivo ? "text-foreground" : "text-muted-foreground")}>
                        {exclusividad.exclusivo
                          ? `El contrato tiene ${creditoAsignado(contenido)} asignado a ${fondeador.nombre} y a ningún otro fondeador.`
                          : exclusividad.asignadoA
                            ? `Hoy el contrato tiene ${creditoAsignado(contenido)} asignado a ${nombres.get(exclusividad.asignadoA) ?? exclusividad.asignadoA}.`
                            : `El contrato no tiene ${creditoAsignado(contenido)} asignado a ti ni a ningún otro fondeador.`}
                      </p>
                    ) : (
                      <Spinner estado="connecting" etiqueta="Consultando el contrato" />
                    )}
                  </Paso>
                )}
              </AnimatePresence>
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
