import type { Metadata } from "next"
import { DemoLista } from "@/components/portal/demo-lista"
import { VistaFondeadores } from "@/components/fintech/fondeadores/vista-fondeadores"

export const metadata: Metadata = { title: "Fondeadores" }

export default function FondeadoresFintech() {
  return (
    <DemoLista>
      <VistaFondeadores />
    </DemoLista>
  )
}
