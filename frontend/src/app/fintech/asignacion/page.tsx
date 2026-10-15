import type { Metadata } from "next"
import { VistaAsignacion } from "@/components/fintech/asignacion/vista-asignacion"
import { DemoLista } from "@/components/portal/demo-lista"

export const metadata: Metadata = { title: "Asignación" }

export default function AsignacionFintech() {
  return (
    <DemoLista>
      <VistaAsignacion />
    </DemoLista>
  )
}
