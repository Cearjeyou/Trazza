"use client"

import { useEffect, useState } from "react"
import { useReducedMotion } from "motion/react"
import { Icono, ICONOS } from "@/components/iconos"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/components/ui/toast"
import { abreviarHuella } from "@/lib/formato"
import { cn } from "@/lib/utils"

const HEX = "0123456789abcdef"

/**
 * Revela la huella como si se estuviera calculando: los caracteres cambian al
 * azar y se fijan de izquierda a derecha.
 */
function useRevelado(texto: string, activo: boolean) {
  const reducido = useReducedMotion()
  const animar = activo && !reducido
  const [visible, setVisible] = useState(animar ? "" : texto)

  useEffect(() => {
    if (!animar) return
    // setInterval y no requestAnimationFrame: en una pestaña en segundo plano
    // rAF se pausa y la huella se quedaría a medio revelar.
    const duracion = 700
    const inicio = performance.now()
    const intervalo = setInterval(() => {
      const fijos = Math.min(texto.length, Math.floor(((performance.now() - inicio) / duracion) * texto.length))
      let salida = texto.slice(0, fijos)
      for (let i = fijos; i < texto.length; i++) {
        salida += HEX[Math.floor(Math.random() * 16)]
      }
      setVisible(salida)
      if (fijos >= texto.length) clearInterval(intervalo)
    }, 30)
    return () => clearInterval(intervalo)
  }, [animar, texto])

  return animar ? visible || texto.replace(/./g, "·") : texto
}

export function Huella({
  valor,
  completa = false,
  revelar = false,
  className,
}: {
  valor: string
  /** Muestra los 64 caracteres en lugar de la versión abreviada. */
  completa?: boolean
  /** Anima la aparición, para huellas recién registradas. */
  revelar?: boolean
  className?: string
}) {
  const texto = completa ? valor : abreviarHuella(valor)
  const visible = useRevelado(texto, revelar)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(valor)
      toast.add({ type: "success", title: "Huella copiada", timeout: 2000 })
    } catch {
      toast.add({ type: "error", title: "No se pudo copiar la huella" })
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            onClick={copiar}
            className={cn(
              "inline-flex max-w-full items-center gap-1.5 rounded-md font-mono text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              completa && "break-all text-left",
              className,
            )}
            aria-label={`Copiar huella ${valor}`}
          />
        }
      >
        <Icono icon={ICONOS.huella} className="size-3.5 shrink-0" />
        <span>{visible}</span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs font-mono text-[11px] break-all">
        {valor}
        <br />
        <span className="font-sans">Clic para copiar</span>
      </TooltipContent>
    </Tooltip>
  )
}
