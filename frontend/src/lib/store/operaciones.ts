import { compararCartera } from "@/lib/dominio/cartera"
import { calcularHuella } from "@/lib/dominio/huella"
import {
  creditosDe,
  evaluarElegibilidad,
  sustitucionDentroDelPlazo,
  type MotivoNoElegible,
} from "@/lib/dominio/reglas"
import type {
  Asignacion,
  CondicionesFondeador,
  Credito,
  DatosEvento,
  Evento,
  Fondeador,
  MotivoSustitucion,
  Sustitucion,
} from "@/lib/dominio/tipos"
import type { ErrorLedger, Ledger, ResultadoLedger } from "@/lib/ledger/tipos"

// Operaciones de la demo sobre un estado inmutable: reciben el estado y el
// ledger, y devuelven el estado nuevo junto con el resultado para la interfaz.

export interface EstadoDominio {
  fondeadores: Fondeador[]
  creditos: Credito[]
  /** creditoId → asignación vigente (copia fuera de la cadena). */
  asignaciones: Record<string, Asignacion>
  /** En orden de registro, el más antiguo primero. */
  eventos: Evento[]
  siguienteEvento: number
}

export function estadoDominioVacio(): EstadoDominio {
  return {
    fondeadores: [],
    creditos: [],
    asignaciones: {},
    eventos: [],
    siguienteEvento: 1,
  }
}

function idEvento(numero: number) {
  return `EV-${String(numero).padStart(5, "0")}`
}

/**
 * Calcula la huella del evento y lo envía al ledger. El número de evento solo
 * se consume si el ledger lo acepta.
 */
async function registrar(
  estado: EstadoDominio,
  datos: DatosEvento,
  fecha: Date,
  enviar: (eventoId: string, huella: string) => Promise<ResultadoLedger>,
): Promise<
  | { ok: true; evento: Evento }
  | { ok: false; error: ErrorLedger; asignadoA?: string }
> {
  const contenido = { id: idEvento(estado.siguienteEvento), fecha: fecha.toISOString(), datos }
  const huella = await calcularHuella(contenido)
  const resultado = await enviar(contenido.id, huella)
  if (!resultado.ok) return resultado
  estado.siguienteEvento++
  const evento: Evento = { ...contenido, huella, registro: resultado.registro }
  estado.eventos.push(evento)
  return { ok: true, evento }
}

// ── Fondeadores ──────────────────────────────────────────────────

export function crearFondeador(
  estado: EstadoDominio,
  nombre: string,
  condiciones: CondicionesFondeador,
): { estado: EstadoDominio; fondeador: Fondeador } {
  const mayor = estado.fondeadores.reduce(
    (max, f) => Math.max(max, Number(f.id.replace(/\D/g, "")) || 0),
    0,
  )
  const fondeador: Fondeador = {
    id: `FON-${String(mayor + 1).padStart(3, "0")}`,
    nombre: nombre.trim(),
    condiciones: { ...condiciones },
  }
  return {
    estado: { ...estado, fondeadores: [...estado.fondeadores, fondeador] },
    fondeador,
  }
}

export function editarFondeador(
  estado: EstadoDominio,
  id: string,
  cambios: { nombre?: string; condiciones?: Partial<CondicionesFondeador> },
): EstadoDominio {
  return {
    ...estado,
    fondeadores: estado.fondeadores.map((f) =>
      f.id === id
        ? {
            ...f,
            nombre: cambios.nombre?.trim() ?? f.nombre,
            condiciones: { ...f.condiciones, ...cambios.condiciones },
          }
        : f,
    ),
  }
}

// ── Cartera ──────────────────────────────────────────────────────

export interface ResultadoCarga {
  nuevos: number
  actualizados: number
  sinCambios: number
  /** Eventos de mora registrados para créditos asignados. */
  eventosMora: Evento[]
}

/**
 * Agrega los créditos nuevos y actualiza los existentes. Cada cambio de mora de
 * un crédito asignado queda registrado en el ledger.
 */
export async function cargarCartera(
  estadoPrevio: EstadoDominio,
  ledger: Ledger,
  entrantes: readonly Credito[],
  fecha: Date,
): Promise<{ estado: EstadoDominio; resultado: ResultadoCarga }> {
  const estado = structuredClone(estadoPrevio)
  const comparacion = compararCartera(estado.creditos, entrantes)
  const anteriores = new Map(estado.creditos.map((c) => [c.id, c]))

  for (const credito of [...comparacion.actualizados, ...comparacion.nuevos]) {
    anteriores.set(credito.id, { ...credito })
  }
  estado.creditos = [...anteriores.values()]

  const eventosMora: Evento[] = []
  for (const cambio of comparacion.cambiosMora) {
    const asignacion = estado.asignaciones[cambio.creditoId]
    if (!asignacion) continue
    const credito = anteriores.get(cambio.creditoId)!
    const r = await registrar(
      estado,
      {
        tipo: "mora",
        creditoId: credito.id,
        fondeadorId: asignacion.fondeadorId,
        diasMoraAnterior: cambio.antes,
        diasMora: cambio.despues,
        saldo: credito.saldo,
      },
      fecha,
      (eventoId, huella) =>
        ledger.registrarMora({ eventoId, creditoId: credito.id, huella }),
    )
    if (r.ok) eventosMora.push(r.evento)
  }

  return {
    estado,
    resultado: {
      nuevos: comparacion.nuevos.length,
      actualizados: comparacion.actualizados.length,
      sinCambios: comparacion.sinCambios.length,
      eventosMora,
    },
  }
}

// ── Asignación ───────────────────────────────────────────────────

export type ResultadoAsignacion =
  | { creditoId: string; ok: true; evento: Evento }
  | {
      creditoId: string
      ok: false
      error: ErrorLedger | "credito_inexistente" | "fondeador_inexistente"
      asignadoA?: string
    }

