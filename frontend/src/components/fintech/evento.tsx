import type { Evento } from "@/lib/dominio/tipos"

const MOTIVO = { mora: "por mora", prepago: "por prepago", otro: "por otro motivo" } as const

/** Frase corta que describe el evento, para listas y tablas. */
export function describirEvento(evento: Evento, nombres: Map<string, string>) {
  const { datos } = evento
  const fondeador = nombres.get(datos.fondeadorId) ?? datos.fondeadorId
  switch (datos.tipo) {
    case "asignacion":
      return `${datos.creditoId} asignado a ${fondeador}`
    case "mora":
      return `${datos.creditoId}: mora de ${datos.diasMoraAnterior} a ${datos.diasMora} días`
    case "sustitucion":
      return `${datos.creditoSalienteId} sustituido por ${datos.creditoEntranteId} ${MOTIVO[datos.motivo]}`
  }
}
