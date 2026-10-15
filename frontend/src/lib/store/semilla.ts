import { sumarDias } from "@/lib/dominio/reglas"
import type { Credito, Fondeador } from "@/lib/dominio/tipos"
import {
  estadoLedgerInicial,
  LedgerSimulado,
  type EstadoLedger,
} from "@/lib/ledger/simulado"
import {
  asignar,
  cargarCartera,
  estadoDominioVacio,
  sustituir,
  type EstadoDominio,
} from "./operaciones"

export interface EstadoDemo extends EstadoDominio {
  ledger: EstadoLedger
}

export const FONDEADORES_SEMILLA: Fondeador[] = [
  {
    id: "FON-001",
    nombre: "Fondo Andino de Crédito",
    condiciones: {
      moraMaximaDias: 30,
      moraMaximaCarteraPct: 10,
      concentracionMaximaPct: 25,
      plazoSustitucionDias: 15,
    },
  },
  {
    id: "FON-002",
    nombre: "Horizonte Capital",
    condiciones: {
      moraMaximaDias: 60,
      moraMaximaCarteraPct: 25,
      concentracionMaximaPct: 30,
      plazoSustitucionDias: 30,
    },
  },
]

/** Cartera tal como queda hoy; coincide con las primeras filas de public/ejemplo-cartera.csv. */
export const CREDITOS_SEMILLA: Credito[] = [
  { id: "CR-0001", saldo: 18_450_000, montoOriginal: 24_000_000, diasMora: 0, fechaDesembolso: "2025-11-04", plazoMeses: 36, sector: "Comercio" },
  { id: "CR-0002", saldo: 22_300_000, montoOriginal: 30_000_000, diasMora: 38, fechaDesembolso: "2025-09-18", plazoMeses: 48, sector: "Manufactura" },
  { id: "CR-0003", saldo: 15_120_000, montoOriginal: 20_000_000, diasMora: 0, fechaDesembolso: "2026-01-12", plazoMeses: 24, sector: "Servicios" },
  { id: "CR-0004", saldo: 20_800_000, montoOriginal: 25_000_000, diasMora: 95, fechaDesembolso: "2025-08-22", plazoMeses: 36, sector: "Transporte" },
  { id: "CR-0005", saldo: 17_650_000, montoOriginal: 22_000_000, diasMora: 0, fechaDesembolso: "2025-12-01", plazoMeses: 36, sector: "Agro" },
  { id: "CR-0006", saldo: 19_400_000, montoOriginal: 26_000_000, diasMora: 0, fechaDesembolso: "2025-10-15", plazoMeses: 48, sector: "Comercio" },
  { id: "CR-0007", saldo: 25_300_000, montoOriginal: 32_000_000, diasMora: 0, fechaDesembolso: "2025-07-30", plazoMeses: 60, sector: "Manufactura" },
  { id: "CR-0008", saldo: 29_850_000, montoOriginal: 40_000_000, diasMora: 0, fechaDesembolso: "2025-06-11", plazoMeses: 60, sector: "Transporte" },
  { id: "CR-0009", saldo: 27_900_000, montoOriginal: 35_000_000, diasMora: 75, fechaDesembolso: "2025-08-05", plazoMeses: 48, sector: "Agro" },
  { id: "CR-0010", saldo: 24_150_000, montoOriginal: 30_000_000, diasMora: 0, fechaDesembolso: "2025-11-20", plazoMeses: 36, sector: "Servicios" },
  { id: "CR-0011", saldo: 26_400_000, montoOriginal: 34_000_000, diasMora: 0, fechaDesembolso: "2025-09-02", plazoMeses: 48, sector: "Comercio" },
  { id: "CR-0012", saldo: 21_200_000, montoOriginal: 27_000_000, diasMora: 0, fechaDesembolso: "2026-02-03", plazoMeses: 36, sector: "Servicios" },
  { id: "CR-0013", saldo: 16_300_000, montoOriginal: 20_000_000, diasMora: 0, fechaDesembolso: "2026-03-10", plazoMeses: 24, sector: "Agro" },
  { id: "CR-0014", saldo: 22_950_000, montoOriginal: 28_000_000, diasMora: 0, fechaDesembolso: "2026-04-07", plazoMeses: 36, sector: "Manufactura" },
  { id: "CR-0015", saldo: 27_100_000, montoOriginal: 33_000_000, diasMora: 45, fechaDesembolso: "2025-10-28", plazoMeses: 48, sector: "Transporte" },
]

function conMora(moras: Record<string, number>) {
  return CREDITOS_SEMILLA.map((c) => ({ ...c, diasMora: moras[c.id] ?? 0 }))
}

/**
 * Arma la demo repitiendo la historia con las mismas operaciones que usa la
 * interfaz, para que cada evento tenga una huella real y un registro coherente:
 *
 * - hace 120 y 100 días se asignan 6 créditos al Fondo Andino y 5 a Horizonte;
 * - hace 48 días CR-0004 supera la mora del Fondo Andino y hace 40 se sustituye
 *   por CR-0012, dentro del plazo;
 * - hace 31 días y ayer se cargan cortes de mora: hoy CR-0002 (Fondo Andino) y
 *   CR-0009 (Horizonte) tienen alerta.
 */
export async function crearEstadoSemilla(hoy = new Date()): Promise<EstadoDemo> {
  let reloj = hoy
  const ledger = new LedgerSimulado(estadoLedgerInicial(), () => reloj)
  const en = (diasAtras: number) => (reloj = sumarDias(hoy, -diasAtras))

  let estado: EstadoDominio = {
    ...estadoDominioVacio(),
    fondeadores: structuredClone(FONDEADORES_SEMILLA),
  }

  ;({ estado } = await cargarCartera(estado, ledger, conMora({}), en(130)))
  ;({ estado } = await asignar(
    estado,
    ledger,
    "FON-001",
    ["CR-0001", "CR-0002", "CR-0003", "CR-0004", "CR-0005", "CR-0006"],
    en(120),
  ))
  ;({ estado } = await asignar(
    estado,
    ledger,
    "FON-002",
    ["CR-0007", "CR-0008", "CR-0009", "CR-0010", "CR-0011"],
    en(100),
  ))
  ;({ estado } = await cargarCartera(
    estado,
    ledger,
    conMora({ "CR-0004": 38 }),
    en(48),
  ))
  ;({ estado } = await sustituir(
    estado,
    ledger,
    {
      fondeadorId: "FON-001",
      creditoSalienteId: "CR-0004",
      creditoEntranteId: "CR-0012",
      motivo: "mora",
    },
    en(40),
  ))
  ;({ estado } = await cargarCartera(
    estado,
    ledger,
    conMora({ "CR-0002": 8, "CR-0009": 45, "CR-0004": 60, "CR-0015": 14 }),
    en(31),
  ))
  ;({ estado } = await cargarCartera(estado, ledger, CREDITOS_SEMILLA, en(1)))

  return { ...estado, ledger: ledger.instantanea() }
}
