import { beforeAll, describe, expect, it } from "vitest"

// El store guarda en localStorage; en Node se reemplaza por uno en memoria.
beforeAll(() => {
  const datos = new Map<string, string>()
  globalThis.localStorage = {
    getItem: (k) => datos.get(k) ?? null,
    setItem: (k, v) => void datos.set(k, v),
    removeItem: (k) => void datos.delete(k),
    clear: () => datos.clear(),
    key: (i) => [...datos.keys()][i] ?? null,
    get length() {
      return datos.size
    },
  }
})

describe("store de la demo", () => {
  it("inicializa con la semilla y ejecuta las operaciones que tocan el ledger", async () => {
    const { useDemo } = await import("./store")
    await useDemo.getState().inicializar()
    expect(useDemo.getState().listo).toBe(true)
    expect(useDemo.getState().creditos).toHaveLength(15)

    const resultados = await useDemo.getState().asignar("FON-002", ["CR-0013", "CR-0001"])
    expect(resultados.map((r) => r.ok)).toEqual([true, false])
    expect(useDemo.getState().asignaciones["CR-0013"].fondeadorId).toBe("FON-002")
    expect(useDemo.getState().ledger.asignaciones["CR-0013"]).toBe("FON-002")

    const carga = await useDemo.getState().cargarCartera([
      { ...useDemo.getState().creditos.find((c) => c.id === "CR-0013")!, diasMora: 4 },
    ])
    expect(carga.eventosMora).toHaveLength(1)

    const guardado = JSON.parse(localStorage.getItem("trazza-demo")!)
    expect(guardado.state.eventos).toHaveLength(useDemo.getState().eventos.length)
    expect(guardado.state).not.toHaveProperty("listo")
  })

  it("reiniciar vuelve a la semilla", async () => {
    const { useDemo } = await import("./store")
    await useDemo.getState().reiniciarDemo()
    expect(useDemo.getState().eventos).toHaveLength(17)
    expect(useDemo.getState().asignaciones["CR-0013"]).toBeUndefined()
  })
})
