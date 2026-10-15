"use client"

import Link from "next/link"
import { useState } from "react"
import { Icono, ICONOS } from "@/components/iconos"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Fondeador } from "@/lib/dominio/tipos"
import { formatoPesos, plural } from "@/lib/formato"
import { useResumenes, type FondeadorConResumen } from "@/lib/store/selectores"
import { BarraLimite } from "../barra-limite"
import { FormularioFondeador } from "./formulario-fondeador"

function TarjetaFondeador({
  datos: { fondeador, resumen },
  alEditar,
}: {
  datos: FondeadorConResumen
  alEditar: () => void
}) {
  const { condiciones } = fondeador
  const condicionesTexto = [
    ["Mora máxima por crédito", plural(condiciones.moraMaximaDias, "día")],
    ["Plazo para sustituir", plural(condiciones.plazoSustitucionDias, "día")],
  ]
  const incumple =
    !resumen.concentracion.cumple || !resumen.cumpleMoraCartera || resumen.creditosSobreMora.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg">{fondeador.nombre}</CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-2">
          <span className="font-mono">{fondeador.id}</span>
          {resumen.numeroCreditos > 0 &&
            (incumple ? (
              <Badge variant="aviso">Requiere atención</Badge>
            ) : (
              <Badge variant="exito">Cumple sus condiciones</Badge>
            ))}
        </CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" onClick={alEditar}>
            <Icono icon={ICONOS.editar} data-icon="inline-start" />
            Editar
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-xs text-muted-foreground">Créditos asignados</dt>
            <dd className="font-heading text-xl font-bold tabular-nums">{resumen.numeroCreditos}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Saldo asignado</dt>
            <dd className="font-heading text-xl font-bold tabular-nums">{formatoPesos(resumen.saldoTotal, true)}</dd>
          </div>
          {condicionesTexto.map(([etiqueta, valor]) => (
            <div key={etiqueta}>
              <dt className="text-xs text-muted-foreground">{etiqueta}</dt>
              <dd className="font-medium">{valor}</dd>
            </div>
          ))}
        </dl>
        <Separator />
        <BarraLimite
          etiqueta="Crédito más grande"
          valor={resumen.concentracion.maximaPct}
          limite={condiciones.concentracionMaximaPct}
        />
        <BarraLimite
          etiqueta="Saldo en mora"
          valor={resumen.moraCarteraPct}
          limite={condiciones.moraMaximaCarteraPct}
        />
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        {resumen.creditosSobreMora.length > 0 ? (
          <Button variant="link" className="px-0" nativeButton={false} render={<Link href="/fintech/alertas" />}>
            {plural(resumen.creditosSobreMora.length, "crédito")} sobre la mora permitida
            <Icono icon={ICONOS.siguiente} data-icon="inline-end" />
          </Button>
        ) : resumen.numeroCreditos === 0 ? (
          <Button variant="link" className="px-0" nativeButton={false} render={<Link href="/fintech/asignacion" />}>
            Asígnale sus primeros créditos
            <Icono icon={ICONOS.siguiente} data-icon="inline-end" />
          </Button>
        ) : (
          "Ningún crédito supera la mora permitida."
        )}
      </CardFooter>
    </Card>
  )
}

export function VistaFondeadores() {
  const resumenes = useResumenes()
  const [editando, setEditando] = useState<Fondeador | null>(null)
  const [abierto, setAbierto] = useState(false)

  function abrir(fondeador: Fondeador | null) {
    setEditando(fondeador)
    setAbierto(true)
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {plural(resumenes.length, "fondeador", "fondeadores")}. La marca en cada barra es el límite acordado.
        </p>
        <Button onClick={() => abrir(null)}>
          <Icono icon={ICONOS.agregar} data-icon="inline-start" />
          Nuevo fondeador
        </Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {resumenes.map((datos) => (
          <TarjetaFondeador key={datos.fondeador.id} datos={datos} alEditar={() => abrir(datos.fondeador)} />
        ))}
      </div>
      <FormularioFondeador abierto={abierto} alCambiarAbierto={setAbierto} fondeador={editando} />
    </>
  )
}
