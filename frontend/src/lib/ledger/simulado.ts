import { sha256Hex } from "@/lib/dominio/huella"
import type { TipoEvento } from "@/lib/dominio/tipos"
import type {
  ErrorLedger,
  Ledger,
  RegistroPublicado,
  ResultadoLedger,
} from "./tipos"

/** Estado del contrato simulado; es serializable para guardarlo con la demo. */
export interface EstadoLedger {
  /** Último ledger cerrado. */
  secuencia: number
  /** creditoId → fondeadorId */
  asignaciones: Record<string, string>
  eventos: Record<string, RegistroPublicado>
}

export function estadoLedgerInicial(secuencia = 1_250_000): EstadoLedger {
  return { secuencia, asignaciones: {}, eventos: {} }
}

const HUELLA = /^[0-9a-f]{64}$/

/**
 * Imita el contrato: guarda la huella y la fecha de cada evento y rechaza
 * asignar un crédito que ya pertenece a otro fondeador. Muta su propio estado.
 */
export class LedgerSimulado implements Ledger {
  constructor(
    private readonly estado: EstadoLedger = estadoLedgerInicial(),
    private readonly ahora: () => Date = () => new Date(),
  ) {}

  instantanea(): EstadoLedger {
    return structuredClone(this.estado)
  }

  private validar(eventoId: string, huella: string): ErrorLedger | null {
    if (!HUELLA.test(huella)) return "huella_invalida"
    if (this.estado.eventos[eventoId]) return "evento_repetido"
    return null
  }

  private async publicar(
    eventoId: string,
    tipo: TipoEvento,
    huella: string,
  ): Promise<ResultadoLedger> {
    const ledger = ++this.estado.secuencia
    const registro: RegistroPublicado = {
      eventoId,
      tipo,
      huella,
      ledger,
      txHash: await sha256Hex(`${eventoId}:${huella}:${ledger}`),
      registradoEn: this.ahora().toISOString(),
    }
    this.estado.eventos[eventoId] = registro
    const { ledger: l, txHash, registradoEn } = registro
    return { ok: true, registro: { ledger: l, txHash, registradoEn } }
  }

  async registrarAsignacion(p: {
    eventoId: string
    creditoId: string
    fondeadorId: string
    huella: string
  }): Promise<ResultadoLedger> {
    const invalido = this.validar(p.eventoId, p.huella)
    if (invalido) return { ok: false, error: invalido }

    const actual = this.estado.asignaciones[p.creditoId]
    if (actual) {
      return {
        ok: false,
        error: actual === p.fondeadorId ? "ya_asignado" : "asignado_a_otro",
        asignadoA: actual,
      }
    }
    this.estado.asignaciones[p.creditoId] = p.fondeadorId
    return this.publicar(p.eventoId, "asignacion", p.huella)
  }

  async registrarMora(p: {
    eventoId: string
    creditoId: string
    huella: string
  }): Promise<ResultadoLedger> {
    const invalido = this.validar(p.eventoId, p.huella)
    if (invalido) return { ok: false, error: invalido }
    if (!this.estado.asignaciones[p.creditoId]) {
      return { ok: false, error: "no_asignado" }
    }
    return this.publicar(p.eventoId, "mora", p.huella)
  }

  async registrarSustitucion(p: {
    eventoId: string
    fondeadorId: string
    creditoSalienteId: string
    creditoEntranteId: string
    huella: string
  }): Promise<ResultadoLedger> {
    const invalido = this.validar(p.eventoId, p.huella)
    if (invalido) return { ok: false, error: invalido }

    if (this.estado.asignaciones[p.creditoSalienteId] !== p.fondeadorId) {
      return { ok: false, error: "no_asignado" }
    }
    const entrante = this.estado.asignaciones[p.creditoEntranteId]
    if (entrante) {
      return {
        ok: false,
        error: entrante === p.fondeadorId ? "ya_asignado" : "asignado_a_otro",
        asignadoA: entrante,
      }
    }
    delete this.estado.asignaciones[p.creditoSalienteId]
    this.estado.asignaciones[p.creditoEntranteId] = p.fondeadorId
    return this.publicar(p.eventoId, "sustitucion", p.huella)
  }

  async consultarEvento(eventoId: string) {
    const registro = this.estado.eventos[eventoId]
    return registro ? { ...registro } : null
  }

  async consultarAsignacion(creditoId: string) {
    return this.estado.asignaciones[creditoId] ?? null
  }
}
