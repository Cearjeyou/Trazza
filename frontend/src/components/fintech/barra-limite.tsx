import { formatoPct } from "@/lib/formato"
import { cn } from "@/lib/utils"

/**
 * Uso frente a un límite: la barra llega hasta el valor y una marca señala el
 * límite. Pasa a Rosewood cuando lo supera.
 */
export function BarraLimite({
  etiqueta,
  valor,
  limite,
  escala = Math.max(limite * 1.6, valor, 1),
  formato = (v: number) => formatoPct(v),
}: {
  etiqueta: string
  valor: number
  limite: number
  /** Valor que ocupa el ancho completo. */
  escala?: number
  formato?: (v: number) => string
}) {
  const excede = valor > limite + 1e-9
  const ancho = Math.min(100, (valor / escala) * 100)
  const marca = Math.min(100, (limite / escala) * 100)

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="text-muted-foreground">{etiqueta}</span>
        <span className={cn("font-medium tabular-nums", excede && "text-destructive")}>
          {formato(valor)}
          <span className="font-normal text-muted-foreground"> / {formato(limite)}</span>
        </span>
      </div>
      <div
        role="meter"
        aria-label={etiqueta}
        aria-valuemin={0}
        aria-valuemax={escala}
        aria-valuenow={valor}
        aria-valuetext={`${formato(valor)} de un límite de ${formato(limite)}`}
        className="relative h-2.5 rounded-full bg-muted"
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500",
            excede ? "bg-destructive" : "bg-chart-2",
          )}
          style={{ width: `${ancho}%` }}
        />
        <div
          aria-hidden="true"
          className="absolute -top-1 h-4.5 w-0.5 rounded-full bg-foreground/70"
          style={{ left: `calc(${marca}% - 1px)` }}
        />
      </div>
    </div>
  )
}
