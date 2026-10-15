import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, SecurityCheckIcon } from "@hugeicons/core-free-icons"
import { EscenaCargador } from "@/components/escena/escena-cargador"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative isolate flex min-h-svh items-center overflow-hidden pt-18"
    >
      {/* Brillos de fondo */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_75%_45%,color-mix(in_oklab,var(--marca-agua)_22%,transparent),transparent_70%),radial-gradient(40%_40%_at_15%_85%,color-mix(in_oklab,var(--marca-lima)_10%,transparent),transparent_70%)]"
      />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-5 sm:px-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="relative z-10 flex flex-col gap-8 py-10">
          <h1 className="font-heading text-[clamp(4.5rem,13vw,10rem)] leading-[0.85] font-extrabold tracking-tighter text-white">
            Trazza
          </h1>

          <div className="flex items-center gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-marca-lima/70 text-marca-lima">
              <HugeiconsIcon icon={SecurityCheckIcon} size={26} />
            </span>
            <p className="max-w-sm text-xl leading-snug font-medium text-white/90 sm:text-2xl">
              Trazabilidad verificable para la cartera de crédito
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              variant="ghost"
              nativeButton={false}
              className="text-white/80 hover:bg-white/10 hover:text-white"
              render={<a href="#como-funciona" />}
            >
              Ver cómo funciona
              <HugeiconsIcon icon={ArrowDown01Icon} data-icon="inline-end" />
            </Button>
          </div>
        </div>

        <div className="relative h-[340px] sm:h-[460px] lg:h-[640px]">
          <EscenaCargador />
        </div>
      </div>
    </section>
  )
}
