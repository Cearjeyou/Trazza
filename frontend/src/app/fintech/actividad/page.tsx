import type { Metadata } from "next"
import { VistaActividad } from "@/components/fintech/actividad/vista-actividad"
import { DemoLista } from "@/components/portal/demo-lista"

export const metadata: Metadata = { title: "Actividad" }

export default function ActividadFintech() {
  return (
    <DemoLista>
      <VistaActividad />
    </DemoLista>
  )
}
