"use client"

import { useMemo, useSyncExternalStore } from "react"
import {
  alertasDeMora,
  creditosDe,
  resumenFondeador,
} from "@/lib/dominio/reglas"
import type { Credito, Fondeador } from "@/lib/dominio/tipos"
import { useDemo } from "./store"

// Hooks de lectura para los portales. Cada uno se suscribe solo a los trozos
// del estado que usa y memoriza lo que calcula.

let hoyDeSesion: Date | null = null
const sinCambios = () => () => {}

/**
 * Fecha de corte de la sesión: fija mientras la página esté abierta. En el
 * servidor vale null; los datos de la demo solo existen en el navegador.
 */
export function useHoy() {
  return useSyncExternalStore(
    sinCambios,
    () => (hoyDeSesion ??= new Date()),
    () => null,
  )
}

export function useFondeadores() {
  return useDemo((s) => s.fondeadores)
}

export function useCreditos() {
  return useDemo((s) => s.creditos)
}

export function useAsignaciones() {
  return useDemo((s) => s.asignaciones)
}

export function useEventos() {
  return useDemo((s) => s.eventos)
}

export function useNombresFondeadores() {
  const fondeadores = useFondeadores()
  return useMemo(
    () => new Map(fondeadores.map((f) => [f.id, f.nombre])),
    [fondeadores],
  )
}

export function useAlertas() {
  const fondeadores = useFondeadores()
  const creditos = useCreditos()
  const asignaciones = useAsignaciones()
  const hoy = useHoy()
  return useMemo(
    () => (hoy ? alertasDeMora(fondeadores, creditos, asignaciones, hoy) : []),
    [fondeadores, creditos, asignaciones, hoy],
  )
}

export interface FondeadorConResumen {
  fondeador: Fondeador
  creditos: Credito[]
  resumen: ReturnType<typeof resumenFondeador>
}

export function useResumenes(): FondeadorConResumen[] {
  const fondeadores = useFondeadores()
  const creditos = useCreditos()
  const asignaciones = useAsignaciones()
  return useMemo(
    () =>
      fondeadores.map((fondeador) => {
        const propios = creditosDe(fondeador.id, creditos, asignaciones)
        return { fondeador, creditos: propios, resumen: resumenFondeador(fondeador, propios) }
      }),
    [fondeadores, creditos, asignaciones],
  )
}

export type EstadoCredito = "al_dia" | "en_mora" | "sobre_limite" | "sin_asignar"

export const NOMBRE_ESTADO: Record<EstadoCredito, string> = {
  al_dia: "Al día",
  en_mora: "En mora",
  sobre_limite: "Sobre el límite",
  sin_asignar: "Sin asignar",
}

/** Estado de cada crédito según la mora máxima de su fondeador. */
export function useEstadosCreditos() {
  const fondeadores = useFondeadores()
  const creditos = useCreditos()
  const asignaciones = useAsignaciones()
  return useMemo(() => {
    const porId = new Map(fondeadores.map((f) => [f.id, f]))
    const estados = new Map<string, EstadoCredito>()
    for (const c of creditos) {
      const fondeador = porId.get(asignaciones[c.id]?.fondeadorId ?? "")
      if (!fondeador) estados.set(c.id, "sin_asignar")
      else if (c.diasMora > fondeador.condiciones.moraMaximaDias) estados.set(c.id, "sobre_limite")
      else if (c.diasMora > 0) estados.set(c.id, "en_mora")
      else estados.set(c.id, "al_dia")
    }
    return estados
  }, [fondeadores, creditos, asignaciones])
}
