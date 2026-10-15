"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { Logo } from "@/components/marca/logo"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { PORTALES, SECCIONES } from "./datos"
import { NavSecciones } from "./nav-secciones"

function useSeccionActiva() {
  const [activa, setActiva] = useState<string>("inicio")
  useEffect(() => {
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) setActiva(entrada.target.id)
        }
      },
      // Cuenta como activa la sección que cruza el centro de la pantalla.
      { rootMargin: "-45% 0px -50% 0px" }
    )
    for (const { id } of SECCIONES) {
      const elemento = document.getElementById(id)
      if (elemento) observador.observe(elemento)
    }
    return () => observador.disconnect()
  }, [])
  return activa
}

function useDesplazado(umbral = 24) {
  const [desplazado, setDesplazado] = useState(false)
  useEffect(() => {
    const revisar = () => setDesplazado(window.scrollY > umbral)
    revisar()
    window.addEventListener("scroll", revisar, { passive: true })
    return () => window.removeEventListener("scroll", revisar)
  }, [umbral])
  return desplazado
}

export function MenuSuperior() {
  const activa = useSeccionActiva()
  // Al bajar, la barra no cambia de tamaño: solo aparecen fondo, borde
  // redondeado y sombra para separarla del contenido.
  const desplazado = useDesplazado()

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6">
      <nav
        aria-label="Principal"
        className={cn(
          "mx-auto flex h-15 max-w-7xl items-center justify-between gap-6 rounded-2xl border pr-2 pl-5 transition-[background-color,border-color,box-shadow] duration-300 ease-out sm:pl-6",
          desplazado
            ? "border-white/10 bg-azul-975/80 shadow-lg shadow-black/30 backdrop-blur-md"
            : "border-transparent bg-transparent"
        )}
      >
        <Link href="#inicio" aria-label="Trazza, ir al inicio">
          <Logo fondo="oscuro" tamano={32} className="text-white" />
        </Link>

        <NavSecciones activa={activa} />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                size="lg"
                className="bg-marca-lima text-marca-azul hover:bg-marca-lima/85"
              />
            }
          >
            Entrar
            <HugeiconsIcon icon={ArrowDown01Icon} data-icon="inline-end" />
          </DropdownMenuTrigger>
          {/* El menú se monta fuera de la landing; "dark" mantiene su tema. */}
          <DropdownMenuContent align="end" className="dark w-64">
            <DropdownMenuGroup>
              {PORTALES.map((portal) => (
                <DropdownMenuItem
                  key={portal.href}
                  render={<Link href={portal.href} />}
                >
                  <HugeiconsIcon icon={portal.icono} />
                  <span className="flex flex-col">
                    <span className="font-medium">{portal.nombre}</span>
                    <span className="text-xs text-muted-foreground">
                      {portal.descripcion}
                    </span>
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </header>
  )
}
