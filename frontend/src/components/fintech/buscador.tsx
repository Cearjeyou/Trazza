"use client"

import { Icono, ICONOS } from "@/components/iconos"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

export function Buscador({
  valor,
  alCambiar,
  placeholder,
  className,
}: {
  valor: string
  alCambiar: (valor: string) => void
  placeholder: string
  className?: string
}) {
  return (
    <InputGroup className={cn("sm:max-w-xs", className)}>
      <InputGroupAddon>
        <Icono icon={ICONOS.buscar} />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        value={valor}
        onChange={(e) => alCambiar(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </InputGroup>
  )
}
