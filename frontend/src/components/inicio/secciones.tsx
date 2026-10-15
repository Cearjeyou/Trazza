import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  DocumentValidationIcon,
  FingerPrintIcon,
  HierarchyIcon,
  LockKeyIcon,
  ShieldCheckIcon,
  Link04Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PORTALES } from "./datos"
import { Revelar } from "./revelar"

function Encabezado({
  etiqueta,
  titulo,
  descripcion,
}: {
  etiqueta: string
  titulo: string
  descripcion?: string
}) {
  return (
    <Revelar className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
      <span className="text-sm font-semibold tracking-wide text-marca-lima uppercase">
        {etiqueta}
      </span>
      <h2 className="font-heading text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        {titulo}
      </h2>
      {descripcion && (
        <p className="text-lg text-pretty text-white/70">{descripcion}</p>
      )}
    </Revelar>
  )
}

const PASOS = [
  {
    icono: Link04Icon,
    titulo: "Registra",
    texto:
      "La fintech asigna cada crédito a un fondeador. La huella de esa asignación queda en la red con su fecha, igual que cada cambio de mora y cada sustitución.",
  },
  {
    icono: FingerPrintIcon,
    titulo: "Verifica",
    texto:
      "El fondeador recalcula la huella de cualquier registro y la compara con la publicada. Si alguien cambió un dato después, no coincide.",
  },
  {
    icono: ShieldCheckIcon,
    titulo: "Confirma exclusividad",
    texto:
      "El contrato rechaza asignar un crédito que ya pertenece a otro fondeador. El doble fondeo no pasa, y nadie puede saltarse esa regla.",
  },
]

export function ComoFunciona() {
  return (
    <section id="como-funciona" className="scroll-mt-18 bg-azul-975 py-28">
      <div className="mx-auto flex max-w-7xl flex-col gap-16 px-5 sm:px-8">
        <Encabezado
          etiqueta="Cómo funciona"
          titulo="Tres pasos, una sola versión de los hechos"
        />
        <ol className="grid gap-6 md:grid-cols-3">
          {PASOS.map((paso, i) => (
            <Revelar key={paso.titulo} retraso={i * 0.12}>
              <li className="flex h-full flex-col gap-5 rounded-3xl border border-white/10 bg-white/[0.03] p-8">
                <div className="flex items-center justify-between">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-marca-agua/15 text-marca-agua">
                    <HugeiconsIcon icon={paso.icono} size={24} />
                  </span>
                  <span className="font-mono text-sm text-white/40">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white">{paso.titulo}</h3>
                <p className="leading-relaxed text-white/70">{paso.texto}</p>
              </li>
            </Revelar>
          ))}
        </ol>
      </div>
    </section>
  )
}

const BENEFICIOS = [
  {
    para: "Para la fintech",
    puntos: [
      "Un respaldo verificable de lo que reportas a cada fondeador.",
      "Menos horas armando reportes y respondiendo dudas.",
      "Una misma versión de los hechos ante cualquier diferencia.",
    ],
  },
  {
    para: "Para el fondeador",
    puntos: [
      "Compruebas en qué créditos está tu dinero sin depender solo de reportes.",
      "Confirmas que tu crédito no está asignado a nadie más.",
      "Ves cuándo se hizo cada sustitución y si fue dentro del plazo.",
    ],
  },
]

