"use client"

import { useSyncExternalStore } from "react"

// Sesión del portal del fondeador: qué fondeador de la demo entró. Vive en
// sessionStorage, así que se cierra con la pestaña. Por ahora no se pide
// passkey; cuando se conecte, este módulo seguirá siendo el punto de entrada.

const CLAVE = "trazza-fondeador"
const EVENTO = "trazza:sesion"

function leer() {
  try {
    return sessionStorage.getItem(CLAVE)
  } catch {
    return null
  }
}

function suscribir(avisar: () => void) {
  window.addEventListener(EVENTO, avisar)
  return () => window.removeEventListener(EVENTO, avisar)
}

/**
 * Id del fondeador con sesión, null si no hay sesión, o undefined mientras no
 * se sepa (en el servidor y antes de hidratar).
 */
export function useSesionFondeador(): string | null | undefined {
  return useSyncExternalStore<string | null | undefined>(suscribir, leer, () => undefined)
}

export function entrarComo(fondeadorId: string) {
  try {
    sessionStorage.setItem(CLAVE, fondeadorId)
  } catch {}
  window.dispatchEvent(new Event(EVENTO))
}

export function salir() {
  try {
    sessionStorage.removeItem(CLAVE)
  } catch {}
  window.dispatchEvent(new Event(EVENTO))
}
