"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { MarcoPortal } from "@/components/portal/marco-portal"
import { PORTAL_FONDEADOR } from "@/components/portal/navegacion"
import { salir, useSesionFondeador } from "@/lib/sesion"
import { useFondeadores } from "@/lib/store/selectores"
import { useDemo } from "@/lib/store/store"

const OTRO_PORTAL = { href: "/fintech", nombre: "fintech" }

/** El fondeador que entró, o null mientras no se sepa o si no hay sesión. */
export function useFondeadorActivo() {
  const id = useSesionFondeador()
  const fondeadores = useFondeadores()
  return fondeadores.find((f) => f.id === id) ?? null
}

export function MarcoFondeador({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const sesion = useSesionFondeador()
  const listo = useDemo((s) => s.listo)
  const fondeador = useFondeadorActivo()

  // Sin sesión, o con un fondeador que ya no existe (p. ej. tras reiniciar la
  // demo), se vuelve al ingreso.
  useEffect(() => {
    if (sesion === null || (listo && sesion && !fondeador)) {
      salir()
      router.replace("/fondeador/ingreso")
    }
  }, [sesion, listo, fondeador, router])

  return (
    <MarcoPortal
      portal={PORTAL_FONDEADOR}
      otroPortal={OTRO_PORTAL}
      sesion={{
        nombre: fondeador?.nombre ?? "Portal del fondeador",
        alSalir: () => {
          salir()
          router.push("/fondeador/ingreso")
        },
      }}
    >
      {children}
    </MarcoPortal>
  )
}