export function Beneficios() {
  return (
    <section id="beneficios" className="scroll-mt-18 py-28">
      <div className="mx-auto flex max-w-7xl flex-col gap-16 px-5 sm:px-8">
        <Encabezado
          etiqueta="Beneficios"
          titulo="Confianza que se puede comprobar"
          descripcion="El dato lo sigue generando la fintech. Lo que cambia es que, una vez registrado, ya no se puede modificar y cualquiera de las partes lo puede verificar."
        />
        <div className="grid gap-6 md:grid-cols-2">
          {BENEFICIOS.map((grupo, i) => (
            <Revelar key={grupo.para} retraso={i * 0.12}>
              <div className="flex h-full flex-col gap-6 rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:p-10">
                <h3 className="text-2xl font-bold text-white">{grupo.para}</h3>
                <ul className="flex flex-col gap-4">
                  {grupo.puntos.map((punto) => (
                    <li key={punto} className="flex gap-3 text-white/80">
                      <HugeiconsIcon
                        icon={CheckmarkCircle02Icon}
                        size={22}
                        className="mt-0.5 shrink-0 text-marca-lima"
                      />
                      <span className="leading-relaxed">{punto}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Revelar>
          ))}
        </div>
      </div>
    </section>
  )
}

const RAZONES = [
  {
    icono: HierarchyIcon,
    titulo: "Partes que no confían entre sí comparten un registro",
    texto:
      "La fintech y sus fondeadores tienen intereses distintos, y los fondeadores pueden competir por la misma cartera. Todos necesitan la misma versión de qué crédito está asignado a quién.",
  },
  {
    icono: LockKeyIcon,
    titulo: "El historial no se puede reescribir",
    texto:
      "Toda base de datos tiene un administrador que puede modificar o borrar registros. En la red, lo que se registró en cada momento queda fijo, incluso ante una disputa.",
  },
  {
    icono: DocumentValidationIcon,
    titulo: "Sin un intermediario que concentre la confianza",
    texto:
      "Hoy la verificación depende de la palabra del originador o de auditorías periódicas. El registro permite una verificación continua e independiente.",
  },
]

export function PorQueBlockchain() {
  return (
    <section
      id="por-que-blockchain"
      className="scroll-mt-18 bg-azul-975 py-28"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-16 px-5 sm:px-8">
        <Encabezado
          etiqueta="Por qué blockchain"
          titulo="Una base de datos no alcanza"
          descripcion="Si el registro lo administra la fintech, el fondeador sigue dependiendo de su palabra. Si lo administra un tercero, la confianza solo cambia de manos."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {RAZONES.map((razon, i) => (
            <Revelar key={razon.titulo} retraso={i * 0.12}>
              <div className="flex h-full flex-col gap-5 rounded-3xl border border-white/10 bg-white/[0.03] p-8">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-marca-lima/15 text-marca-lima">
                  <HugeiconsIcon icon={razon.icono} size={24} />
                </span>
                <h3 className="text-xl font-bold text-white">{razon.titulo}</h3>
                <p className="leading-relaxed text-white/70">{razon.texto}</p>
              </div>
            </Revelar>
          ))}
        </div>
        <Revelar className="mx-auto flex max-w-3xl items-start gap-3 rounded-2xl border border-marca-almendra/25 bg-marca-almendra/[0.06] p-5 text-marca-almendra">
          <HugeiconsIcon icon={Cancel01Icon} size={20} className="mt-0.5 shrink-0" />
          <p className="leading-relaxed">
            En la red solo se publican huellas de los eventos. Los datos
            personales de los deudores nunca salen de los sistemas de la
            fintech.
          </p>
        </Revelar>
      </div>
    </section>
  )
}

export function Cierre() {
  return (
    <section id="entrar" className="scroll-mt-18 py-28">
      <div className="mx-auto flex max-w-5xl flex-col gap-14 px-5 sm:px-8">
        <Encabezado
          etiqueta="Pruébalo"
          titulo="Entra con datos de demostración"
          descripcion="Esta versión funciona con datos simulados. La conexión con la red de pruebas de Stellar llega en la siguiente entrega."
        />
        <div className="grid gap-6 md:grid-cols-2">
          {PORTALES.map((portal, i) => (
            <Revelar key={portal.href} retraso={i * 0.12}>
              <Card className="h-full border border-white/10 bg-white/[0.04]">
                <CardHeader>
                  <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-marca-agua/15 text-marca-agua">
                    <HugeiconsIcon icon={portal.icono} size={24} />
                  </span>
                  <CardTitle className="text-2xl font-bold">
                    Portal {portal.nombre.toLowerCase()}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {portal.descripcion}.
                  </CardDescription>
                </CardHeader>
                <CardContent />
                <CardFooter>
                  <Button
                    size="lg"
                    nativeButton={false}
                    render={<Link href={portal.href} />}
                  >
                    Entrar como {portal.nombre.toLowerCase()}
                    <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
                  </Button>
                </CardFooter>
              </Card>
            </Revelar>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Pie() {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 text-sm text-white/50 sm:flex-row sm:px-8">
        <span>Trazza · Proyecto académico</span>
        <span>Red de pruebas de Stellar (testnet) · Datos simulados</span>
      </div>
    </footer>
  )
}
