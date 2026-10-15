import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google"

// Tipografía provisional de Trazza. Para cambiarla basta con reemplazar
// las familias aquí: el resto de la app solo usa las variables CSS.
const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

// Misma familia para títulos; el peso 800 se aplica donde se usa.
const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-display",
  display: "swap",
})

// Huellas (hashes) e identificadores.
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export const variablesDeFuentes = [sans.variable, display.variable, mono.variable]
