"use client"

import Link from "next/link"
import { useState } from "react"
import { motion } from "motion/react"
import { Icono, ICONOS } from "@/components/iconos"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import type { Evento } from "@/lib/dominio/tipos"
import { verificarEvento, type ResultadoVerificacion } from "@/lib/ledger/verificacion"
import { useLedgerConsulta } from "@/lib/store/selectores"

// Pausa breve para que se note la consulta a la red; la verificación real
// contra Horizon/RPC tardará algo parecido.
const PAUSA_RED = 600

/** Recalcula la huella del evento y la compara con la publicada, en línea. */
export function BotonVerificar({ evento }: { evento: Evento }) {
  const ledger = useLedgerConsulta()
  const [estado, setEstado] = useState<"listo" | "verificando" | ResultadoVerificacion>("listo")

  async function verificar() {
    setEstado("verificando")
    const [resultado] = await Promise.all([
      verificarEvento(evento, ledger),
      new Promise((r) => setTimeout(r, PAUSA_RED)),
    ])
    setEstado(resultado)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {typeof estado === "object" ? (
        <motion.span
          key="resultado"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {estado.coincide ? (
            <Badge variant="exito">
              <Icono icon={ICONOS.correcto} data-icon="inline-start" />
              Coincide con la red
            </Badge>
          ) : (
            <Badge variant="destructive">
              <Icono icon={ICONOS.rechazado} data-icon="inline-start" />
              No coincide
            </Badge>
          )}
        </motion.span>
      ) : (
        <span key="boton">
          <Button variant="outline" size="sm" onClick={verificar} disabled={estado === "verificando"}>
            {estado === "verificando" ? (
              <Spinner estado="searching" etiqueta="Consultando la red" />
            ) : (
              <Icono icon={ICONOS.huella} data-icon="inline-start" />
            )}
            {estado === "verificando" ? "Consultando la red…" : "Verificar"}
          </Button>
        </span>
      )}
      <Button
        variant="link"
        size="sm"
        className="px-1"
        nativeButton={false}
        render={<Link href={`/fondeador/verificar?evento=${evento.id}`} />}
      >
        Paso a paso
      </Button>
    </div>
  )
}
