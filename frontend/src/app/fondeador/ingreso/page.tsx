import type { Metadata } from "next"
import { MarcoIngreso, VistaIngreso } from "@/components/fondeador/vista-ingreso"
import { DemoLista } from "@/components/portal/demo-lista"

export const metadata: Metadata = { title: "Ingreso del fondeador" }

export default function IngresoFondeador() {
  return (
    <MarcoIngreso>
      <DemoLista>
        <VistaIngreso />
      </DemoLista>
    </MarcoIngreso>
  )
}
