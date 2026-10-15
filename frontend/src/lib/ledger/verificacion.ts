import { calcularHuella } from "@/lib/dominio/huella"
import type { ContenidoEvento } from "@/lib/dominio/tipos"
import type { Ledger, RegistroPublicado } from "./tipos"

// Lo que hace el fondeador por su cuenta: recalcular la huella con los datos
// que le muestra la fintech y compararla con la que quedó publicada en la red.

export interface ResultadoVerificacion {
  calculada: string
  publicado: RegistroPublicado | null
  coincide: boolean
}

export async function verificarEvento(
  contenido: ContenidoEvento,
  ledger: Ledger,
): Promise<ResultadoVerificacion> {
  const [calculada, publicado] = await Promise.all([
    calcularHuella(contenido),
    ledger.consultarEvento(contenido.id),
  ])
  return { calculada, publicado, coincide: publicado?.huella === calculada }
}

export interface ResultadoExclusividad {
  asignadoA: string | null
  exclusivo: boolean
}

/** Si el contrato tiene el crédito asignado a este fondeador y a nadie más. */
export async function verificarExclusividad(
  creditoId: string,
  fondeadorId: string,
  ledger: Ledger,
): Promise<ResultadoExclusividad> {
  const asignadoA = await ledger.consultarAsignacion(creditoId)
  return { asignadoA, exclusivo: asignadoA === fondeadorId }
}
