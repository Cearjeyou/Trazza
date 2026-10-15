import type {
  Asignacion,
  CondicionesFondeador,
  Credito,
  Fondeador,
} from "./tipos"

const MS_POR_DIA = 24 * 60 * 60 * 1000
// Margen para que 25,0000000001 % no cuente como superar un límite de 25 %.
const TOLERANCIA = 1e-9

export function porcentaje(parte: number, total: number) {
  return total > 0 ? (parte / total) * 100 : 0
}

export function sumarDias(fecha: Date, dias: number) {
  return new Date(fecha.getTime() + dias * MS_POR_DIA)
}

export function saldoTotal(creditos: readonly Credito[]) {
  return creditos.reduce((suma, c) => suma + c.saldo, 0)
}

// ── Concentración ────────────────────────────────────────────────

export interface EvaluacionConcentracion {
  maximaPct: number
  creditoMayorId: string | null
  /** Créditos cuyo peso supera el límite. */
  excedidos: string[]
  cumple: boolean
}

export function evaluarConcentracion(
  creditos: readonly Credito[],
  limitePct: number,
): EvaluacionConcentracion {
  const total = saldoTotal(creditos)
  let maximaPct = 0
  let creditoMayorId: string | null = null
  const excedidos: string[] = []

  for (const credito of creditos) {
    const peso = porcentaje(credito.saldo, total)
    if (peso > maximaPct) {
      maximaPct = peso
      creditoMayorId = credito.id
    }
    if (peso > limitePct + TOLERANCIA) excedidos.push(credito.id)
  }

  return { maximaPct, creditoMayorId, excedidos, cumple: excedidos.length === 0 }
}

// ── Mora ─────────────────────────────────────────────────────────

export function superaMora(credito: Credito, condiciones: CondicionesFondeador) {
  return credito.diasMora > condiciones.moraMaximaDias
}

export function saldoEnMora(creditos: readonly Credito[]) {
  return saldoTotal(creditos.filter((c) => c.diasMora > 0))
}

export function moraCarteraPct(creditos: readonly Credito[]) {
  return porcentaje(saldoEnMora(creditos), saldoTotal(creditos))
}

export interface EstadoPlazo {
  diasSobreLimite: number
  /** Negativo cuando el plazo ya venció. */
  diasRestantes: number
  /** Fecha ISO (AAAA-MM-DD) en que vence el plazo de sustitución. */
  fechaLimite: string
  vencido: boolean
}

/**
 * Plazo de sustitución de un crédito que supera la mora máxima, o null si no
 * la supera. El día en que la superó se deduce de sus días de mora a la fecha
 * de corte `hoy`.
 */
export function estadoPlazo(
  credito: Credito,
  condiciones: CondicionesFondeador,
  hoy: Date,
): EstadoPlazo | null {
  if (!superaMora(credito, condiciones)) return null
  const diasSobreLimite = credito.diasMora - condiciones.moraMaximaDias
  const diasRestantes = condiciones.plazoSustitucionDias - diasSobreLimite
  return {
    diasSobreLimite,
    diasRestantes,
    fechaLimite: sumarDias(hoy, diasRestantes).toISOString().slice(0, 10),
    vencido: diasRestantes < 0,
  }
}

// ── Resumen por fondeador ────────────────────────────────────────

export function creditosDe(
  fondeadorId: string,
  creditos: readonly Credito[],
  asignaciones: Readonly<Record<string, Asignacion>>,
) {
  return creditos.filter((c) => asignaciones[c.id]?.fondeadorId === fondeadorId)
}

export interface ResumenFondeador {
  numeroCreditos: number
  saldoTotal: number
  saldoEnMora: number
  moraCarteraPct: number
  cumpleMoraCartera: boolean
  concentracion: EvaluacionConcentracion
  /** Créditos que superan la mora máxima por crédito. */
  creditosSobreMora: string[]
}

