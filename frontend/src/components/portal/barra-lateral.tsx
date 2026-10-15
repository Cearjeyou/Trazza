"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
}: {
  portal: Portal
  otroPortal: { href: string; nombre: string }
  /** Número a mostrar junto a un enlace, por href. */
  insignias?: Record<string, number>
}) {
  const ruta = usePathname()
  const activo = enlaceActivo(portal, ruta)
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
          <SidebarGroupLabel>Portal {portal.nombre.toLowerCase()}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {portal.enlaces.map((enlace) => (
                <SidebarMenuItem key={enlace.href}>
                  <SidebarMenuButton
                    isActive={activo?.href === enlace.href}
                    tooltip={enlace.titulo}
                    render={<Link href={enlace.href} onClick={cerrarEnMovil} />}
                  >
                    <Icono icon={enlace.icono} />
                    <span>{enlace.titulo}</span>
                  </SidebarMenuButton>
                  {insignias[enlace.href] ? (
                    <SidebarMenuBadge>{insignias[enlace.href]}</SidebarMenuBadge>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
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
              <Icono icon={ICONOS.fondeadores} />
              <span>Ir al portal {otroPortal.nombre.toLowerCase()}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <ReiniciarDemo />
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator />
        <SelectorTema />
      </SidebarFooter>
    </Sidebar>
  )
}
