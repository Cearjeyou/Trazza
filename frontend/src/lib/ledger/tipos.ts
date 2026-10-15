import type { RegistroRed, TipoEvento } from "@/lib/dominio/tipos"

// Operaciones del futuro contrato en Soroban. La implementación simulada y la
// real comparten esta interfaz para que los portales no cambien al conectar la red.

export type ErrorLedger =
  /** El crédito ya pertenece a otro fondeador: la regla contra el doble fondeo. */
  | "asignado_a_otro"
  /** El crédito ya está asignado a ese mismo fondeador. */
  | "ya_asignado"
  /** El crédito no está asignado, o no a ese fondeador. */
  | "no_asignado"
  | "evento_repetido"
  | "huella_invalida"

export type ResultadoLedger =
  | { ok: true; registro: RegistroRed }
  | { ok: false; error: ErrorLedger; asignadoA?: string }

export interface RegistroPublicado extends RegistroRed {
  eventoId: string
  tipo: TipoEvento
  huella: string
}

export interface Ledger {
  registrarAsignacion(p: {
    eventoId: string
    creditoId: string
    fondeadorId: string
    huella: string
  }): Promise<ResultadoLedger>

  registrarMora(p: {
    eventoId: string
    creditoId: string
    huella: string
  }): Promise<ResultadoLedger>

  registrarSustitucion(p: {
    eventoId: string
    fondeadorId: string
    creditoSalienteId: string
    creditoEntranteId: string
    huella: string
  }): Promise<ResultadoLedger>

  consultarEvento(eventoId: string): Promise<RegistroPublicado | null>

  /** Fondeador al que el contrato tiene asignado el crédito, o null. */
  consultarAsignacion(creditoId: string): Promise<string | null>
}
