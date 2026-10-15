"use client"

import dynamic from "next/dynamic"

// La escena usa WebGL, así que solo se carga en el navegador y en su
// propio bloque de código, sin frenar el primer pintado del inicio.
const EscenaRed = dynamic(() => import("./escena-red"), {
  ssr: false,
  loading: () => null,
})

export function EscenaCargador() {
  return <EscenaRed />
}
