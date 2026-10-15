import type { Metadata } from "next"
import { VistaMiCartera } from "@/components/fondeador/vista-mi-cartera"
import { DemoLista } from "@/components/portal/demo-lista"

export const metadata: Metadata = { title: "Mi cartera" }

export default function MiCartera() {
  return (
    <DemoLista>
      <VistaMiCartera />
    </DemoLista>
  )
}
