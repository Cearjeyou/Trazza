import { ICONOS, type IconoDef } from "@/components/iconos"

export interface EnlacePortal {
  href: string
  titulo: string
  descripcion: string
  icono: IconoDef
}

export interface Portal {
  id: "fintech" | "fondeador"
  nombre: string
  inicio: string
  enlaces: EnlacePortal[]
}

export const PORTAL_FINTECH: Portal = {
  id: "fintech",
  nombre: "Fintech",
  inicio: "/fintech",
  enlaces: [
    {
      href: "/fintech",
      titulo: "Resumen",
      descripcion: "Cómo está tu cartera frente a las condiciones de cada fondeador.",
      icono: ICONOS.resumen,
    },
    {
      href: "/fintech/fondeadores",
      titulo: "Fondeadores",
      descripcion: "Condiciones de cada fondeador y cuánto de su límite estás usando.",
      icono: ICONOS.fondeadores,
    },
    {
      href: "/fintech/cartera",
      titulo: "Cartera",
      descripcion: "Carga el archivo de cartera y consulta todos tus créditos.",
      icono: ICONOS.cartera,
    },
    {
      href: "/fintech/asignacion",
      titulo: "Asignación",
      descripcion: "Asigna créditos a un fondeador y regístralos en la red.",
      icono: ICONOS.asignacion,
    },
    {
      href: "/fintech/alertas",
      titulo: "Alertas",
      descripcion: "Créditos que superan la mora permitida y el plazo para sustituirlos.",
      icono: ICONOS.alertas,
    },
    {
      href: "/fintech/actividad",
      titulo: "Actividad",
      descripcion: "Cada evento registrado, con su huella y su estado en la red.",
      icono: ICONOS.actividad,
    },
  ],
}

export const PORTAL_FONDEADOR: Portal = {
  id: "fondeador",
  nombre: "Fondeador",
  inicio: "/fondeador",
  enlaces: [
    {
      href: "/fondeador",
      titulo: "Mi cartera",
      descripcion: "En qué créditos está tu dinero y si se cumplen tus condiciones.",
      icono: ICONOS.saldo,
    },
    {
      href: "/fondeador/sustituciones",
      titulo: "Sustituciones",
      descripcion: "Cada crédito que la fintech te cambió, con su fecha, motivo y plazo.",
      icono: ICONOS.sustitucion,
    },
    {
      href: "/fondeador/verificar",
      titulo: "Verificar",
      descripcion: "Comprueba por tu cuenta que un registro no cambió y que el crédito es solo tuyo.",
      icono: ICONOS.huella,
    },
  ],
}

/** El enlace que corresponde a la ruta, el más específico primero. */
export function enlaceActivo(portal: Portal, ruta: string) {
  return [...portal.enlaces]
    .sort((a, b) => b.href.length - a.href.length)
    .find((e) => ruta === e.href || ruta.startsWith(`${e.href}/`))
}
