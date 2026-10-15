import { SECTORES, type Credito, type Sector } from "./tipos"

export const COLUMNAS = [
  { clave: "id_credito", nombre: "Identificador" },
  { clave: "saldo", nombre: "Saldo" },
  { clave: "dias_mora", nombre: "Días de mora" },
  { clave: "monto_original", nombre: "Monto original" },
  { clave: "fecha_desembolso", nombre: "Fecha de desembolso" },
  { clave: "plazo_meses", nombre: "Plazo (meses)" },
  { clave: "sector", nombre: "Sector" },
] as const

export type ClaveColumna = (typeof COLUMNAS)[number]["clave"]

export interface ErrorCartera {
  /** Número de línea en el archivo (la cabecera es la 1). */
  linea: number
  columna?: ClaveColumna
  mensaje: string
}

export interface ResultadoCartera {
  columnas: string[]
  columnasFaltantes: ClaveColumna[]
  columnasIgnoradas: string[]
  creditos: Credito[]
  errores: ErrorCartera[]
}

const ID_VALIDO = /^[A-Za-z0-9-]{3,32}$/
const FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/
const NUMERO = /^\d+(\.\d+)?$/

function separarLinea(linea: string, separador: string) {
  const celdas: string[] = []
  let actual = ""
  let entreComillas = false
  for (let i = 0; i < linea.length; i++) {
    const c = linea[i]
    if (c === '"') {
      if (entreComillas && linea[i + 1] === '"') {
        actual += '"'
        i++
      } else {
        entreComillas = !entreComillas
      }
    } else if (c === separador && !entreComillas) {
      celdas.push(actual)
      actual = ""
    } else {
      actual += c
    }
  }
  celdas.push(actual)
  return celdas.map((celda) => celda.trim())
}

function normalizar(texto: string) {
  return texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
}

function buscarSector(texto: string): Sector | undefined {
  return SECTORES.find((s) => normalizar(s) === normalizar(texto))
}

/**
 * Lee la cartera desde un CSV separado por comas o por punto y coma (como lo
 * exporta Excel en español). Devuelve los créditos válidos y los errores por línea.
 */
export function leerCartera(texto: string): ResultadoCartera {
  const lineas = texto
    .replace(/^﻿/, "")
    .split(/\r?\n/)
    .map((contenido, i) => ({ contenido, numero: i + 1 }))
    .filter((l) => l.contenido.trim() !== "")

  if (lineas.length === 0) {
    return {
      columnas: [],
      columnasFaltantes: COLUMNAS.map((c) => c.clave),
      columnasIgnoradas: [],
      creditos: [],
      errores: [{ linea: 1, mensaje: "El archivo está vacío" }],
    }
  }

  const cabecera = lineas[0].contenido
  const separador =
    cabecera.split(";").length > cabecera.split(",").length ? ";" : ","
  const columnas = separarLinea(cabecera, separador).map(normalizar)
  const conocidas = new Set<string>(COLUMNAS.map((c) => c.clave))
  const columnasFaltantes = COLUMNAS.map((c) => c.clave).filter(
    (clave) => !columnas.includes(clave),
  )
  const columnasIgnoradas = columnas.filter((c) => !conocidas.has(c))

  const resultado: ResultadoCartera = {
    columnas,
    columnasFaltantes,
    columnasIgnoradas,
    creditos: [],
    errores: [],
  }
  if (columnasFaltantes.length > 0) {
    resultado.errores.push({
      linea: lineas[0].numero,
      mensaje: `Faltan columnas: ${columnasFaltantes.join(", ")}`,
    })
    return resultado
  }

  const indice = Object.fromEntries(columnas.map((c, i) => [c, i])) as Record<
    ClaveColumna,
    number
  >
  const vistos = new Set<string>()

  for (const { contenido, numero } of lineas.slice(1)) {
    const celdas = separarLinea(contenido, separador)
    const valor = (clave: ClaveColumna) => celdas[indice[clave]] ?? ""
    const erroresFila: ErrorCartera[] = []
    const error = (columna: ClaveColumna, mensaje: string) =>
      erroresFila.push({ linea: numero, columna, mensaje })

    const numeroDe = (clave: ClaveColumna, entero: boolean) => {
      const texto = valor(clave)
      if (!NUMERO.test(texto) || (entero && texto.includes("."))) {
        error(clave, `"${texto}" no es un número ${entero ? "entero " : ""}válido`)
        return 0
      }
      return Number(texto)
    }

    const id = valor("id_credito")
    if (!ID_VALIDO.test(id)) {
      error("id_credito", `"${id}" no es un identificador válido`)
    } else if (vistos.has(id)) {
      error("id_credito", `${id} está repetido en el archivo`)
    }
    vistos.add(id)

    const saldo = numeroDe("saldo", false)
    const montoOriginal = numeroDe("monto_original", false)
    const diasMora = numeroDe("dias_mora", true)
    const plazoMeses = numeroDe("plazo_meses", true)

    if (montoOriginal > 0 && saldo > montoOriginal) {
      error("saldo", "El saldo no puede superar el monto original")
    }
    if (plazoMeses === 0 && !erroresFila.some((e) => e.columna === "plazo_meses")) {
      error("plazo_meses", "El plazo debe ser mayor que cero")
    }

    const fechaDesembolso = valor("fecha_desembolso")
    if (
      !FECHA_ISO.test(fechaDesembolso) ||
      Number.isNaN(Date.parse(fechaDesembolso))
    ) {
      error("fecha_desembolso", `"${fechaDesembolso}" no es una fecha AAAA-MM-DD`)
    }

    const sector = buscarSector(valor("sector"))
    if (!sector) {
      error("sector", `"${valor("sector")}" no es un sector conocido`)
    }

    if (erroresFila.length > 0 || !sector) {
      resultado.errores.push(...erroresFila)
      continue
    }
    resultado.creditos.push({
      id,
      saldo,
      montoOriginal,
      diasMora,
      fechaDesembolso,
      plazoMeses,
      sector,
    })
  }

  return resultado
}

export interface CambioMora {
  creditoId: string
  antes: number
  despues: number
}

export interface ComparacionCartera {
  nuevos: Credito[]
  actualizados: Credito[]
  sinCambios: Credito[]
  cambiosMora: CambioMora[]
}

/** Clasifica los créditos de un archivo frente a la cartera que ya existe. */
export function compararCartera(
  actual: readonly Credito[],
  entrantes: readonly Credito[],
): ComparacionCartera {
  const porId = new Map(actual.map((c) => [c.id, c]))
  const comparacion: ComparacionCartera = {
    nuevos: [],
    actualizados: [],
    sinCambios: [],
    cambiosMora: [],
  }

  for (const credito of entrantes) {
    const previo = porId.get(credito.id)
    if (!previo) {
      comparacion.nuevos.push(credito)
      continue
    }
    const igual = (Object.keys(credito) as (keyof Credito)[]).every(
      (clave) => credito[clave] === previo[clave],
    )
    if (igual) {
      comparacion.sinCambios.push(credito)
      continue
    }
    comparacion.actualizados.push(credito)
    if (credito.diasMora !== previo.diasMora) {
      comparacion.cambiosMora.push({
        creditoId: credito.id,
        antes: previo.diasMora,
        despues: credito.diasMora,
      })
    }
  }

  return comparacion
}
