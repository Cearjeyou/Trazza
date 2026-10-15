// Formatos de pantalla con Intl, en español de Colombia.

const pesos = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
})

const pesosCompactos = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  notation: "compact",
  maximumFractionDigits: 1,
})

const entero = new Intl.NumberFormat("es-CO")

const fecha = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "America/Bogota",
})

const fechaHora = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Bogota",
})

export function formatoPesos(valor: number, compacto = false) {
  return (compacto ? pesosCompactos : pesos).format(valor)
}

export function formatoEntero(valor: number) {
  return entero.format(valor)
}

export function formatoPct(valor: number, decimales = 1) {
  return `${valor.toLocaleString("es-CO", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })} %`
}

/** Fecha ISO (completa o AAAA-MM-DD) a "15 oct 2026". */
export function formatoFecha(iso: string) {
  const valor = iso.length === 10 ? `${iso}T12:00:00Z` : iso
  return fecha.format(new Date(valor))
}

export function formatoFechaHora(iso: string) {
  return fechaHora.format(new Date(iso))
}

/** Huella o hash abreviado: 3f9a…c21b */
export function abreviarHuella(huella: string, lado = 6) {
  return huella.length <= lado * 2 ? huella : `${huella.slice(0, lado)}…${huella.slice(-lado)}`
}

export function plural(n: number, singular: string, pluralTexto = `${singular}s`) {
  return `${formatoEntero(n)} ${n === 1 ? singular : pluralTexto}`
}
