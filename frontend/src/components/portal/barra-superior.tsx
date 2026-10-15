"use client"

import { usePathname } from "next/navigation"
import { Icono, ICONOS } from "@/components/iconos"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { enlaceActivo, type Portal } from "./navegacion"

export function BarraSuperior({ portal }: { portal: Portal }) {
  const enlace = enlaceActivo(portal, usePathname())

  return (
    <header className="sticky top-0 z-10 flex flex-col gap-1 border-b bg-background/85 px-4 py-4 backdrop-blur md:rounded-t-xl md:px-8">
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
        <p className="pl-12 text-sm text-muted-foreground max-sm:hidden">
          {enlace.descripcion}
        </p>
      )}
    </header>
  )
}
