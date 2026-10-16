import { Building03Icon, UserGroupIcon } from "@hugeicons/core-free-icons"

// Oculta las tarjetas de demostración sin modificar las rutas de los portales.
export const MOSTRAR_TARJETAS_PORTALES = false

export const SECCIONES = [
  { id: "inicio", nombre: "Inicio" },
  { id: "como-funciona", nombre: "Cómo funciona" },
  { id: "beneficios", nombre: "Beneficios" },
  { id: "por-que-blockchain", nombre: "Por qué blockchain" },
] as const

export const PORTALES = [
  {
    href: "/fintech",
    nombre: "Fintech",
    descripcion: "Carga cartera, asigna y sustituye",
    icono: Building03Icon,
  },
  {
    href: "/fondeador/ingreso",
    nombre: "Fondeador",
    descripcion: "Consulta y verifica tus créditos",
    icono: UserGroupIcon,
  },
] as const
