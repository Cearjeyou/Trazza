import { describe, expect, it } from "vitest"
import {
  calcularHuella,
  serializarEstable,
  sha256Hex,
  verificarHuella,
} from "./huella"
import type { ContenidoEvento, Evento } from "./tipos"

const contenido: ContenidoEvento = {
  id: "EV-00001",
  fecha: "2026-10-01T15:00:00.000Z",
  datos: {
    tipo: "mora",
    creditoId: "CR-0002",
    fondeadorId: "FON-001",
    diasMoraAnterior: 8,
    diasMora: 38,
    saldo: 22_300_000,
  },
}

describe("serializarEstable", () => {
  it("ordena las claves en todos los niveles", () => {
    expect(serializarEstable({ b: 1, a: { d: [2, { z: 1, y: 0 }], c: "x" } })).toBe(
      '{"a":{"c":"x","d":[2,{"y":0,"z":1}]},"b":1}',
    )
  })

  it("rechaza valores que JSON no representa igual", () => {
    expect(() => serializarEstable({ a: Number.NaN })).toThrow()
    expect(() => serializarEstable([undefined])).toThrow()
  })
})

describe("huella", () => {
  it("usa SHA-256", async () => {
    expect(await sha256Hex("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    )
  })

  it("es estable sin importar el orden de las claves", async () => {
    const desordenado = {
      datos: {
        saldo: 22_300_000,
        diasMora: 38,
        diasMoraAnterior: 8,
        fondeadorId: "FON-001",
        creditoId: "CR-0002",
        tipo: "mora",
      },
      fecha: contenido.fecha,
      id: contenido.id,
    } as ContenidoEvento
    const huella = await calcularHuella(contenido)
    expect(huella).toMatch(/^[0-9a-f]{64}$/)
    expect(await calcularHuella(desordenado)).toBe(huella)
    expect(await calcularHuella(structuredClone(contenido))).toBe(huella)
  })

  it("ignora la huella y el registro en red que ya trae el evento", async () => {
    const evento: Evento = {
      ...contenido,
      huella: "x",
      registro: { ledger: 1, txHash: "y", registradoEn: contenido.fecha },
    }
    expect(await calcularHuella(evento)).toBe(await calcularHuella(contenido))
  })

  const cambios: [string, (c: ContenidoEvento) => void][] = [
    ["el id", (c) => (c.id = "EV-00002")],
    ["la fecha", (c) => (c.fecha = "2026-10-01T15:00:00.001Z")],
    ["el crédito", (c) => ((c.datos as { creditoId: string }).creditoId = "CR-0003")],
    ["el fondeador", (c) => ((c.datos as { fondeadorId: string }).fondeadorId = "FON-002")],
    ["los días de mora", (c) => ((c.datos as { diasMora: number }).diasMora = 39)],
    ["el saldo en un peso", (c) => ((c.datos as { saldo: number }).saldo += 1)],
  ]

  it.each(cambios)("cambia si se modifica %s", async (_, modificar) => {
    const alterado = structuredClone(contenido)
    modificar(alterado)
    expect(await calcularHuella(alterado)).not.toBe(await calcularHuella(contenido))
  })

  it("verifica contra la huella publicada", async () => {
    const huella = await calcularHuella(contenido)
    const evento: Evento = {
      ...contenido,
      huella,
      registro: { ledger: 1, txHash: "y", registradoEn: contenido.fecha },
    }
    expect((await verificarHuella(evento, huella)).coincide).toBe(true)

    const editado = structuredClone(evento)
    ;(editado.datos as { diasMora: number }).diasMora = 20
    const verificacion = await verificarHuella(editado, huella)
    expect(verificacion.coincide).toBe(false)
    expect(verificacion.publicada).toBe(huella)
  })
})
