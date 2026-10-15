"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Icono, ICONOS } from "@/components/iconos"
import { Logo } from "@/components/marca/logo"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatoPesos, plural } from "@/lib/formato"
import { entrarComo } from "@/lib/sesion"
import { useResumenes } from "@/lib/store/selectores"
import { cn } from "@/lib/utils"

export function VistaIngreso() {
  const resumenes = useResumenes()
  const router = useRouter()
  const [elegido, setElegido] = useState(resumenes[0]?.fondeador.id ?? "")
  const nombre = resumenes.find((r) => r.fondeador.id === elegido)?.fondeador.nombre

  function entrar() {
    if (!elegido) return
    entrarComo(elegido)
    router.push("/fondeador")
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="items-center text-center">
        <CardTitle className="font-heading text-2xl">Portal del fondeador</CardTitle>
        <CardDescription>
          Elige con qué fondeador de la demostración quieres entrar. Verás sus créditos y podrás
          verificar cada registro por tu cuenta.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <ul role="radiogroup" aria-label="Fondeador" className="flex flex-col gap-2">
          {resumenes.map(({ fondeador, resumen }) => {
            const activo = fondeador.id === elegido
            return (
              <li key={fondeador.id}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={activo}
                  onClick={() => setElegido(fondeador.id)}
                  onDoubleClick={entrar}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    activo && "border-primary bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-full border",
                      activo && "border-primary",
                    )}
                  >
                    {activo && <span className="size-2 rounded-full bg-primary" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{fondeador.nombre}</span>
                    <span className="block text-sm text-muted-foreground">
                      {plural(resumen.numeroCreditos, "crédito")} · {formatoPesos(resumen.saldoTotal, true)}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        <p className="flex items-start gap-2 rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
          <Icono icon={ICONOS.huella} className="mt-0.5 size-4 shrink-0" />
          En la versión final entrarás con tu passkey (huella, rostro o PIN del dispositivo), sin
          instalar una billetera cripto.
        </p>
      </CardContent>
      <CardFooter className="flex-col gap-3">
        <Button className="w-full" size="lg" onClick={entrar} disabled={!elegido}>
          Entrar{nombre ? ` como ${nombre}` : ""}
          <Icono icon={ICONOS.siguiente} data-icon="inline-end" />
        </Button>
        <div className="flex w-full justify-between text-sm">
          <Button variant="link" className="px-0" nativeButton={false} render={<Link href="/" />}>
            <Icono icon={ICONOS.anterior} data-icon="inline-start" />
            Volver al inicio
          </Button>
          <Button variant="link" className="px-0" nativeButton={false} render={<Link href="/fintech" />}>
            Soy la fintech
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

export function MarcoIngreso({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8 px-4 py-10">
      <Link href="/" aria-label="Trazza, ir al inicio">
        <Logo tamano={40} className="dark:hidden" />
        <Logo tamano={40} fondo="oscuro" className="hidden dark:inline-flex" />
      </Link>
      {children}
    </main>
  )
}
