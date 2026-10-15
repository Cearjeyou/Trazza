"use client"

import { motion } from "motion/react"
import { Icono, ICONOS } from "@/components/iconos"
import { cn } from "@/lib/utils"
import { Huella } from "./huella"

/**
 * Una fila de resultado de un registro en la red: aceptado con su huella, que
 * aparece como si se calculara, o rechazado con una sacudida en Rosewood.
 */
export function ResultadoRegistro({
  titulo,
  detalle,
  huella,
  rechazado = false,
  indice = 0,
}: {
  titulo: string
  detalle: string
  huella?: string
  rechazado?: boolean
  indice?: number
}) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      animate={rechazado ? { opacity: 1, y: 0, x: [0, -9, 9, -6, 6, -3, 0] } : { opacity: 1, y: 0 }}
      transition={{ delay: indice * 0.12, duration: rechazado ? 0.5 : 0.25 }}
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl border px-4 py-3",
        rechazado && "border-destructive/60 bg-destructive/10",
      )}
    >
      <Icono
        icon={rechazado ? ICONOS.rechazado : ICONOS.correcto}
        className={cn("size-5 shrink-0", rechazado ? "text-destructive" : "text-chart-2")}
      />
      <div className="min-w-0 flex-1">
        <p className="font-medium">{titulo}</p>
        <p className={cn("text-sm", rechazado ? "text-destructive" : "text-muted-foreground")}>{detalle}</p>
      </div>
      {huella && <Huella valor={huella} revelar />}
    </motion.li>
  )
}
