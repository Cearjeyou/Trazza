import { porcentaje } from "./reglas"
import type { Credito, Evento } from "./tipos"

export interface PuntoMora {
  /** Fecha ISO (AAAA-MM-DD) del día en que hubo eventos. */
  fecha: string
  /** fondeadorId → % del saldo en mora al cierre de ese día. */
  valores: Record<string, number>
}

/**
 * Reconstruye, a partir de los eventos registrados, el porcentaje del saldo
 * en mora de cada fondeador al cierre de cada día con actividad. Los saldos se
 * toman de la cartera actual; la historia de mora y de asignaciones, de los
 * eventos.
 */
export function evolucionMora(
  eventos: readonly Evento[],
  creditos: readonly Credito[],
): PuntoMora[] {
  const saldos = new Map(creditos.map((c) => [c.id, c.saldo]))
  const duenos = new Map<string, string>()
  const mora = new Map<string, number>()
  const fondeadores = new Set<string>()
  const puntos: PuntoMora[] = []

  const cerrarDia = (fecha: string) => {
    const valores: Record<string, number> = {}
    for (const fondeadorId of fondeadores) {
      let total = 0
      let enMora = 0
      for (const [creditoId, dueno] of duenos) {
        if (dueno !== fondeadorId) continue
        const saldo = saldos.get(creditoId) ?? 0
        total += saldo
        if ((mora.get(creditoId) ?? 0) > 0) enMora += saldo
      }
      valores[fondeadorId] = porcentaje(enMora, total)
    }
    puntos.push({ fecha, valores })
  }

  const ordenados = [...eventos].sort((a, b) => a.fecha.localeCompare(b.fecha))
  ordenados.forEach((evento, i) => {
    const { datos } = evento
    if (datos.tipo === "asignacion") {
      duenos.set(datos.creditoId, datos.fondeadorId)
      fondeadores.add(datos.fondeadorId)
    } else if (datos.tipo === "mora") {
      mora.set(datos.creditoId, datos.diasMora)
    } else {
      duenos.delete(datos.creditoSalienteId)
      duenos.set(datos.creditoEntranteId, datos.fondeadorId)
    }
    const dia = evento.fecha.slice(0, 10)
    const siguiente = ordenados[i + 1]?.fecha.slice(0, 10)
    if (siguiente !== dia) cerrarDia(dia)
  })

  return puntos
}
