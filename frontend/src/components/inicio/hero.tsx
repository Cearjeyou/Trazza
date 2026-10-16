import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, SecurityCheckIcon } from "@hugeicons/core-free-icons"
import "./hero.css"

export function Hero() {
  return (
    <section id="inicio" className="trazzaHero">
      <div className="heroInner">
        <div className="trazzaHeroCopy">
          <h1 className="trazzaHeroTitle">Trazza</h1>
          <div className="trazzaHeroMessage">
            <span className="trazzaHeroShield">
              <HugeiconsIcon icon={SecurityCheckIcon} size={72} aria-hidden="true" />
            </span>
            <div className="trazzaHeroText">
              <p className="trazzaHeroHeadline">
                <span>Genera confianza con tu cartera.</span>
                <span>Fondea con información verificable.</span>
              </p>
              <p className="trazzaHeroDescription">
                Un registro compartido para comprobar la asignación y el historial de cada crédito.
              </p>
            </div>
          </div>
          <div className="trazzaHeroLink">
            <a href="#como-funciona" className="heroExplore">
              <span>Ver cómo funciona</span>
              <HugeiconsIcon icon={ArrowDown01Icon} size={26} aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className="heroArtwork" aria-hidden="true">
          <Image
            className="heroIllustration"
            src="/images/hero/creditos-verificables-v1.png"
            alt=""
            width={1672}
            height={941}
            sizes="(max-width: 1199px) 100vw, (min-width: 1760px) 951px, 54vw"
            preload
          />
        </div>
      </div>
    </section>
  )
}
