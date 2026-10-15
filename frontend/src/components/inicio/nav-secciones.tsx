"use client"

import { useLayoutEffect, useRef } from "react"
import { animate, motion, useMotionValue, useTransform } from "motion/react"
import { cn } from "@/lib/utils"
import { SECCIONES } from "./datos"

// Resortes de cada borde del óvalo: el de adelante es rápido y el de atrás
// lento, así que al cambiar de opción el óvalo se estira como un líquido y
// luego se recoge sobre la nueva.
const BORDE_RAPIDO = { type: "spring", stiffness: 520, damping: 38 } as const
const BORDE_LENTO = { type: "spring", stiffness: 180, damping: 24 } as const

export function NavSecciones({ activa }: { activa: string }) {
  const lista = useRef<HTMLUListElement>(null)
  const enlaces = useRef(new Map<string, HTMLAnchorElement>())
  const izquierda = useMotionValue(0)
  const derecha = useMotionValue(0)
  const ancho = useTransform(() => derecha.get() - izquierda.get())
  const colocado = useRef(false)

  useLayoutEffect(() => {
    const enlace = enlaces.current.get(activa)
    if (!enlace || !lista.current) return

    const caja = lista.current.getBoundingClientRect()
    const destino = enlace.getBoundingClientRect()
    const nuevaIzquierda = destino.left - caja.left
    const nuevaDerecha = destino.right - caja.left
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    // Primera vez o movimiento reducido: sin animación.
    if (!colocado.current || reducido) {
      izquierda.set(nuevaIzquierda)
      derecha.set(nuevaDerecha)
      colocado.current = true
      return
    }

    const haciaLaDerecha = nuevaIzquierda > izquierda.get()
    const animaciones = [
      animate(izquierda, nuevaIzquierda, haciaLaDerecha ? BORDE_LENTO : BORDE_RAPIDO),
      animate(derecha, nuevaDerecha, haciaLaDerecha ? BORDE_RAPIDO : BORDE_LENTO),
    ]
    return () => animaciones.forEach((a) => a.stop())
  }, [activa, izquierda, derecha])

  // Si cambia el ancho de la ventana, recoloca el óvalo sin animar.
  useLayoutEffect(() => {
    const recolocar = () => {
      const enlace = enlaces.current.get(activa)
      if (!enlace || !lista.current) return
      const caja = lista.current.getBoundingClientRect()
      const destino = enlace.getBoundingClientRect()
      izquierda.set(destino.left - caja.left)
      derecha.set(destino.right - caja.left)
    }
    window.addEventListener("resize", recolocar)
    return () => window.removeEventListener("resize", recolocar)
  }, [activa, izquierda, derecha])

  return (
    <ul ref={lista} className="relative hidden items-center gap-1 lg:flex">
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 rounded-full border border-marca-lima/60"
        style={{ left: izquierda, width: ancho }}
      />
      {SECCIONES.map(({ id, nombre }) => (
        <li key={id}>
          <a
            ref={(elemento) => {
              if (elemento) enlaces.current.set(id, elemento)
              else enlaces.current.delete(id)
            }}
            href={`#${id}`}
            aria-current={activa === id ? "true" : undefined}
            className={cn(
              "relative block rounded-full px-4 py-2 text-sm font-medium transition-colors",
              activa === id ? "text-white" : "text-white/70 hover:text-white"
            )}
          >
            {nombre}
          </a>
        </li>
      ))}
    </ul>
  )
}
