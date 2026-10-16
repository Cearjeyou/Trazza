"use client"

import dynamic from "next/dynamic"
import { Component, useCallback, useState, type ReactNode } from "react"
import { EscenaPoster } from "./escena-poster"

// La escena usa WebGL, así que solo se carga en el navegador y en su
// propio bloque de código, sin frenar el primer pintado del inicio.
const EscenaRed = dynamic(() => import("./escena-red"), {
  ssr: false,
  loading: () => null,
})

class LimiteEscena extends Component<{ children: ReactNode; onError: () => void }, { fallo: boolean }> {
  state = { fallo: false }
  static getDerivedStateFromError() { return { fallo: true } }
  componentDidCatch() { this.props.onError() }
  render() { return this.state.fallo ? null : this.props.children }
}

export function EscenaCargador() {
  const [estado, setEstado] = useState<"cargando" | "lista" | "error">("cargando")
  const lista = useCallback(() => setEstado("lista"), [])
  const error = useCallback(() => setEstado("error"), [])
  return (
    <div className="absolute inset-0" aria-hidden="true" data-scene-state={estado}>
      {estado !== "lista" ? <div className="absolute inset-0"><EscenaPoster /></div> : null}
      {estado !== "error" ? (
        <div className="absolute inset-0" style={{ visibility: estado === "lista" ? "visible" : "hidden" }}>
          <LimiteEscena onError={error}>
            <EscenaRed onLista={lista} onError={error} />
          </LimiteEscena>
        </div>
      ) : null}
    </div>
  )
}
