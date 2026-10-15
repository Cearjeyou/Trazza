"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Suspense } from "react"
import { Icono, ICONOS } from "@/components/iconos"
import { Logo } from "@/components/marca/logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { enlaceActivo, type Portal } from "./navegacion"
import { ReiniciarDemo } from "./reiniciar-demo"
import { SelectorTema } from "./selector-tema"

export function BarraLateral({
  portal,
  otroPortal,
  insignias = {},
  sesion,
}: {
  portal: Portal
  otroPortal: { href: string; nombre: string }
  /** Número a mostrar junto a un enlace, por href. */
  insignias?: Record<string, number>
  /** Quién entró y cómo salir, en los portales con sesión. */
  sesion?: { nombre: string; alSalir: () => void }
}) {
  const { setOpenMobile } = useSidebar()
  const cerrarEnMovil = () => setOpenMobile(false)

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2 rounded-lg px-2 py-1.5" aria-label="Trazza, ir al inicio">
          <Logo tamano={30} className="dark:hidden" />
          <Logo tamano={30} fondo="oscuro" className="hidden dark:inline-flex" />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {sesion ? sesion.nombre : `Portal ${portal.nombre.toLowerCase()}`}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {/* La ruta solo se conoce en el navegador: mientras tanto, sin enlace activo. */}
            <Suspense fallback={<MenuEnlaces portal={portal} insignias={insignias} />}>
              <MenuEnlacesConRuta portal={portal} insignias={insignias} alNavegar={cerrarEnMovil} />
            </Suspense>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={`Portal ${otroPortal.nombre.toLowerCase()}`}
              render={<Link href={otroPortal.href} onClick={cerrarEnMovil} />}
            >
              <Icono icon={portal.id === "fintech" ? ICONOS.fondeadores : ICONOS.fintech} />
              <span>Ir al portal {otroPortal.nombre.toLowerCase()}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <ReiniciarDemo />
          </SidebarMenuItem>
          {sesion && (
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Salir" onClick={sesion.alSalir}>
                <Icono icon={ICONOS.anterior} />
                <span>Salir</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
        <SidebarSeparator />
        <SelectorTema />
      </SidebarFooter>
    </Sidebar>
  )
}

function MenuEnlacesConRuta(props: {
  portal: Portal
  insignias: Record<string, number>
  alNavegar: () => void
}) {
  const activo = enlaceActivo(props.portal, usePathname())
  return <MenuEnlaces {...props} activo={activo?.href} />
}

function MenuEnlaces({
  portal,
  insignias,
  activo,
  alNavegar,
}: {
  portal: Portal
  insignias: Record<string, number>
  activo?: string
  alNavegar?: () => void
}) {
  return (
    <SidebarMenu>
      {portal.enlaces.map((enlace) => (
        <SidebarMenuItem key={enlace.href}>
          <SidebarMenuButton
            isActive={activo === enlace.href}
            tooltip={enlace.titulo}
            render={<Link href={enlace.href} onClick={alNavegar} />}
          >
            <Icono icon={enlace.icono} />
            <span>{enlace.titulo}</span>
          </SidebarMenuButton>
          {insignias[enlace.href] ? <SidebarMenuBadge>{insignias[enlace.href]}</SidebarMenuBadge> : null}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
