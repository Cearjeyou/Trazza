import type { Metadata } from "next"
import { Suspense } from "react"
import { VistaCredito } from "@/components/fondeador/vista-credito"
import { DemoLista } from "@/components/portal/demo-lista"

export const metadata: Metadata = { title: "Historial del crédito" }

export default function HistorialCredito() {
  return (
    <DemoLista>
      {/* useParams lee el id de la URL: necesita un límite de Suspense. */}
      <Suspense>
        <VistaCredito />
      </Suspense>
    </DemoLista>
  )
}
