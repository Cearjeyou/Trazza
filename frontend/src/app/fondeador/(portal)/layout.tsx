import type { Metadata } from "next"
import { MarcoFondeador } from "@/components/fondeador/marco-fondeador"

export const metadata: Metadata = {
  title: { default: "Portal del fondeador", template: "%s · Portal del fondeador · Trazza" },
}

export default function LayoutFondeador({ children }: { children: React.ReactNode }) {
  return <MarcoFondeador>{children}</MarcoFondeador>
}
