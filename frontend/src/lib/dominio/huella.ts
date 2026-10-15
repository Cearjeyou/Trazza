import type { ContenidoEvento, Evento } from "./tipos"

/**
 * Serializa en JSON con las claves ordenadas, para que el mismo evento produzca
 * siempre el mismo texto sin importar el orden en que se armó el objeto.
 */
export function serializarEstable(valor: unknown): string {
  if (valor === null || typeof valor !== "object") {
    if (typeof valor === "number" && !Number.isFinite(valor)) {
      throw new Error("No se puede serializar un número no finito")
    }
    if (valor === undefined) {
      throw new Error("No se puede serializar undefined")
    }
    return JSON.stringify(valor)
  }
  if (Array.isArray(valor)) {
    return `[${valor.map(serializarEstable).join(",")}]`
  }
  const entradas = Object.entries(valor as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([clave, v]) => `${JSON.stringify(clave)}:${serializarEstable(v)}`)
  return `{${entradas.join(",")}}`
}

export async function sha256Hex(texto: string) {
  const bytes = new TextEncoder().encode(texto)
  const resumen = await crypto.subtle.digest("SHA-256", bytes)
  return Array.from(new Uint8Array(resumen), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("")
}

export function contenidoDe(evento: ContenidoEvento): ContenidoEvento {
  return { id: evento.id, fecha: evento.fecha, datos: evento.datos }
}

/** Huella SHA-256 (hex) del contenido del evento. */
export function calcularHuella(evento: ContenidoEvento) {
  return sha256Hex(serializarEstable(contenidoDe(evento)))
}

/** Recalcula la huella con los datos actuales y la compara con la publicada. */
export async function verificarHuella(evento: Evento, huellaPublicada: string) {
  const calculada = await calcularHuella(evento)
  return { calculada, publicada: huellaPublicada, coincide: calculada === huellaPublicada }
}
