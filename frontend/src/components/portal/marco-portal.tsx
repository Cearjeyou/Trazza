"use client"

import { Movimiento } from "@/components/inicio/movimiento"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toast"
import { TooltipProvider } from "@/components/ui/tooltip"
import { BarraLateral } from "./barra-lateral"
import { BarraSuperior } from "./barra-superior"
import type { Portal } from "./navegacion"

// Estructura común de los dos portales: barra lateral, barra superior y el
// contenido. Cada página envuelve su vista en DemoLista para esperar los datos.
export function MarcoPortal({
  portal,
  otroPortal,
  insignias,
  sesion,
  children,
}: {
  portal: Portal
  otroPortal: { href: string; nombre: string }
  insignias?: Record<string, number>
  sesion?: { nombre: string; alSalir: () => void }
  children: React.ReactNode
}) {
  return (
    <Movimiento>
      <TooltipProvider>
        <Toaster>
          <SidebarProvider>
            <BarraLateral portal={portal} otroPortal={otroPortal} insignias={insignias} sesion={sesion} />
            <SidebarInset className="min-w-0">
              <BarraSuperior portal={portal} />
              {/* SidebarInset ya es el <main> de la página. */}
              <div className="flex flex-1 flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
                {children}
              </div>
            </SidebarInset>
          </SidebarProvider>
        </Toaster>
      </TooltipProvider>
    </Movimiento>
  )
}
