import { describe, expect, it } from "vitest"
import {
  alertasDeMora,
  candidatosSustitucion,
  estadoPlazo,
  evaluarConcentracion,
  evaluarElegibilidad,
  moraCarteraPct,
  resumenFondeador,
  superaMora,
  sustitucionDentroDelPlazo,
} from "./reglas"
import type { Asignacion, Credito, Fondeador } from "./tipos"

function credito(id: string, saldo: number, diasMora = 0): Credito {
  return {
    id,
    saldo,
    montoOriginal: saldo * 2,
    diasMora,
    fechaDesembolso: "2026-01-01",
    plazoMeses: 36,
    sector: "Comercio",
  }
}

const fondeador: Fondeador = {
  id: "FON-001",
  nombre: "Prueba",
  condiciones: {
    moraMaximaDias: 30,
    moraMaximaCarteraPct: 10,
    concentracionMaximaPct: 25,
    plazoSustitucionDias: 15,
  },
}

function asignados(fondeadorId: string, ids: string[]) {
  return Object.fromEntries(
    ids.map((creditoId) => [
      creditoId,
      { creditoId, fondeadorId, fecha: "2026-01-01T00:00:00.000Z", eventoId: "EV" },
    ]),
  ) as Record<string, Asignacion>
}

const hoy = new Date("2026-10-15T12:00:00.000Z")

describe("concentración", () => {
  it("cumple cuando ningún crédito supera el límite", () => {
    const r = evaluarConcentracion(
      [credito("A", 25), credito("B", 25), credito("C", 25), credito("D", 25)],
      25,
    )
    expect(r.cumple).toBe(true)
    expect(r.maximaPct).toBe(25)
  })

  it("señala los créditos que superan el límite", () => {
    const r = evaluarConcentracion(
      [credito("A", 50), credito("B", 30), credito("C", 20)],
      25,
    )
    expect(r.cumple).toBe(false)
    expect(r.excedidos).toEqual(["A", "B"])
    expect(r.creditoMayorId).toBe("A")
    expect(r.maximaPct).toBe(50)
  })

  it("un solo crédito pesa el 100 %", () => {
    expect(evaluarConcentracion([credito("A", 10)], 25).maximaPct).toBe(100)
  })

  it("una cartera vacía cumple", () => {
    expect(evaluarConcentracion([], 25)).toMatchObject({ cumple: true, maximaPct: 0 })
  })
})

describe("mora", () => {
  it("supera la mora solo por encima del máximo", () => {
    expect(superaMora(credito("A", 1, 30), fondeador.condiciones)).toBe(false)
    expect(superaMora(credito("A", 1, 31), fondeador.condiciones)).toBe(true)
  })

  it("calcula el porcentaje del saldo en mora", () => {
    expect(
      moraCarteraPct([credito("A", 75), credito("B", 20, 3), credito("C", 5, 90)]),
    ).toBe(25)
    expect(moraCarteraPct([])).toBe(0)
  })

  it("calcula el plazo restante para sustituir", () => {
    expect(estadoPlazo(credito("A", 1, 30), fondeador.condiciones, hoy)).toBeNull()
    expect(estadoPlazo(credito("A", 1, 38), fondeador.condiciones, hoy)).toEqual({
      diasSobreLimite: 8,
      diasRestantes: 7,
      fechaLimite: "2026-10-22",
      vencido: false,
    })
    expect(estadoPlazo(credito("A", 1, 45), fondeador.condiciones, hoy)).toMatchObject({
      diasRestantes: 0,
      vencido: false,
    })
    expect(estadoPlazo(credito("A", 1, 50), fondeador.condiciones, hoy)).toMatchObject({
      diasRestantes: -5,
      fechaLimite: "2026-10-10",
      vencido: true,
    })
  })

  it("resume el cumplimiento del fondeador", () => {
    const r = resumenFondeador(fondeador, [
      credito("A", 25),
      credito("B", 25),
      credito("C", 25, 40),
      credito("D", 25, 5),
    ])
    expect(r.saldoTotal).toBe(100)
    expect(r.moraCarteraPct).toBe(50)
    expect(r.cumpleMoraCartera).toBe(false)
    expect(r.concentracion.cumple).toBe(true)
    expect(r.creditosSobreMora).toEqual(["C"])
  })

  it("alerta solo los créditos asignados sobre la mora de su fondeador, los más urgentes primero", () => {
    const otro: Fondeador = {
      ...fondeador,
      id: "FON-002",
      condiciones: { ...fondeador.condiciones, moraMaximaDias: 60, plazoSustitucionDias: 30 },
    }
    const creditos = [
      credito("A", 1, 38), // FON-001: 7 días restantes
      credito("B", 1, 50), // FON-002: no supera 60
      credito("C", 1, 75), // FON-002: 15 días restantes
      credito("D", 1, 44), // FON-001: 1 día restante
      credito("E", 1, 99), // sin fondeador
    ]
    const alertas = alertasDeMora([fondeador, otro], creditos, {
      ...asignados("FON-001", ["A", "D"]),
      ...asignados("FON-002", ["B", "C"]),
    }, hoy)
    expect(alertas.map((a) => [a.creditoId, a.diasRestantes])).toEqual([
      ["D", 1],
      ["A", 7],
      ["C", 15],
    ])
  })
})

describe("sustitución", () => {
  const cartera = [
    credito("A", 20),
    credito("B", 20),
    credito("C", 20),
    credito("D", 20),
    credito("S", 20, 40),
  ]
  const libres = [
    credito("L1", 21),
    credito("L2", 18),
    credito("L3", 20, 5),
    credito("L4", 60),
    credito("X", 20),
  ]
  const asignaciones = {
    ...asignados("FON-001", ["A", "B", "C", "D", "S"]),
    ...asignados("FON-002", ["X"]),
  }
  const saliente = cartera[4]
  const elegibilidad = (c: Credito) =>
    evaluarElegibilidad(c, saliente, fondeador, cartera, asignaciones)

  it("acepta un crédito libre, al día y que respeta la concentración", () => {
    expect(elegibilidad(libres[0])).toEqual({ elegible: true, motivos: [] })
  })

  it("rechaza un crédito en mora", () => {
    expect(elegibilidad(libres[2]).motivos).toEqual(["en_mora"])
  })

  it("rechaza un crédito que rompe la concentración", () => {
    expect(elegibilidad(libres[3]).motivos).toEqual(["concentracion"])
  })

  it("rechaza un crédito de otro fondeador o del mismo", () => {
    expect(elegibilidad(libres[4]).motivos).toEqual(["ya_asignado"])
    expect(elegibilidad(cartera[0]).motivos).toContain("ya_asignado")
  })

  it("rechaza al propio saliente", () => {
    expect(elegibilidad(saliente).motivos).toEqual(["es_el_saliente", "en_mora"])
  })

  it("ordena los candidatos por saldo parecido al saliente", () => {
    const candidatos = candidatosSustitucion(
      saliente,
      fondeador,
      [...cartera, ...libres],
      asignaciones,
    )
    expect(candidatos.map((c) => c.id)).toEqual(["L1", "L2"])
  })

  it("decide si una sustitución por mora fue a tiempo", () => {
    const c = fondeador.condiciones
    expect(sustitucionDentroDelPlazo(credito("S", 1, 45), c, "mora")).toBe(true)
    expect(sustitucionDentroDelPlazo(credito("S", 1, 46), c, "mora")).toBe(false)
    expect(sustitucionDentroDelPlazo(credito("S", 1, 90), c, "prepago")).toBeNull()
  })
})
