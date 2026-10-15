"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { CondicionesFondeador, Credito, Fondeador } from "@/lib/dominio/tipos"
import { estadoLedgerInicial, LedgerSimulado } from "@/lib/ledger/simulado"
import {
  asignar,
  cargarCartera,
  crearFondeador,
  editarFondeador,
  estadoDominioVacio,
  sustituir,
  type EstadoDominio,
  type ResultadoAsignacion,
  type ResultadoCarga,
  type ResultadoSustitucion,
  type SolicitudSustitucion,
} from "./operaciones"
import { crearEstadoSemilla, type EstadoDemo } from "./semilla"

interface AccionesDemo {
  /** true cuando ya se leyó localStorage (o se cargó la semilla). */
  listo: boolean
  /** Lee los datos guardados; si no hay, carga la demo inicial. Solo en el cliente. */
  inicializar: () => Promise<void>
  reiniciarDemo: () => Promise<void>
  crearFondeador: (nombre: string, condiciones: CondicionesFondeador) => Fondeador
  editarFondeador: (
    id: string,
    cambios: { nombre?: string; condiciones?: Partial<CondicionesFondeador> },
  ) => void
  cargarCartera: (creditos: readonly Credito[]) => Promise<ResultadoCarga>
  asignar: (fondeadorId: string, creditoIds: readonly string[]) => Promise<ResultadoAsignacion[]>
  sustituir: (solicitud: SolicitudSustitucion) => Promise<ResultadoSustitucion>
}

export type EstadoStore = EstadoDemo & AccionesDemo

// Las operaciones que tocan el ledger son asíncronas; se encolan para que dos
// clics seguidos no partan del mismo estado y uno pise al otro.
let cola: Promise<unknown> = Promise.resolve()
function enCola<T>(tarea: () => Promise<T>): Promise<T> {
  const siguiente = cola.then(tarea, tarea)
  cola = siguiente.catch(() => undefined)
  return siguiente
}

export const useDemo = create<EstadoStore>()(
  persist(
    (set, get) => {
      /** Ejecuta una operación con un ledger simulado sobre el estado actual. */
      async function conLedger<R>(
        operacion: (
          estado: EstadoDominio,
          ledger: LedgerSimulado,
          fecha: Date,
        ) => Promise<{ estado: EstadoDominio } & R>,
      ) {
        return enCola(async () => {
          const actual = get()
          const ledger = new LedgerSimulado(structuredClone(actual.ledger))
          const { estado, ...resto } = await operacion(actual, ledger, new Date())
          set({ ...soloDominio(estado), ledger: ledger.instantanea() })
          return resto as R
        })
      }

      return {
        ...estadoDominioVacio(),
        ledger: estadoLedgerInicial(),
        listo: false,

        inicializar: async () => {
          if (get().listo) return
          await useDemo.persist.rehydrate()
          if (get().fondeadores.length === 0) {
            set(await crearEstadoSemilla())
          }
          set({ listo: true })
        },

        reiniciarDemo: () =>
          enCola(async () => {
            set(await crearEstadoSemilla())
          }),

        crearFondeador: (nombre, condiciones) => {
          const r = crearFondeador(get(), nombre, condiciones)
          set({ fondeadores: r.estado.fondeadores })
          return r.fondeador
        },

        editarFondeador: (id, cambios) => {
          set({ fondeadores: editarFondeador(get(), id, cambios).fondeadores })
        },

        cargarCartera: async (creditos) =>
          (
            await conLedger<{ resultado: ResultadoCarga }>((e, l, f) =>
              cargarCartera(e, l, creditos, f),
            )
          ).resultado,

        asignar: async (fondeadorId, creditoIds) =>
          (
            await conLedger<{ resultados: ResultadoAsignacion[] }>((e, l, f) =>
              asignar(e, l, fondeadorId, creditoIds, f),
            )
          ).resultados,

        sustituir: async (solicitud) =>
          (
            await conLedger<{ resultado: ResultadoSustitucion }>((e, l, f) =>
              sustituir(e, l, solicitud, f),
            )
          ).resultado,
      }
    },
    {
      name: "trazza-demo",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // La hidratación la hace `inicializar` en el cliente, para no desajustar el HTML del servidor.
      skipHydration: true,
      partialize: (s): EstadoDemo => ({ ...soloDominio(s), ledger: s.ledger }),
    },
  ),
)

function soloDominio(s: EstadoDominio): EstadoDominio {
  return {
    fondeadores: s.fondeadores,
    creditos: s.creditos,
    asignaciones: s.asignaciones,
    eventos: s.eventos,
    siguienteEvento: s.siguienteEvento,
  }
}
