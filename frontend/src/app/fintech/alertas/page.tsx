import type { Metadata } from "next"
import { VistaAlertas } from "@/components/fintech/alertas/vista-alertas"
import { DemoLista } from "@/components/portal/demo-lista"

export const metadata: Metadata = { title: "Alertas" }

export default function AlertasFintech() {
  return (
    <DemoLista>
      <VistaAlertas />
    </DemoLista>
  )
}
