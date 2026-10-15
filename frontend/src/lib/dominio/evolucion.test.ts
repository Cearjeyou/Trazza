import { describe, expect, it } from "vitest"
import { crearEstadoSemilla } from "@/lib/store/semilla"
import { evolucionMora } from "./evolucion"

describe("evolucionMora", () => {
  it("reconstruye la mora de cada fondeador día a día con la historia de la semilla", async () => {
    const semilla = await crearEstadoSemilla(new Date("2026-10-15T15:00:00.000Z"))
    const puntos = evolucionMora(semilla.eventos, semilla.creditos)

    // Asignaciones (2 días), mora de CR-0004, sustitución y dos cortes.
    expect(puntos.map((p) => p.fecha)).toEqual([
      "2026-06-17",
      "2026-07-07",
      "2026-08-28",
      "2026-09-05",
      "2026-09-14",
      "2026-10-14",
    ])
    expect(puntos[0].valores).toEqual({ "FON-001": 0 })
    expect(puntos[2].valores["FON-001"]).toBeGreaterThan(15)
    // Tras sustituir CR-0004 el Fondo Andino vuelve a 0 %.
    expect(puntos[3].valores["FON-001"]).toBe(0)
    // Hoy coincide con el resumen: CR-0002 en mora.
    const andino = semilla.creditos.filter((c) =>
      ["CR-0001", "CR-0002", "CR-0003", "CR-0005", "CR-0006", "CR-0012"].includes(c.id),
    )
    const total = andino.reduce((s, c) => s + c.saldo, 0)
    expect(puntos.at(-1)!.valores["FON-001"]).toBeCloseTo((22_300_000 / total) * 100)
  })

  it("sin eventos no hay puntos", () => {
    expect(evolucionMora([], [])).toEqual([])
  })
})
