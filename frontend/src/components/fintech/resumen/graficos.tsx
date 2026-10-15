"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { PuntoMora } from "@/lib/dominio/evolucion"
import { formatoFecha, formatoPct, formatoPesos } from "@/lib/formato"
import type { EstadoCredito } from "@/lib/store/selectores"
import { NOMBRE_ESTADO } from "@/lib/store/selectores"

const pct = (v: number) => `${Math.round(v)} %`

/** Valor actual frente al límite de cada fondeador, en barras horizontales. */
export function GraficoLimite({
  datos,
  nombreValor,
}: {
  datos: { fondeador: string; valor: number; limite: number }[]
  nombreValor: string
}) {
  const config = {
    valor: { label: nombreValor, color: "var(--chart-2)" },
    limite: { label: "Límite", color: "var(--muted-foreground)" },
  } satisfies ChartConfig
  const maximo = Math.max(...datos.flatMap((d) => [d.valor, d.limite]), 10)

  return (
    <ChartContainer config={config} className="aspect-auto h-[180px] w-full">
      <BarChart data={datos} layout="vertical" margin={{ left: 4, right: 16 }} barGap={4}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" domain={[0, Math.ceil(maximo / 10) * 10]} tickFormatter={pct} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="fondeador" width={128} tickLine={false} axisLine={false} />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent formatter={(v, nombre) => (
            <span className="flex w-full justify-between gap-4">
              <span className="text-muted-foreground">{config[nombre as keyof typeof config]?.label}</span>
              <span className="font-mono font-medium tabular-nums">{formatoPct(Number(v))}</span>
            </span>
          )} />}
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="valor" radius={6} barSize={14} fill="var(--color-valor)">
          {datos.map((d) => (
            <Cell key={d.fondeador} fill={d.valor > d.limite ? "var(--destructive)" : "var(--color-valor)"} />
          ))}
        </Bar>
        <Bar dataKey="limite" radius={6} barSize={14} fill="var(--color-limite)" fillOpacity={0.35} />
      </BarChart>
    </ChartContainer>
  )
}

const COLORES_FONDEADOR = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-5)"]

export function GraficoEvolucion({
  puntos,
  fondeadores,
}: {
  puntos: PuntoMora[]
  fondeadores: { id: string; nombre: string; limite: number }[]
}) {
  const config = Object.fromEntries(
    fondeadores.map((f, i) => [f.id, { label: f.nombre, color: COLORES_FONDEADOR[i % COLORES_FONDEADOR.length] }]),
  ) satisfies ChartConfig
  const datos = puntos.map((p) => ({ t: Date.parse(`${p.fecha}T12:00:00Z`), fecha: p.fecha, ...p.valores }))
  const techo = Math.max(...fondeadores.map((f) => f.limite), ...puntos.flatMap((p) => Object.values(p.valores)), 10)

  return (
    <ChartContainer config={config} className="aspect-auto h-[240px] w-full">
      <LineChart data={datos} margin={{ left: 4, right: 16, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="t"
          type="number"
          scale="time"
          domain={["dataMin", "dataMax"]}
          tickLine={false}
          axisLine={false}
          tickFormatter={(t: number) => formatoFecha(new Date(t).toISOString()).replace(/ \d{4}$/, "")}
          minTickGap={32}
        />
        <YAxis tickFormatter={pct} tickLine={false} axisLine={false} width={44} domain={[0, Math.ceil(techo / 5) * 5]} />
        <ChartTooltip
          content={<ChartTooltipContent
            labelFormatter={(_, payload) => formatoFecha(String(payload?.[0]?.payload?.fecha ?? ""))}
            formatter={(v, id) => (
              <span className="flex w-full justify-between gap-4">
                <span className="text-muted-foreground">{config[String(id)]?.label}</span>
                <span className="font-mono font-medium tabular-nums">{formatoPct(Number(v))}</span>
              </span>
            )}
          />}
        />
        <ChartLegend content={<ChartLegendContent />} />
        {fondeadores.map((f) => (
          <ReferenceLine key={`l-${f.id}`} y={f.limite} stroke={`var(--color-${f.id})`} strokeDasharray="4 4" strokeOpacity={0.6} />
        ))}
        {fondeadores.map((f) => (
          <Line key={f.id} dataKey={f.id} type="stepAfter" stroke={`var(--color-${f.id})`} strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
        ))}
      </LineChart>
    </ChartContainer>
  )
}

const COLOR_ESTADO: Record<EstadoCredito, string> = {
  al_dia: "var(--chart-2)",
  en_mora: "var(--chart-5)",
  sobre_limite: "var(--chart-4)",
  sin_asignar: "var(--chart-3)",
}

export function GraficoEstados({ datos }: { datos: { estado: EstadoCredito; saldo: number; creditos: number }[] }) {
  const config = Object.fromEntries(
    datos.map((d) => [d.estado, { label: NOMBRE_ESTADO[d.estado], color: COLOR_ESTADO[d.estado] }]),
  ) satisfies ChartConfig
  const total = datos.reduce((s, d) => s + d.saldo, 0)

  return (
    <ChartContainer config={config} className="mx-auto aspect-square h-[240px]">
      <PieChart>
        <ChartTooltip
          content={<ChartTooltipContent hideLabel nameKey="estado" formatter={(v, _n, item) => (
            <span className="flex w-full justify-between gap-4">
              <span className="text-muted-foreground">{NOMBRE_ESTADO[item.payload.estado as EstadoCredito]} · {item.payload.creditos}</span>
              <span className="font-mono font-medium tabular-nums">{formatoPesos(Number(v), true)}</span>
            </span>
          )} />}
        />
        <Pie data={datos} dataKey="saldo" nameKey="estado" innerRadius={62} outerRadius={96} strokeWidth={3} stroke="var(--card)">
          {datos.map((d) => (
            <Cell key={d.estado} fill={`var(--color-${d.estado})`} />
          ))}
          <Label
            content={({ viewBox }) =>
              viewBox && "cx" in viewBox ? (
                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                  <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) - 6} className="fill-foreground text-lg font-bold">
                    {formatoPesos(total, true)}
                  </tspan>
                  <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 16} className="fill-muted-foreground text-xs">
                    saldo total
                  </tspan>
                </text>
              ) : null
            }
          />
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="estado" />} className="flex-wrap" />
      </PieChart>
    </ChartContainer>
  )
}
