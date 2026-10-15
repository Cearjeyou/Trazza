"use client"

import { ThinkingOrb, type OrbState } from "thinking-orbs"
import { cn } from "@/lib/utils"

// Indicador de carga de los portales: Thinking Orbs en lugar del ícono
// giratorio de shadcn. "connecting" (una constelación que se conecta) es el
// que usamos para los registros en la red. Toma el tema de la clase "dark".
function Spinner({
  className,
  estado = "connecting",
  grande = false,
  etiqueta = "Cargando",
}: {
  className?: string
  estado?: OrbState
  /** 64 px en lugar de 20 px. */
  grande?: boolean
  etiqueta?: string
  "data-icon"?: string
}) {
  return (
    <ThinkingOrb
      data-slot="spinner"
      role="status"
      aria-label={etiqueta}
      state={estado}
      size={grande ? 64 : 20}
      color="#03b5aa"
      className={cn("shrink-0", className)}
    />
  )
}

export { Spinner }
