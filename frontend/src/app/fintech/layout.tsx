import type { Metadata } from "next"
import { MarcoFintech } from "@/components/fintech/marco-fintech"

export const metadata: Metadata = {
  title: { default: "Portal fintech", template: "%s · Portal fintech · Trazza" },
}

export default function LayoutFintech({ children }: LayoutProps<"/fintech">) {
  return <MarcoFintech>{children}</MarcoFintech>
}
