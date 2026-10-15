import { Hero } from "@/components/inicio/hero"
import { MenuSuperior } from "@/components/inicio/menu-superior"
import { Movimiento } from "@/components/inicio/movimiento"
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
          <Cierre />
        </main>
        <Pie />
      </Movimiento>
    </div>
  )
}
