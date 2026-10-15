import { readFileSync } from "node:fs"
import { beforeAll, describe, expect, it } from "vitest"
import { leerCartera } from "@/lib/dominio/cartera"
import { verificarHuella } from "@/lib/dominio/huella"
import {
  alertasDeMora,
  creditosDe,
  resumenFondeador,
} from "@/lib/dominio/reglas"
import { LedgerSimulado } from "@/lib/ledger/simulado"
import {
  asignar,
  cargarCartera,
  crearFondeador,
  editarFondeador,
  eventosDeCredito,
  listarSustituciones,
  sustituir,
} from "./operaciones"
import { crearEstadoSemilla, type EstadoDemo } from "./semilla"

const hoy = new Date("2026-10-15T15:00:00.000Z")
let semilla: EstadoDemo

beforeAll(async () => {
  semilla = await crearEstadoSemilla(hoy)
})

const ledgerDe = (estado: EstadoDemo) =>
  new LedgerSimulado(structuredClone(estado.ledger), () => hoy)

describe("datos semilla", () => {
  it("tiene 2 fondeadores, 15 créditos y 11 asignados", () => {
    expect(semilla.fondeadores).toHaveLength(2)
    expect(semilla.creditos).toHaveLength(15)
    expect(Object.keys(semilla.asignaciones)).toHaveLength(11)
  })

  it("coincide con lo que registró el ledger", async () => {
    const enLedger = Object.fromEntries(
      Object.values(semilla.asignaciones).map((a) => [a.creditoId, a.fondeadorId]),
    )
    expect(semilla.ledger.asignaciones).toEqual(enLedger)

    for (const evento of semilla.eventos) {
      const publicado = semilla.ledger.eventos[evento.id]
      expect(publicado.huella).toBe(evento.huella)
      expect((await verificarHuella(evento, publicado.huella)).coincide).toBe(true)
    }
  })

  it("cuenta la historia esperada", () => {
    const tipos = semilla.eventos.map((e) => e.datos.tipo)
    expect(tipos.filter((t) => t === "asignacion")).toHaveLength(11)
    expect(tipos.filter((t) => t === "sustitucion")).toHaveLength(1)
    expect(tipos.filter((t) => t === "mora")).toHaveLength(5)
    expect(semilla.eventos.map((e) => e.id)).toEqual(
      semilla.eventos.map((_, i) => `EV-${String(i + 1).padStart(5, "0")}`),
    )
    expect(listarSustituciones(semilla.eventos)).toEqual([
      expect.objectContaining({
        fondeadorId: "FON-001",
        creditoSalienteId: "CR-0004",
        creditoEntranteId: "CR-0012",
        dentroDelPlazo: true,
      }),
    ])
  })

  it("hoy CR-0002 y CR-0009 tienen alerta de mora", () => {
    const alertas = alertasDeMora(
      semilla.fondeadores,
      semilla.creditos,
      semilla.asignaciones,
      hoy,
    )
    expect(alertas.map((a) => [a.creditoId, a.diasRestantes])).toEqual([
      ["CR-0002", 7],
      ["CR-0009", 15],
    ])
  })

  it("respeta la concentración y deja al Fondo Andino fuera de su mora de cartera", () => {
    const [andino, horizonte] = semilla.fondeadores.map((f) =>
      resumenFondeador(f, creditosDe(f.id, semilla.creditos, semilla.asignaciones)),
    )
    expect(andino.concentracion.cumple).toBe(true)
    expect(horizonte.concentracion.cumple).toBe(true)
    expect(andino.cumpleMoraCartera).toBe(false)
    expect(horizonte.cumpleMoraCartera).toBe(true)
  })
})

describe("asignar", () => {
  it("registra los libres y deja que el ledger rechace los de otro fondeador", async () => {
    const { estado, resultados } = await asignar(
      semilla,
      ledgerDe(semilla),
      "FON-002",
      ["CR-0013", "CR-0001", "CR-0014", "CR-9999"],
      hoy,
    )
    expect(resultados).toEqual([
      expect.objectContaining({ creditoId: "CR-0013", ok: true }),
      { creditoId: "CR-0001", ok: false, error: "asignado_a_otro", asignadoA: "FON-001" },
      expect.objectContaining({ creditoId: "CR-0014", ok: true }),
      { creditoId: "CR-9999", ok: false, error: "credito_inexistente" },
    ])
    expect(estado.asignaciones["CR-0001"].fondeadorId).toBe("FON-001")
    expect(estado.asignaciones["CR-0013"].fondeadorId).toBe("FON-002")
    // El rechazo no consume número de evento.
    expect(estado.eventos.slice(-2).map((e) => e.id)).toEqual(["EV-00018", "EV-00019"])
    // No muta el estado de entrada.
    expect(semilla.asignaciones["CR-0013"]).toBeUndefined()
  })

  it("rechaza todo si el fondeador no existe", async () => {
    const { resultados } = await asignar(semilla, ledgerDe(semilla), "FON-404", ["CR-0013"], hoy)
    expect(resultados[0]).toMatchObject({ ok: false, error: "fondeador_inexistente" })
  })
})

