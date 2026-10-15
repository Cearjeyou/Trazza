"use client"

import Link from "next/link"
import { useMemo } from "react"
import { Icono, ICONOS } from "@/components/iconos"
import { Indicador } from "@/components/portal/indicador"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { evolucionMora } from "@/lib/dominio/evolucion"
import { saldoTotal } from "@/lib/dominio/reglas"
import { formatoEntero, formatoFechaHora, formatoPct, formatoPesos, plural } from "@/lib/formato"
import {
  useAlertas,
  useCreditos,
  useEstadosCreditos,
  useEventos,
  useNombresFondeadores,
  useResumenes,
  type EstadoCredito,
} from "@/lib/store/selectores"
import { describirEvento } from "../evento"
import { Huella } from "../huella"
import { InsigniaTipo } from "../insignias"
import { GraficoEstados, GraficoEvolucion, GraficoLimite } from "./graficos"

export function VistaResumen() {
  const creditos = useCreditos()
  const eventos = useEventos()
  const alertas = useAlertas()
  const resumenes = useResumenes()
  const estados = useEstadosCreditos()
  const nombres = useNombresFondeadores()

  const total = saldoTotal(creditos)
  const asignado = resumenes.reduce((s, r) => s + r.resumen.saldoTotal, 0)
  const ultimo = eventos.at(-1)
  const masUrgente = alertas[0]

  const puntos = useMemo(() => evolucionMora(eventos, creditos), [eventos, creditos])
  const porEstado = useMemo(() => {
    const acumulado = new Map<EstadoCredito, { saldo: number; creditos: number }>()
    for (const c of creditos) {
      const estado = estados.get(c.id) ?? "sin_asignar"
      const actual = acumulado.get(estado) ?? { saldo: 0, creditos: 0 }
      acumulado.set(estado, { saldo: actual.saldo + c.saldo, creditos: actual.creditos + 1 })
    }
    return (["al_dia", "en_mora", "sobre_limite", "sin_asignar"] as const)
      .filter((e) => acumulado.has(e))
      .map((estado) => ({ estado, ...acumulado.get(estado)! }))
  }, [creditos, estados])

  return (
    <>
      <section aria-label="Indicadores" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Indicador
          titulo="Cartera cargada"
          valor={formatoPesos(total, true)}
          detalle={plural(creditos.length, "crédito")}
          icono={ICONOS.saldo}
        />
        <Indicador
          titulo="Asignado a fondeadores"
          valor={formatoPct(total ? (asignado / total) * 100 : 0, 0)}
          detalle={`${formatoPesos(asignado, true)} en ${plural(resumenes.length, "fondeador", "fondeadores")}`}
          icono={ICONOS.asignacion}
        />
        <Indicador
          titulo="Alertas de mora"
          valor={formatoEntero(alertas.length)}
          detalle={
            masUrgente
              ? `${masUrgente.creditoId}: ${masUrgente.vencido ? "plazo vencido" : `quedan ${plural(masUrgente.diasRestantes, "día")}`}`
              : "Ningún crédito supera su mora permitida"
          }
          icono={ICONOS.alertas}
          destacado={alertas.length > 0}
        />
        <Indicador
          titulo="Eventos en la red"
          valor={formatoEntero(eventos.length)}
          detalle={ultimo ? `Último ledger #${formatoEntero(ultimo.registro.ledger)}` : "Aún no hay registros"}
          icono={ICONOS.red}
        />
      </section>

      <section aria-label="Cumplimiento por fondeador" className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Concentración por fondeador</CardTitle>
            <CardDescription>Peso del crédito más grande frente al límite de cada fondeador.</CardDescription>
          </CardHeader>
          <CardContent>
            <GraficoLimite
              nombreValor="Crédito más grande"
              datos={resumenes.map((r) => ({
                fondeador: r.fondeador.nombre,
                valor: r.resumen.concentracion.maximaPct,
                limite: r.fondeador.condiciones.concentracionMaximaPct,
              }))}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mora de cartera por fondeador</CardTitle>
            <CardDescription>Porcentaje del saldo con algún día de mora frente al permitido.</CardDescription>
          </CardHeader>
          <CardContent>
            <GraficoLimite
              nombreValor="Saldo en mora"
              datos={resumenes.map((r) => ({
                fondeador: r.fondeador.nombre,
                valor: r.resumen.moraCarteraPct,
                limite: r.fondeador.condiciones.moraMaximaCarteraPct,
              }))}
            />
          </CardContent>
        </Card>
      </section>

      <section aria-label="Evolución y estado" className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Evolución de la mora</CardTitle>
            <CardDescription>
              Saldo en mora de cada fondeador según los eventos registrados. La línea punteada es su límite.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GraficoEvolucion
              puntos={puntos}
              fondeadores={resumenes.map((r) => ({
                id: r.fondeador.id,
                nombre: r.fondeador.nombre,
                limite: r.fondeador.condiciones.moraMaximaCarteraPct,
              }))}
            />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Distribución por estado</CardTitle>
            <CardDescription>Saldo de la cartera según la mora permitida por su fondeador.</CardDescription>
          </CardHeader>
          <CardContent>
            <GraficoEstados datos={porEstado} />
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Últimos eventos</CardTitle>
          <CardDescription>Lo más reciente que quedó registrado en la red.</CardDescription>
          <CardAction>
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/fintech/actividad" />}>
              Ver toda la actividad
              <Icono icon={ICONOS.siguiente} data-icon="inline-end" />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <ol className="flex flex-col">
            {eventos
              .slice(-6)
              .reverse()
              .map((evento, i) => (
                <li key={evento.id} className="flex flex-col">
                  {i > 0 && <Separator />}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                    <InsigniaTipo tipo={evento.datos.tipo} />
                    <span className="min-w-0 flex-1 font-medium">{describirEvento(evento, nombres)}</span>
                    <Huella valor={evento.huella} />
                    <span className="text-right text-xs whitespace-nowrap text-muted-foreground tabular-nums sm:w-32">
                      {formatoFechaHora(evento.fecha)}
                    </span>
                  </div>
                </li>
              ))}
          </ol>
        </CardContent>
      </Card>
    </>
  )
}
