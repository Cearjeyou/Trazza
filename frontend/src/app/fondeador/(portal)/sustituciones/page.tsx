import type { Metadata } from "next"
import { VistaSustituciones } from "@/components/fondeador/vista-sustituciones"
import { DemoLista } from "@/components/portal/demo-lista"

export const metadata: Metadata = { title: "Sustituciones" }

export default function Sustituciones() {
  return (
    <DemoLista>
      <VistaSustituciones />
    </DemoLista>
  )
}
