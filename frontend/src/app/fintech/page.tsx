import type { Metadata } from "next"
import { DemoLista } from "@/components/portal/demo-lista"
import { VistaResumen } from "@/components/fintech/resumen/vista-resumen"

export const metadata: Metadata = { title: "Resumen" }

export default function ResumenFintech() {
  return (
    <DemoLista>
      <VistaResumen />
    </DemoLista>
  )
}
