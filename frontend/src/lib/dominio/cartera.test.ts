import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { CREDITOS_SEMILLA } from "@/lib/store/semilla"
import { compararCartera, leerCartera } from "./cartera"

const ejemplo = readFileSync("public/ejemplo-cartera.csv", "utf8")
const ejemploMora = readFileSync("public/ejemplo-cartera-mora.csv", "utf8")
const CABECERA =
  "id_credito,saldo,dias_mora,monto_original,fecha_desembolso,plazo_meses,sector"

describe("leerCartera", () => {
  it("lee los archivos de ejemplo sin errores", () => {
    for (const texto of [ejemplo, ejemploMora]) {
      const r = leerCartera(texto)
      expect(r.errores).toEqual([])
      expect(r.creditos).toHaveLength(25)
    }
  })

  it("el ejemplo empieza con la cartera de la demo tal como está hoy", () => {
    const { creditos } = leerCartera(ejemplo)
    expect(creditos.slice(0, CREDITOS_SEMILLA.length)).toEqual(CREDITOS_SEMILLA)
  })

  it("acepta punto y coma, BOM, comillas, mayúsculas y tildes", () => {
    const texto =
      "﻿ID_CREDITO;Saldo;dias_mora;monto_original;fecha_desembolso;plazo_meses;sector;notas\r\n" +
      'CR-9001;1000;0;2000;2026-01-01;12;"agro";"sin; notas"\r\n' +
      "CR-9002;1500.5;3;2000;2026-01-01;12;Comercio;\r\n"
    const r = leerCartera(texto)
    expect(r.errores).toEqual([])
    expect(r.columnasIgnoradas).toEqual(["notas"])
    expect(r.creditos.map((c) => [c.id, c.saldo, c.sector])).toEqual([
      ["CR-9001", 1000, "Agro"],
      ["CR-9002", 1500.5, "Comercio"],
    ])
  })

  it("informa las columnas que faltan", () => {
    const r = leerCartera("id_credito,saldo\nCR-1,100\n")
    expect(r.columnasFaltantes).toEqual([
      "dias_mora",
      "monto_original",
      "fecha_desembolso",
      "plazo_meses",
      "sector",
    ])
    expect(r.creditos).toEqual([])
    expect(r.errores).toHaveLength(1)
  })

  it("rechaza el archivo vacío", () => {
    expect(leerCartera("  \n").errores[0].mensaje).toMatch(/vacío/)
  })

  it("reporta cada error con su línea y columna y conserva las filas válidas", () => {
    const texto = [
      CABECERA,
      "CR-0001,100,0,200,2026-01-01,12,Comercio",
      "CR-0001,100,0,200,2026-01-01,12,Comercio",
      "CR-0003,abc,0,200,2026-01-01,12,Comercio",
      "CR-0004,300,0,200,2026-01-01,12,Comercio",
      "CR-0005,100,2.5,200,2026-01-01,12,Comercio",
      "CR-0006,100,0,200,01/01/2026,12,Comercio",
      "CR-0007,100,0,200,2026-01-01,0,Comercio",
      "CR-0008,100,0,200,2026-01-01,12,Minería",
      "Juan Pérez,100,0,200,2026-01-01,12,Comercio",
    ].join("\n")
    const r = leerCartera(texto)
    expect(r.creditos.map((c) => c.id)).toEqual(["CR-0001"])
    expect(r.errores.map((e) => [e.linea, e.columna])).toEqual([
      [3, "id_credito"],
      [4, "saldo"],
      [5, "saldo"],
      [6, "dias_mora"],
      [7, "fecha_desembolso"],
      [8, "plazo_meses"],
      [9, "sector"],
      [10, "id_credito"],
    ])
  })
})

describe("compararCartera", () => {
  it("separa nuevos, actualizados y sin cambios, y detecta los cambios de mora", () => {
    const actual = leerCartera(ejemplo).creditos
    const r = compararCartera(actual, leerCartera(ejemploMora).creditos)
    expect(r.nuevos).toEqual([])
    expect(r.actualizados).toHaveLength(8)
    expect(r.sinCambios).toHaveLength(17)
    expect(r.cambiosMora).toContainEqual({ creditoId: "CR-0006", antes: 0, despues: 36 })

    const conNuevo = compararCartera(actual.slice(0, 20), actual)
    expect(conNuevo.nuevos.map((c) => c.id)).toEqual([
      "CR-0021",
      "CR-0022",
      "CR-0023",
      "CR-0024",
      "CR-0025",
    ])
  })
})
