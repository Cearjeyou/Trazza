import type { Metadata } from "next"
import { EnConstruccion } from "@/components/en-construccion"

export const metadata: Metadata = { title: "Ingreso del fondeador" }

export default function IngresoFondeador() {
  return <EnConstruccion portal="del fondeador" />
}
