import { beforeAll, describe, expect, it } from "vitest"
import { crearEstadoSemilla, type EstadoDemo } from "@/lib/store/semilla"
import { LedgerSimulado } from "./simulado"
import { verificarEvento, verificarExclusividad } from "./verificacion"

let semilla: EstadoDemo
const ledger = () => new LedgerSimulado(structuredClone(semilla.ledger))

beforeAll(async () => {
  semilla = await crearEstadoSemilla(new Date("2026-10-15T15:00:00.000Z"))
})

describe("verificación del fondeador", () => {
  it("coincide con la huella publicada si los datos no cambiaron", async () => {
    for (const evento of semilla.eventos) {
      const r = await verificarEvento(evento, ledger())
      expect(r.coincide).toBe(true)
      expect(r.publicado?.ledger).toBe(evento.registro.ledger)
    }
  })

  it("deja de coincidir si se altera cualquier dato", async () => {
    const mora = semilla.eventos.find((e) => e.datos.tipo === "mora")!
    const alterado = structuredClone(mora)
    if (alterado.datos.tipo === "mora") alterado.datos.diasMora -= 1
    const r = await verificarEvento(alterado, ledger())
    expect(r.coincide).toBe(false)
    expect(r.publicado?.huella).toBe(mora.huella)
  })

  it("no coincide con un evento que nunca se publicó", async () => {
    const inventado = { ...semilla.eventos[0], id: "EV-99999" }
    const r = await verificarEvento(inventado, ledger())
    expect(r).toMatchObject({ publicado: null, coincide: false })
  })

  it("confirma la exclusividad según el contrato", async () => {
    expect(await verificarExclusividad("CR-0001", "FON-001", ledger())).toEqual({
      asignadoA: "FON-001",
      exclusivo: true,
    })
    expect(await verificarExclusividad("CR-0001", "FON-002", ledger())).toMatchObject({ exclusivo: false })
    // CR-0004 salió del Fondo Andino al sustituirse.
    expect(await verificarExclusividad("CR-0004", "FON-001", ledger())).toEqual({
      asignadoA: null,
      exclusivo: false,
    })
  })
})
