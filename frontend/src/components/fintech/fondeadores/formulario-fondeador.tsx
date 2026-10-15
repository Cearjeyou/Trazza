"use client"

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { toast } from "@/components/ui/toast"
import type { CondicionesFondeador, Fondeador } from "@/lib/dominio/tipos"
import { useDemo } from "@/lib/store/store"

const numero = (min: number, max: number, unidad: string, entero = true) => {
  const base = z.number({ error: "Escribe un número" })
  return (entero ? base.int("Debe ser un número entero") : base)
    .min(min, `Mínimo ${min} ${unidad}`)
    .max(max, `Máximo ${max} ${unidad}`)
}

const esquema = z.object({
  nombre: z.string().trim().min(3, "Escribe al menos 3 letras").max(60, "Máximo 60 caracteres"),
  moraMaximaDias: numero(1, 365, "días"),
  moraMaximaCarteraPct: numero(1, 100, "%", false),
  concentracionMaximaPct: numero(1, 100, "%", false),
  plazoSustitucionDias: numero(1, 180, "días"),
})

type Valores = z.infer<typeof esquema>

const NUEVO: Valores = {
  nombre: "",
  moraMaximaDias: 30,
  moraMaximaCarteraPct: 10,
  concentracionMaximaPct: 25,
  plazoSustitucionDias: 15,
}

const CAMPOS: {
  clave: keyof CondicionesFondeador
  etiqueta: string
  ayuda: string
  unidad: string
}[] = [
  {
    clave: "moraMaximaDias",
    etiqueta: "Mora máxima por crédito",
    ayuda: "Al pasar estos días, el crédito genera una alerta y debe sustituirse.",
    unidad: "días",
  },
  {
    clave: "plazoSustitucionDias",
    etiqueta: "Plazo para sustituir",
    ayuda: "Días desde que el crédito supera la mora máxima.",
    unidad: "días",
  },
  {
    clave: "moraMaximaCarteraPct",
    etiqueta: "Mora máxima de la cartera",
    ayuda: "Parte del saldo que puede tener algún día de mora.",
    unidad: "%",
  },
  {
    clave: "concentracionMaximaPct",
    etiqueta: "Concentración máxima",
    ayuda: "Lo máximo que puede pesar un solo crédito en el saldo del fondeador.",
    unidad: "%",
  },
]

export function FormularioFondeador({
  abierto,
  alCambiarAbierto,
  fondeador,
}: {
  abierto: boolean
  alCambiarAbierto: (abierto: boolean) => void
  /** null para crear uno nuevo. */
  fondeador: Fondeador | null
}) {
  const crearFondeador = useDemo((s) => s.crearFondeador)
  const editarFondeador = useDemo((s) => s.editarFondeador)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Valores>({ resolver: zodResolver(esquema), defaultValues: NUEVO })

  useEffect(() => {
    if (abierto) {
      reset(fondeador ? { nombre: fondeador.nombre, ...fondeador.condiciones } : NUEVO)
    }
  }, [abierto, fondeador, reset])

  function guardar({ nombre, ...condiciones }: Valores) {
    if (fondeador) {
      editarFondeador(fondeador.id, { nombre, condiciones })
      toast.add({ type: "success", title: "Condiciones actualizadas", description: nombre })
    } else {
      crearFondeador(nombre, condiciones)
      toast.add({
        type: "success",
        title: "Fondeador creado",
        description: `${nombre} ya está listo para recibir créditos.`,
      })
    }
    alCambiarAbierto(false)
  }

  return (
    <Sheet open={abierto} onOpenChange={alCambiarAbierto}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{fondeador ? "Editar fondeador" : "Nuevo fondeador"}</SheetTitle>
          <SheetDescription>
            Trazza vigila estas condiciones: genera alertas y no deja sustituir con
            créditos que las incumplan.
          </SheetDescription>
        </SheetHeader>
        <form
          id="formulario-fondeador"
          onSubmit={handleSubmit(guardar)}
          className="flex-1 overflow-y-auto px-6"
          noValidate
        >
          <FieldGroup>
            <Field data-invalid={!!errors.nombre || undefined}>
              <FieldLabel htmlFor="nombre">Nombre</FieldLabel>
              <Input
                id="nombre"
                autoComplete="organization"
                aria-invalid={!!errors.nombre}
                {...register("nombre")}
              />
              <FieldError errors={[errors.nombre]} />
            </Field>
            <FieldSet>
              <FieldLegend>Condiciones</FieldLegend>
              <FieldGroup>
                {CAMPOS.map((campo) => (
                  <Field key={campo.clave} data-invalid={!!errors[campo.clave] || undefined}>
                    <FieldLabel htmlFor={campo.clave}>{campo.etiqueta}</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        id={campo.clave}
                        type="number"
                        inputMode="decimal"
                        step="any"
                        aria-invalid={!!errors[campo.clave]}
                        {...register(campo.clave, { valueAsNumber: true })}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupText>{campo.unidad}</InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldDescription>{campo.ayuda}</FieldDescription>
                    <FieldError errors={[errors[campo.clave]]} />
                  </Field>
                ))}
              </FieldGroup>
            </FieldSet>
          </FieldGroup>
        </form>
        <SheetFooter className="flex-row justify-end">
          <Button variant="outline" onClick={() => alCambiarAbierto(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="formulario-fondeador">
            {fondeador ? "Guardar cambios" : "Crear fondeador"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
