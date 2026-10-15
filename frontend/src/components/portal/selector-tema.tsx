"use client"

import { Icono, ICONOS } from "@/components/iconos"
import { useTema, type Tema } from "@/components/tema"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const OPCIONES: { valor: Tema; nombre: string; icono: typeof ICONOS.temaClaro }[] = [
  { valor: "claro", nombre: "Tema claro", icono: ICONOS.temaClaro },
  { valor: "oscuro", nombre: "Tema oscuro", icono: ICONOS.temaOscuro },
  { valor: "sistema", nombre: "Tema del sistema", icono: ICONOS.temaSistema },
]

export function SelectorTema() {
  const { tema, setTema } = useTema()
  return (
    <ToggleGroup
      aria-label="Tema"
      variant="outline"
      size="sm"
      value={[tema]}
      onValueChange={(valores) => {
        const nuevo = valores[0] as Tema | undefined
        if (nuevo) setTema(nuevo)
      }}
      className="w-full"
    >
      {OPCIONES.map((o) => (
        <ToggleGroupItem key={o.valor} value={o.valor} aria-label={o.nombre} title={o.nombre} className="flex-1">
          <Icono icon={o.icono} />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
