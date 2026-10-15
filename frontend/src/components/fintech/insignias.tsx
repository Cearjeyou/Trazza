import { Icono, ICONOS } from "@/components/iconos"
import { Badge } from "@/components/ui/badge"
import type { TipoEvento } from "@/lib/dominio/tipos"
import { NOMBRE_ESTADO, type EstadoCredito } from "@/lib/store/selectores"

const VARIANTE_ESTADO = {
  al_dia: "exito",
  en_mora: "aviso",
  sobre_limite: "destructive",
  sin_asignar: "outline",
} as const

export function InsigniaEstado({ estado }: { estado: EstadoCredito }) {
  return <Badge variant={VARIANTE_ESTADO[estado]}>{NOMBRE_ESTADO[estado]}</Badge>
}

export const NOMBRE_TIPO: Record<TipoEvento, string> = {
  asignacion: "Asignación",
  mora: "Cambio de mora",
  sustitucion: "Sustitución",
}

const ICONO_TIPO = {
  asignacion: ICONOS.asignacion,
  mora: ICONOS.reloj,
  sustitucion: ICONOS.sustitucion,
} as const

export function InsigniaTipo({ tipo }: { tipo: TipoEvento }) {
  return (
    <Badge variant={tipo === "mora" ? "aviso" : "secondary"}>
      <Icono icon={ICONO_TIPO[tipo]} data-icon="inline-start" />
      {NOMBRE_TIPO[tipo]}
    </Badge>
  )
}

export function InsigniaRed() {
  return (
    <Badge variant="exito">
      <Icono icon={ICONOS.correcto} data-icon="inline-start" />
      Confirmado
    </Badge>
  )
}
