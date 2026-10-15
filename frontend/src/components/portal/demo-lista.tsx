"use client"

import { useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useDemo } from "@/lib/store/store"

// Los datos de la demo viven en el navegador: hasta leerlos (o crear la
// semilla) se muestra un esqueleto, igual en el servidor y en el cliente.
export function DemoLista({ children }: { children: React.ReactNode }) {
  const listo = useDemo((s) => s.listo)
  const inicializar = useDemo((s) => s.inicializar)

  useEffect(() => {
    void inicializar()
  }, [inicializar])

  if (!listo) {
    return (
      <div className="flex flex-col gap-6" aria-busy="true" aria-label="Cargando la demo">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    )
  }
  return children
}
