import type { Metadata } from "next"
import { EnConstruccion } from "@/components/en-construccion"

export const metadata: Metadata = { title: "Portal fintech" }

export default function PortalFintech() {
  return <EnConstruccion portal="fintech" />
}
