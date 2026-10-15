import type { Metadata } from "next"
import { Suspense } from "react"
import { VistaVerificar } from "@/components/fondeador/vista-verificar"
import { DemoLista } from "@/components/portal/demo-lista"

export const metadata: Metadata = { title: "Verificar" }

export default function Verificar() {
  return (
    <DemoLista>
      {/* useSearchParams (?evento=) necesita un límite de Suspense. */}
      <Suspense>
        <VistaVerificar />
      </Suspense>
    </DemoLista>
  )
}
