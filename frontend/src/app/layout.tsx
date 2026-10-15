import type { Metadata } from "next"
import { cn } from "@/lib/utils"
import { ScriptTema, SincronizarTema } from "@/components/tema"
import { variablesDeFuentes } from "./fuentes"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "Trazza · Trazabilidad verificable para la cartera de crédito",
    template: "%s · Trazza",
  },
  description:
    "Registro verificable de asignaciones, mora y sustituciones de créditos entre fintechs y fondeadores, sobre la red Stellar.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // El script de <head> añade la clase "dark" antes de pintar; por eso
    // <html> puede diferir del HTML del servidor.
    <html
      lang="es"
      suppressHydrationWarning
      className={cn("h-full antialiased", ...variablesDeFuentes)}
    >
      <head>
        <ScriptTema />
      </head>
      <body className="flex min-h-full flex-col">
        <SincronizarTema />
        {children}
      </body>
    </html>
  )
}
