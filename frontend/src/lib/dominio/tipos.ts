// Tipos del dominio. Ningún tipo guarda datos personales de los deudores:
// los créditos se identifican con un código anónimo.

export interface CondicionesFondeador {
  /** Días de mora a partir de los cuales un crédito debe sustituirse. */
  moraMaximaDias: number
  /** Porcentaje máximo del saldo del fondeador que puede estar en mora. */
  moraMaximaCarteraPct: number
  /** Porcentaje máximo del saldo del fondeador que puede pesar un solo crédito. */
  concentracionMaximaPct: number
  /** Días para sustituir un crédito desde que supera la mora máxima. */
  plazoSustitucionDias: number
}

export interface Fondeador {
  id: string
  nombre: string
  condiciones: CondicionesFondeador
}

export const SECTORES = [
  "Comercio",
  "Servicios",
  "Agro",
  "Manufactura",
  "Transporte",
] as const

export type Sector = (typeof SECTORES)[number]

export interface Credito {
  /** Identificador anónimo, por ejemplo CR-0001. */
  id: string
  saldo: number
  montoOriginal: number
  diasMora: number
  /** Fecha ISO (AAAA-MM-DD). */
  fechaDesembolso: string
  plazoMeses: number
  sector: Sector
}

export interface Asignacion {
  creditoId: string
  fondeadorId: string
  /** Fecha ISO completa del registro. */
  fecha: string
  eventoId: string
}

export type MotivoSustitucion = "mora" | "prepago" | "otro"

export interface DatosAsignacion {
  tipo: "asignacion"
  creditoId: string
  fondeadorId: string
  saldo: number
}

export interface DatosMora {
  tipo: "mora"
  creditoId: string
  fondeadorId: string
  diasMoraAnterior: number
  diasMora: number
  saldo: number
}

export interface DatosSustitucion {
  tipo: "sustitucion"
  fondeadorId: string
  creditoSalienteId: string
  creditoEntranteId: string
  motivo: MotivoSustitucion
  /** Solo aplica a sustituciones por mora; en las demás es null. */
  dentroDelPlazo: boolean | null
}

export type DatosEvento = DatosAsignacion | DatosMora | DatosSustitucion

export type TipoEvento = DatosEvento["tipo"]

/** Lo que se resume en la huella: todo el evento salvo la huella y el registro en red. */
export interface ContenidoEvento {
  id: string
  fecha: string
  datos: DatosEvento
}

export interface RegistroRed {
  ledger: number
  txHash: string
  registradoEn: string
}

export interface Evento extends ContenidoEvento {
  huella: string
  registro: RegistroRed
}

export interface Sustitucion {
  eventoId: string
  fecha: string
  fondeadorId: string
  creditoSalienteId: string
  creditoEntranteId: string
  motivo: MotivoSustitucion
  dentroDelPlazo: boolean | null
}
