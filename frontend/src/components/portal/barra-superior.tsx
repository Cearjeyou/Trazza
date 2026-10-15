"use client"

import { usePathname } from "next/navigation"
import { Suspense } from "react"
import { Icono, ICONOS } from "@/components/iconos"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { enlaceActivo, type EnlacePortal, type Portal } from "./navegacion"

export function BarraSuperior({ portal }: { portal: Portal }) {
  return (
    <header className="sticky top-0 z-10 flex flex-col gap-1 border-b bg-background/85 px-4 py-4 backdrop-blur md:rounded-t-xl md:px-8">
      {/* La ruta solo se conoce en el navegador: mientras tanto, el nombre del portal. */}
      <Suspense fallback={<Titulo portal={portal} />}>
        <TituloConRuta portal={portal} />
      </Suspense>
    </header>
  )
}

function TituloConRuta({ portal }: { portal: Portal }) {
  return <Titulo portal={portal} enlace={enlaceActivo(portal, usePathname())} />
}

function Titulo({ portal, enlace }: { portal: Portal; enlace?: EnlacePortal }) {
  return (
    <>
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1" aria-label="Abrir o cerrar el menú" />
        <Separator orientation="vertical" className="h-5" />
        <h1 className="font-heading text-xl font-bold tracking-tight md:text-2xl">
          {enlace?.titulo ?? portal.nombre}
        </h1>
        <Badge variant="outline" className="ml-auto">
          <Icono icon={ICONOS.red} data-icon="inline-start" />
          Testnet · datos simulados
        </Badge>
      </div>
      {enlace && (
        <p className="pl-12 text-sm text-muted-foreground max-sm:hidden">{enlace.descripcion}</p>
      )}
    </>
  )
}
