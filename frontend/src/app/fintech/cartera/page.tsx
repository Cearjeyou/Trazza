import type { Metadata } from "next"
import { DemoLista } from "@/components/portal/demo-lista"
import { AsistenteCarga } from "@/components/fintech/cartera/asistente-carga"
import { TablaCreditos } from "@/components/fintech/cartera/tabla-creditos"

export const metadata: Metadata = { title: "Cartera" }

export default function CarteraFintech() {
  return (
    <DemoLista>
      <AsistenteCarga />
      <TablaCreditos />
    </DemoLista>
  )
}