/**
 * Registra cada crédito por separado. No filtra los que ya tienen fondeador:
 * es el ledger el que los rechaza, como lo hará el contrato.
 */
export async function asignar(
  estadoPrevio: EstadoDominio,
  ledger: Ledger,
  fondeadorId: string,
  creditoIds: readonly string[],
  fecha: Date,
): Promise<{ estado: EstadoDominio; resultados: ResultadoAsignacion[] }> {
  const estado = structuredClone(estadoPrevio)
  const existeFondeador = estado.fondeadores.some((f) => f.id === fondeadorId)
  const resultados: ResultadoAsignacion[] = []

  for (const creditoId of creditoIds) {
    const credito = estado.creditos.find((c) => c.id === creditoId)
    if (!existeFondeador || !credito) {
      resultados.push({
        creditoId,
        ok: false,
        error: existeFondeador ? "credito_inexistente" : "fondeador_inexistente",
      })
      continue
    }
    const r = await registrar(
      estado,
      { tipo: "asignacion", creditoId, fondeadorId, saldo: credito.saldo },
      fecha,
      (eventoId, huella) =>
        ledger.registrarAsignacion({ eventoId, creditoId, fondeadorId, huella }),
    )
    if (r.ok) {
      estado.asignaciones[creditoId] = {
        creditoId,
        fondeadorId,
        fecha: r.evento.fecha,
        eventoId: r.evento.id,
      }
      resultados.push({ creditoId, ok: true, evento: r.evento })
    } else {
      resultados.push({ creditoId, ...r })
    }
  }

  return { estado, resultados }
}

// ── Sustitución ──────────────────────────────────────────────────

export interface SolicitudSustitucion {
  fondeadorId: string
  creditoSalienteId: string
  creditoEntranteId: string
  motivo: MotivoSustitucion
}

export type ResultadoSustitucion =
  | { ok: true; evento: Evento }
  | {
      ok: false
      error:
        | ErrorLedger
        | "credito_inexistente"
        | "fondeador_inexistente"
        | "no_elegible"
      motivos?: MotivoNoElegible[]
      asignadoA?: string
    }

export async function sustituir(
  estadoPrevio: EstadoDominio,
  ledger: Ledger,
  solicitud: SolicitudSustitucion,
  fecha: Date,
): Promise<{ estado: EstadoDominio; resultado: ResultadoSustitucion }> {
  const estado = structuredClone(estadoPrevio)
  const fallo = (resultado: ResultadoSustitucion) => ({
    estado: estadoPrevio,
    resultado,
  })

  const fondeador = estado.fondeadores.find((f) => f.id === solicitud.fondeadorId)
  if (!fondeador) return fallo({ ok: false, error: "fondeador_inexistente" })
  const saliente = estado.creditos.find((c) => c.id === solicitud.creditoSalienteId)
  const entrante = estado.creditos.find((c) => c.id === solicitud.creditoEntranteId)
  if (!saliente || !entrante) return fallo({ ok: false, error: "credito_inexistente" })
  if (estado.asignaciones[saliente.id]?.fondeadorId !== fondeador.id) {
    return fallo({ ok: false, error: "no_asignado" })
  }

  const elegibilidad = evaluarElegibilidad(
    entrante,
    saliente,
    fondeador,
    creditosDe(fondeador.id, estado.creditos, estado.asignaciones),
    estado.asignaciones,
  )
  if (!elegibilidad.elegible) {
    return fallo({ ok: false, error: "no_elegible", motivos: elegibilidad.motivos })
  }

  const r = await registrar(
    estado,
    {
      tipo: "sustitucion",
      fondeadorId: fondeador.id,
      creditoSalienteId: saliente.id,
      creditoEntranteId: entrante.id,
      motivo: solicitud.motivo,
      dentroDelPlazo: sustitucionDentroDelPlazo(
        saliente,
        fondeador.condiciones,
        solicitud.motivo,
      ),
    },
    fecha,
    (eventoId, huella) =>
      ledger.registrarSustitucion({
        eventoId,
        fondeadorId: fondeador.id,
        creditoSalienteId: saliente.id,
        creditoEntranteId: entrante.id,
        huella,
      }),
  )
  if (!r.ok) return fallo(r)

  delete estado.asignaciones[saliente.id]
  estado.asignaciones[entrante.id] = {
    creditoId: entrante.id,
    fondeadorId: fondeador.id,
    fecha: r.evento.fecha,
    eventoId: r.evento.id,
  }
  return { estado, resultado: { ok: true, evento: r.evento } }
}

// ── Consultas ────────────────────────────────────────────────────

export function listarSustituciones(
  eventos: readonly Evento[],
  fondeadorId?: string,
): Sustitucion[] {
  const lista: Sustitucion[] = []
  for (const { id, fecha, datos } of eventos) {
    if (datos.tipo !== "sustitucion") continue
    if (fondeadorId && datos.fondeadorId !== fondeadorId) continue
    lista.push({
      eventoId: id,
      fecha,
      fondeadorId: datos.fondeadorId,
      creditoSalienteId: datos.creditoSalienteId,
      creditoEntranteId: datos.creditoEntranteId,
      motivo: datos.motivo,
      dentroDelPlazo: datos.dentroDelPlazo,
    })
  }
  return lista.reverse()
}

/** Eventos que mencionan el crédito, del más antiguo al más reciente. */
export function eventosDeCredito(eventos: readonly Evento[], creditoId: string) {
  return eventos.filter(({ datos }) =>
    datos.tipo === "sustitucion"
      ? datos.creditoSalienteId === creditoId ||
        datos.creditoEntranteId === creditoId
      : datos.creditoId === creditoId,
  )
}
