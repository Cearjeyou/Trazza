import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { Logo } from "@/components/marca/logo"
import { Button } from "@/components/ui/button"

// Provisional mientras se construyen los portales (fases 3 y 4).
export function EnConstruccion({ portal }: { portal: string }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-5 text-center">
      <Logo tamano={48} conNombre={false} />
      <h1 className="font-heading text-3xl font-extrabold tracking-tight">
        Portal {portal}
      </h1>
      <p className="max-w-md text-muted-foreground">
        Estamos construyendo esta parte de Trazza. Muy pronto podrás recorrer
        aquí el flujo completo con datos de demostración.
      </p>
      <Button variant="outline" nativeButton={false} render={<Link href="/" />}>
        <HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" />
        Volver al inicio
      </Button>
    </main>
  )
}