describe("cargarCartera", () => {
  it("con el corte de mora registra un evento por cada crédito asignado que cambió", async () => {
    const { creditos } = leerCartera(
      readFileSync("public/ejemplo-cartera-mora.csv", "utf8"),
    )
    const { estado, resultado } = await cargarCartera(semilla, ledgerDe(semilla), creditos, hoy)
    expect(resultado).toMatchObject({ nuevos: 10, actualizados: 7, sinCambios: 8 })
    // CR-0004 y CR-0015 cambian pero no están asignados.
    expect(resultado.eventosMora.map((e) => e.datos)).toEqual([
      expect.objectContaining({ creditoId: "CR-0002", diasMoraAnterior: 38, diasMora: 45 }),
      expect.objectContaining({ creditoId: "CR-0006", diasMoraAnterior: 0, diasMora: 36 }),
      expect.objectContaining({ creditoId: "CR-0009", diasMoraAnterior: 75, diasMora: 82 }),
      expect.objectContaining({ creditoId: "CR-0010", diasMoraAnterior: 0, diasMora: 15 }),
      expect.objectContaining({ creditoId: "CR-0011", diasMoraAnterior: 0, diasMora: 64 }),
    ])
    expect(estado.creditos).toHaveLength(25)
    expect(
      alertasDeMora(estado.fondeadores, estado.creditos, estado.asignaciones, hoy).map(
        (a) => [a.creditoId, a.diasRestantes],
      ),
    ).toEqual([
      ["CR-0002", 0],
      ["CR-0009", 8],
      ["CR-0006", 9],
      ["CR-0011", 26],
    ])
  })

  it("volver a cargar el mismo archivo no genera eventos", async () => {
    const { resultado } = await cargarCartera(
      semilla,
      ledgerDe(semilla),
      semilla.creditos,
      hoy,
    )
    expect(resultado).toMatchObject({ nuevos: 0, actualizados: 0, sinCambios: 15 })
    expect(resultado.eventosMora).toEqual([])
  })
})

describe("sustituir", () => {
  const solicitud = {
    fondeadorId: "FON-001",
    creditoSalienteId: "CR-0002",
    creditoEntranteId: "CR-0014",
    motivo: "mora" as const,
  }

  it("mueve la asignación y deja constancia del plazo", async () => {
    const { estado, resultado } = await sustituir(semilla, ledgerDe(semilla), solicitud, hoy)
    expect(resultado).toMatchObject({
      ok: true,
      evento: { datos: { dentroDelPlazo: true, creditoEntranteId: "CR-0014" } },
    })
    expect(estado.asignaciones["CR-0002"]).toBeUndefined()
    expect(estado.asignaciones["CR-0014"].fondeadorId).toBe("FON-001")
    expect(eventosDeCredito(estado.eventos, "CR-0002").map((e) => e.datos.tipo)).toEqual([
      "asignacion",
      "mora",
      "mora",
      "sustitucion",
    ])
  })

  it("rechaza candidatos no elegibles sin tocar el estado", async () => {
    const { estado, resultado } = await sustituir(
      semilla,
      ledgerDe(semilla),
      { ...solicitud, creditoEntranteId: "CR-0015" },
      hoy,
    )
    expect(resultado).toEqual({ ok: false, error: "no_elegible", motivos: ["en_mora"] })
    expect(estado).toBe(semilla)
  })

  it("rechaza sustituir un crédito que no es del fondeador", async () => {
    const { resultado } = await sustituir(
      semilla,
      ledgerDe(semilla),
      { ...solicitud, creditoSalienteId: "CR-0009" },
      hoy,
    )
    expect(resultado).toMatchObject({ ok: false, error: "no_asignado" })
  })
})

describe("fondeadores", () => {
  it("crea con el siguiente identificador y edita las condiciones", () => {
    const { estado, fondeador } = crearFondeador(semilla, "  Nuevo Fondo ", {
      moraMaximaDias: 45,
      moraMaximaCarteraPct: 12,
      concentracionMaximaPct: 20,
      plazoSustitucionDias: 20,
    })
    expect(fondeador).toMatchObject({ id: "FON-003", nombre: "Nuevo Fondo" })

    const editado = editarFondeador(estado, "FON-003", {
      condiciones: { moraMaximaDias: 50 },
    })
    expect(editado.fondeadores[2].condiciones).toEqual({
      moraMaximaDias: 50,
      moraMaximaCarteraPct: 12,
      concentracionMaximaPct: 20,
      plazoSustitucionDias: 20,
    })
  })
})
