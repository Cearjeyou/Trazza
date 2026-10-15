"use client"

import { useState } from "react"
import { Icono, ICONOS } from "@/components/iconos"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { useDemo } from "@/lib/store/store"

export function ReiniciarDemo() {
  const reiniciarDemo = useDemo((s) => s.reiniciarDemo)
  const [abierto, setAbierto] = useState(false)
  const [reiniciando, setReiniciando] = useState(false)

  async function reiniciar() {
    setReiniciando(true)
    await reiniciarDemo()
    setReiniciando(false)
    setAbierto(false)
    toast.add({
      type: "success",
      title: "Demo reiniciada",
      description: "Volviste a los datos de ejemplo iniciales.",
    })
  }

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger render={<SidebarMenuButton tooltip="Reiniciar demo" />}>
        <Icono icon={ICONOS.reiniciar} />
        <span>Reiniciar demo</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Reiniciar la demo?</DialogTitle>
          <DialogDescription>
            Se borran los fondeadores, cargas, asignaciones y sustituciones que
            hiciste, y vuelven los datos de ejemplo. Solo afecta a este navegador.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          <Button onClick={reiniciar} disabled={reiniciando}>
            {reiniciando && <Spinner data-icon="inline-start" />}
            Reiniciar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
