"use client"

import { useMemo, useState } from "react"
import { Icono, ICONOS } from "@/components/iconos"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  candidatosSustitucion,
  creditosDe,
  evaluarConcentracion,
  type AlertaMora,
} from "@/lib/dominio/reglas"
import type { MotivoSustitucion } from "@/lib/dominio/tipos"
import { formatoPct, formatoPesos } from "@/lib/formato"
import type { ResultadoSustitucion } from "@/lib/store/operaciones"
import { useAsignaciones, useCreditos, useFondeadores } from "@/lib/store/selectores"
import { useDemo } from "@/lib/store/store"
import { cn } from "@/lib/utils"
import { ResultadoRegistro } from "../resultado-registro"

const MOTIVOS: { valor: MotivoSustitucion; nombre: string }[] = [
  { valor: "mora", nombre: "Mora" },
  { valor: "prepago", nombre: "Prepago" },
  { valor: "otro", nombre: "Otro" },
]

export function PanelSustitucion({
  alerta,
  alCerrar,
}: {
  alerta: AlertaMora | null
  alCerrar: () => void
}) {
  const fondeadores = useFondeadores()
  const creditos = useCreditos()
  const asignaciones = useAsignaciones()
  const sustituir = useDemo((s) => s.sustituir)

  const [entranteId, setEntranteId] = useState<string | null>(null)
  const [motivo, setMotivo] = useState<MotivoSustitucion>("mora")
  const [registrando, setRegistrando] = useState(false)
  const [resultado, setResultado] = useState<{ r: ResultadoSustitucion; saliente: string; entrante: string } | null>(null)

  // El padre conserva la alerta que abrió el panel aunque, tras sustituir, ya
  // no esté en el estado; y lo remonta con otra key al abrir otra alerta.
  const actual = alerta

  const fondeador = fondeadores.find((f) => f.id === actual?.fondeadorId)
  const saliente = creditos.find((c) => c.id === actual?.creditoId)

  const candidatos = useMemo(() => {
    if (!fondeador || !saliente || resultado) return []
    const propios = creditosDe(fondeador.id, creditos, asignaciones)
    return candidatosSustitucion(saliente, fondeador, creditos, asignaciones).map((c) => ({
      credito: c,
      concentracion: evaluarConcentracion(
        [...propios.filter((p) => p.id !== saliente.id), c],
        fondeador.condiciones.concentracionMaximaPct,
      ).maximaPct,
    }))
  }, [fondeador, saliente, creditos, asignaciones, resultado])

  async function confirmar() {
    if (!fondeador || !saliente || !entranteId) return
    setRegistrando(true)
    let r
    try {
      r = await sustituir({
        fondeadorId: fondeador.id,
        creditoSalienteId: saliente.id,
        creditoEntranteId: entranteId,
        motivo,
      })
    } catch {
      toast.add({ type: "error", title: "No se pudo registrar la sustitución", description: "Inténtalo de nuevo." })
      return
    } finally {
      setRegistrando(false)
    }
    setResultado({ r, saliente: saliente.id, entrante: entranteId })
    if (r.ok) {
      toast.add({
        type: "success",
        title: "Sustitución registrada",
        description: `${saliente.id} salió de ${fondeador.nombre}; entró ${entranteId}.`,
      })
    }
  }

  return (
    <Sheet open={alerta !== null} onOpenChange={(abierto) => !abierto && alCerrar()}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Sustituir {actual?.creditoId}</SheetTitle>
          <SheetDescription>
            {fondeador?.nombre}: el crédito tiene {actual?.diasMora} días de mora y el máximo es{" "}
            {fondeador?.condiciones.moraMaximaDias}.{" "}
            {actual && (actual.vencido ? "El plazo para sustituirlo ya venció." : `Quedan ${actual.diasRestantes} días de plazo.`)}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6">
          {resultado ? (
            <ul className="flex flex-col gap-2">
              {resultado.r.ok ? (
                <ResultadoRegistro
                  titulo={`${resultado.saliente} → ${resultado.entrante}`}
                  detalle={
                    resultado.r.evento.datos.tipo === "sustitucion" && resultado.r.evento.datos.dentroDelPlazo === false
                      ? `Registrada en el ledger #${resultado.r.evento.registro.ledger}, fuera del plazo acordado.`
                      : `Registrada en el ledger #${resultado.r.evento.registro.ledger}.`
                  }
                  huella={resultado.r.evento.huella}
                />
              ) : (
                <ResultadoRegistro
                  rechazado
                  titulo={`${resultado.saliente} → ${resultado.entrante}`}
                  detalle="El registro fue rechazado. Elige otro crédito."
                />
              )}
            </ul>
          ) : (
            <>
              <Field>
                <FieldLabel>Motivo</FieldLabel>
                <ToggleGroup
                  aria-label="Motivo de la sustitución"
                  variant="outline"
                  value={[motivo]}
                  onValueChange={(v) => v[0] && setMotivo(v[0] as MotivoSustitucion)}
                >
                  {MOTIVOS.map((m) => (
                    <ToggleGroupItem key={m.valor} value={m.valor}>
                      {m.nombre}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </Field>

              <div className="flex flex-col gap-3">
                <div>
                  <p className="font-medium">Créditos elegibles</p>
                  <p className="text-sm text-muted-foreground">
                    Libres, al día y sin romper la concentración de {fondeador?.condiciones.concentracionMaximaPct} %.
                    Primero los de saldo más parecido a {saliente ? formatoPesos(saliente.saldo) : ""}.
                  </p>
                </div>
                {candidatos.length === 0 ? (
                  <Empty className="border">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Icono icon={ICONOS.cartera} />
                      </EmptyMedia>
                      <EmptyTitle>No hay candidatos</EmptyTitle>
                      <EmptyDescription>Carga más créditos al día en la cartera para poder sustituir.</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  <ul role="radiogroup" aria-label="Crédito que entra" className="flex flex-col gap-2">
                    {candidatos.map(({ credito, concentracion }) => {
                      const elegido = entranteId === credito.id
                      return (
                        <li key={credito.id}>
                          <button
                            type="button"
                            role="radio"
                            aria-checked={elegido}
                            onClick={() => setEntranteId(credito.id)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                              elegido && "border-primary bg-muted",
                            )}
                          >
                            <span
                              className={cn(
                                "flex size-4 shrink-0 items-center justify-center rounded-full border",
                                elegido && "border-primary",
                              )}
                            >
                              {elegido && <span className="size-2 rounded-full bg-primary" />}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block font-mono font-medium">{credito.id}</span>
                              <span className="block text-sm text-muted-foreground">{credito.sector}</span>
                            </span>
                            <span className="text-right">
                              <span className="block font-medium tabular-nums">{formatoPesos(credito.saldo)}</span>
                              <span className="block text-xs text-muted-foreground">
                                Crédito más grande: {formatoPct(concentracion)}
                              </span>
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>

        <SheetFooter className="flex-row justify-end">
          {resultado ? (
            <Button onClick={alCerrar}>Listo</Button>
          ) : (
            <>
              <Button variant="outline" onClick={alCerrar} disabled={registrando}>
                Cancelar
              </Button>
              <Button onClick={confirmar} disabled={!entranteId || registrando}>
                {registrando && <Spinner etiqueta="Registrando en la red" />}
                {registrando ? "Registrando en la red…" : "Registrar sustitución"}
              </Button>
            </>
          )}
        </SheetFooter>
        {motivo !== "mora" && !resultado && (
          <p className="px-6 pb-4 text-xs text-muted-foreground">
            <Badge variant="outline" className="mr-1">Nota</Badge>
            Solo las sustituciones por mora se miden contra el plazo acordado.
          </p>
        )}
      </SheetContent>
    </Sheet>
  )
}
