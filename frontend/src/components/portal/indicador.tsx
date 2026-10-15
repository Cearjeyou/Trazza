import { Icono, type IconoDef } from "@/components/iconos"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function Indicador({
  titulo,
  valor,
  detalle,
  icono,
  destacado = false,
}: {
  titulo: string
  valor: string
  detalle: string
  icono: IconoDef
  destacado?: boolean
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{titulo}</CardDescription>
        <CardTitle className="font-heading text-2xl tabular-nums">{valor}</CardTitle>
        <CardAction>
          <span
            className={
              destacado
                ? "flex size-9 items-center justify-center rounded-xl bg-aviso text-aviso-foreground"
                : "flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground"
            }
          >
            <Icono icon={icono} className="size-5" />
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{detalle}</CardContent>
    </Card>
  )
}
