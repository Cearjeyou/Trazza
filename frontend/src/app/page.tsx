import { Hero } from "@/components/inicio/hero"
import { MenuSuperior } from "@/components/inicio/menu-superior"
import { Movimiento } from "@/components/inicio/movimiento"
import { MOSTRAR_TARJETAS_PORTALES } from "@/components/inicio/datos"
import {
  Beneficios,
  Cierre,
  ComoFunciona,
  Pie,
  PorQueBlockchain,
} from "@/components/inicio/secciones"

// El inicio es siempre oscuro, sin importar el tema elegido en los portales.
export default function Inicio() {
  return (
    <div className="dark flex flex-1 flex-col bg-marca-azul text-white">
      <Movimiento>
        <MenuSuperior />
        <main className="flex flex-col">
          <Hero />
          <ComoFunciona />
          <Beneficios />
          <PorQueBlockchain />
          {MOSTRAR_TARJETAS_PORTALES ? <Cierre /> : null}
        </main>
        <Pie />
      </Movimiento>
    </div>
  )
}