export function resumenFondeador(
  fondeador: Fondeador,
  creditos: readonly Credito[],
): ResumenFondeador {
  const { condiciones } = fondeador
  const mora = moraCarteraPct(creditos)
  return {
    numeroCreditos: creditos.length,
    saldoTotal: saldoTotal(creditos),
    saldoEnMora: saldoEnMora(creditos),
    moraCarteraPct: mora,
    cumpleMoraCartera: mora <= condiciones.moraMaximaCarteraPct + TOLERANCIA,
    concentracion: evaluarConcentracion(
      creditos,
      condiciones.concentracionMaximaPct,
    ),
    creditosSobreMora: creditos
      .filter((c) => superaMora(c, condiciones))
      .map((c) => c.id),
  }
}

// ── Alertas ──────────────────────────────────────────────────────

export interface AlertaMora extends EstadoPlazo {
  creditoId: string
  fondeadorId: string
  diasMora: number
}

/** Créditos asignados que superan la mora de su fondeador, los más urgentes primero. */
export function alertasDeMora(
  fondeadores: readonly Fondeador[],
  creditos: readonly Credito[],
  asignaciones: Readonly<Record<string, Asignacion>>,
  hoy: Date,
): AlertaMora[] {
  const porId = new Map(fondeadores.map((f) => [f.id, f]))
  const alertas: AlertaMora[] = []

  for (const credito of creditos) {
    const fondeador = porId.get(asignaciones[credito.id]?.fondeadorId ?? "")
    if (!fondeador) continue
    const plazo = estadoPlazo(credito, fondeador.condiciones, hoy)
    if (!plazo) continue
    alertas.push({
      creditoId: credito.id,
      fondeadorId: fondeador.id,
      diasMora: credito.diasMora,
      ...plazo,
    })
  }

  return alertas.sort((a, b) => a.diasRestantes - b.diasRestantes)
}

// ── Sustitución ──────────────────────────────────────────────────

export type MotivoNoElegible =
  | "es_el_saliente"
  | "ya_asignado"
  | "en_mora"
  | "concentracion"

export interface Elegibilidad {
  elegible: boolean
  motivos: MotivoNoElegible[]
}

/**
 * Un crédito puede reemplazar al saliente si no está asignado, está al día y,
 * tras el cambio, ningún crédito del fondeador supera su límite de concentración.
 */
export function evaluarElegibilidad(
  candidato: Credito,
  saliente: Credito,
  fondeador: Fondeador,
  creditosFondeador: readonly Credito[],
  asignaciones: Readonly<Record<string, Asignacion>>,
): Elegibilidad {
  const motivos: MotivoNoElegible[] = []

  if (candidato.id === saliente.id) motivos.push("es_el_saliente")
  else if (asignaciones[candidato.id]) motivos.push("ya_asignado")
  if (candidato.diasMora > 0) motivos.push("en_mora")

  const despues = [
    ...creditosFondeador.filter((c) => c.id !== saliente.id),
    candidato,
  ]
  const concentracion = evaluarConcentracion(
    despues,
    fondeador.condiciones.concentracionMaximaPct,
  )
  if (!concentracion.cumple) motivos.push("concentracion")

  return { elegible: motivos.length === 0, motivos }
}

/** Créditos elegibles para reemplazar al saliente, del saldo más parecido al más lejano. */
export function candidatosSustitucion(
  saliente: Credito,
  fondeador: Fondeador,
  creditos: readonly Credito[],
  asignaciones: Readonly<Record<string, Asignacion>>,
): Credito[] {
  const delFondeador = creditosDe(fondeador.id, creditos, asignaciones)
  return creditos
    .filter(
      (c) =>
        evaluarElegibilidad(c, saliente, fondeador, delFondeador, asignaciones)
          .elegible,
    )
    .sort(
      (a, b) =>
        Math.abs(a.saldo - saliente.saldo) - Math.abs(b.saldo - saliente.saldo),
    )
}

/** Si una sustitución por mora se hace a tiempo; null para otros motivos. */
export function sustitucionDentroDelPlazo(
  saliente: Credito,
  condiciones: CondicionesFondeador,
  motivo: string,
): boolean | null {
  if (motivo !== "mora") return null
  return (
    saliente.diasMora - condiciones.moraMaximaDias <=
    condiciones.plazoSustitucionDias
  )
}
