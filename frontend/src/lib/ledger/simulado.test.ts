import { beforeEach, describe, expect, it } from "vitest"
import { sha256Hex } from "@/lib/dominio/huella"
import { estadoLedgerInicial, LedgerSimulado } from "./simulado"

let ledger: LedgerSimulado
let n = 0
const huella = () => sha256Hex(`evento-${n++}`)
const fecha = new Date("2026-10-15T12:00:00.000Z")

beforeEach(() => {
  ledger = new LedgerSimulado(estadoLedgerInicial(100), () => fecha)
})

describe("ledger simulado", () => {
  it("registra la asignación con su ledger, transacción y fecha", async () => {
    const h = await huella()
    const r = await ledger.registrarAsignacion({
      eventoId: "EV-1",
      creditoId: "CR-1",
      fondeadorId: "FON-001",
      huella: h,
    })
    expect(r).toMatchObject({
      ok: true,
      registro: { ledger: 101, registradoEn: fecha.toISOString() },
    })
    expect(await ledger.consultarAsignacion("CR-1")).toBe("FON-001")
    expect(await ledger.consultarEvento("EV-1")).toMatchObject({
      eventoId: "EV-1",
      tipo: "asignacion",
      huella: h,
      ledger: 101,
    })
    expect(await ledger.consultarEvento("EV-2")).toBeNull()
  })

  it("rechaza asignar un crédito que ya pertenece a otro fondeador", async () => {
    await ledger.registrarAsignacion({
      eventoId: "EV-1",
      creditoId: "CR-1",
      fondeadorId: "FON-001",
      huella: await huella(),
    })
    const r = await ledger.registrarAsignacion({
      eventoId: "EV-2",
      creditoId: "CR-1",
      fondeadorId: "FON-002",
      huella: await huella(),
    })
    expect(r).toEqual({ ok: false, error: "asignado_a_otro", asignadoA: "FON-001" })
    expect(await ledger.consultarAsignacion("CR-1")).toBe("FON-001")
    expect(await ledger.consultarEvento("EV-2")).toBeNull()
    expect(ledger.instantanea().secuencia).toBe(101)
  })

  it("rechaza repetir la asignación al mismo fondeador", async () => {
    const datos = { creditoId: "CR-1", fondeadorId: "FON-001" }
    await ledger.registrarAsignacion({ ...datos, eventoId: "EV-1", huella: await huella() })
    const r = await ledger.registrarAsignacion({ ...datos, eventoId: "EV-2", huella: await huella() })
    expect(r).toMatchObject({ ok: false, error: "ya_asignado" })
  })

  it("rechaza huellas mal formadas y eventos repetidos", async () => {
    const base = { creditoId: "CR-1", fondeadorId: "FON-001" }
    expect(
      await ledger.registrarAsignacion({ ...base, eventoId: "EV-1", huella: "abc" }),
    ).toMatchObject({ ok: false, error: "huella_invalida" })
    await ledger.registrarAsignacion({ ...base, eventoId: "EV-1", huella: await huella() })
    expect(
      await ledger.registrarMora({ creditoId: "CR-1", eventoId: "EV-1", huella: await huella() }),
    ).toMatchObject({ ok: false, error: "evento_repetido" })
  })

  it("solo registra mora de créditos asignados", async () => {
    expect(
      await ledger.registrarMora({ eventoId: "EV-1", creditoId: "CR-1", huella: await huella() }),
    ).toMatchObject({ ok: false, error: "no_asignado" })
  })

  it("sustituye moviendo la asignación y valida ambos créditos", async () => {
    const asignar = async (eventoId: string, creditoId: string, fondeadorId: string) =>
      ledger.registrarAsignacion({ eventoId, creditoId, fondeadorId, huella: await huella() })
    await asignar("EV-1", "CR-1", "FON-001")
    await asignar("EV-2", "CR-2", "FON-002")

    const sustituir = async (eventoId: string, fondeadorId: string, sale: string, entra: string) =>
      ledger.registrarSustitucion({
        eventoId,
        fondeadorId,
        creditoSalienteId: sale,
        creditoEntranteId: entra,
        huella: await huella(),
      })

    expect(await sustituir("EV-3", "FON-002", "CR-1", "CR-3")).toMatchObject({
      ok: false,
      error: "no_asignado",
    })
    expect(await sustituir("EV-3", "FON-001", "CR-1", "CR-2")).toEqual({
      ok: false,
      error: "asignado_a_otro",
      asignadoA: "FON-002",
    })
    expect(await sustituir("EV-3", "FON-001", "CR-1", "CR-3")).toMatchObject({ ok: true })
    expect(await ledger.consultarAsignacion("CR-1")).toBeNull()
    expect(await ledger.consultarAsignacion("CR-3")).toBe("FON-001")
  })

  it("la instantánea es una copia independiente", async () => {
    const copia = ledger.instantanea()
    await ledger.registrarAsignacion({
      eventoId: "EV-1",
      creditoId: "CR-1",
      fondeadorId: "FON-001",
      huella: await huella(),
    })
    expect(copia.asignaciones).toEqual({})
  })
})
