import Image from "next/image"
import { cn } from "@/lib/utils"

type LogoProps = {
  // "oscuro" usa la versión pensada para fondos oscuros.
  fondo?: "claro" | "oscuro"
  // Alto del símbolo en píxeles.
  tamano?: number
  conNombre?: boolean
  className?: string
}

// Único punto de uso del logo: al llegar el SVG definitivo solo se
// reemplazan los archivos de /public.
export function Logo({
  fondo = "claro",
  tamano = 32,
  conNombre = true,
  className,
}: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src={fondo === "oscuro" ? "/logo-oscuro.svg" : "/logo.svg"}
        alt={conNombre ? "" : "Trazza"}
        width={tamano}
        height={tamano}
        priority
      />
      {conNombre && (
        <span
          className="font-heading text-xl font-extrabold tracking-tight"
          style={{ fontSize: tamano * 0.62 }}
        >
          Trazza
        </span>
      )}
    </span>
  )
}
