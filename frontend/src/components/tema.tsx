"use client"

import { useCallback, useEffect, useLayoutEffect, useSyncExternalStore } from "react"

export type Tema = "claro" | "oscuro" | "sistema"

const CLAVE = "tema"

// Script que corre en <head> antes del primer pintado (ver layout.tsx), para
// que la página nunca parpadee con el tema equivocado. Debe hacer lo mismo
// que aplicarTema().
export const SCRIPT_TEMA = `(function(){try{var t=localStorage.getItem("${CLAVE}")||"sistema";var o=t==="oscuro"||(t==="sistema"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",o);document.documentElement.style.colorScheme=o?"dark":"light"}catch(e){}})()`

// Se envía en el HTML del servidor y se ejecuta antes del primer pintado. Si
// React lo vuelve a crear en el navegador (p. ej. al recargar en caliente), lo
// marca como dato ("text/plain"): ahí no hace falta ejecutarlo, porque
// SincronizarTema mantiene el tema, y así React no advierte por el <script>.
export function ScriptTema() {
  return (
    <script
      suppressHydrationWarning
      type={typeof window === "undefined" ? undefined : "text/plain"}
      dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }}
    />
  )
}

function leerTema(): Tema {
  try {
    const guardado = localStorage.getItem(CLAVE)
    if (guardado === "claro" || guardado === "oscuro") return guardado
  } catch {}
  return "sistema"
}

function aplicarTema(tema: Tema) {
  const oscuro =
    tema === "oscuro" ||
    (tema === "sistema" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  document.documentElement.classList.toggle("dark", oscuro)
  document.documentElement.style.colorScheme = oscuro ? "dark" : "light"
}

// Mantiene el tema aplicado: lo repone tras el remontaje de React en
// desarrollo y sigue los cambios del sistema cuando el tema es "sistema".
export function SincronizarTema() {
  useLayoutEffect(() => {
    aplicarTema(leerTema())
  }, [])

  useEffect(() => {
    const medio = window.matchMedia("(prefers-color-scheme: dark)")
    const alCambiar = () => {
      if (leerTema() === "sistema") aplicarTema("sistema")
    }
    medio.addEventListener("change", alCambiar)
    return () => medio.removeEventListener("change", alCambiar)
  }, [])

  return null
}

// Para el selector de tema de los portales. Se lee con useSyncExternalStore
// (en el servidor vale "sistema") para no desajustar la hidratación.
const EVENTO = "trazza:tema"

function suscribir(avisar: () => void) {
  window.addEventListener(EVENTO, avisar)
  window.addEventListener("storage", avisar)
  return () => {
    window.removeEventListener(EVENTO, avisar)
    window.removeEventListener("storage", avisar)
  }
}

export function useTema() {
  const tema = useSyncExternalStore<Tema>(suscribir, leerTema, () => "sistema")

  const setTema = useCallback((nuevo: Tema) => {
    try {
      localStorage.setItem(CLAVE, nuevo)
    } catch {}
    aplicarTema(nuevo)
    window.dispatchEvent(new Event(EVENTO))
  }, [])

  return { tema, setTema }
}
