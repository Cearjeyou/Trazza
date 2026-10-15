"use client"

import { MarcoPortal } from "@/components/portal/marco-portal"
import { PORTAL_FINTECH } from "@/components/portal/navegacion"
import { useAlertas } from "@/lib/store/selectores"

const OTRO_PORTAL = { href: "/fondeador/ingreso", nombre: "del fondeador" }

export function MarcoFintech({ children }: { children: React.ReactNode }) {
  const alertas = useAlertas()
  return (
    <MarcoPortal
      portal={PORTAL_FINTECH}
      otroPortal={OTRO_PORTAL}
      insignias={{ "/fintech/alertas": alertas.length }}
    >
      {children}
    </MarcoPortal>
  )
}
