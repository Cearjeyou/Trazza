"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Edges, Float, Line } from "@react-three/drei"
import * as THREE from "three"
import { ESCALAS } from "@/lib/escalas"

// "La red de Trazza": créditos (bloques pequeños) conectados al contrato
// (bloque central). Los pulsos que llegan al centro son registros; el pulso
// rosa rebota, como una asignación duplicada que el contrato rechaza.

const COLORES = {
  plataforma: ESCALAS.azul[900],
  bordePlataforma: ESCALAS.azul[700],
  agua: ESCALAS.agua[400],
  lima: ESCALAS.lima[200],
  almendra: ESCALAS.almendra[100],
  // Un paso más claro que el Rosewood para que el pulso rechazado brille.
  rosa: ESCALAS.rosa[400],
}

type Modo = { simple: boolean; quieto: boolean }

function useModo(): Modo {
  const [modo, setModo] = useState<Modo>({ simple: false, quieto: false })
  useEffect(() => {
    const movil = window.matchMedia("(max-width: 767px), (pointer: coarse)")
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)")
    const actualizar = () =>
      setModo({ simple: movil.matches, quieto: reducido.matches })
    actualizar()
    movil.addEventListener("change", actualizar)
    reducido.addEventListener("change", actualizar)
    return () => {
      movil.removeEventListener("change", actualizar)
      reducido.removeEventListener("change", actualizar)
    }
  }, [])
  return modo
}

type Credito = {
  posicion: [number, number, number]
  color: string
  rechazado?: boolean
}

function creditos(simple: boolean): Credito[] {
  const total = simple ? 4 : 6
  const paleta = [COLORES.lima, COLORES.agua, COLORES.almendra]
  return Array.from({ length: total }, (_, i) => {
    const angulo = (i / total) * Math.PI * 2 + Math.PI / 6
    const radio = 3.1
    return {
      posicion: [Math.cos(angulo) * radio, 0.42, Math.sin(angulo) * radio],
      color: i === 1 ? COLORES.rosa : paleta[i % paleta.length],
      rechazado: i === 1,
    }
  })
}

function Bloque({
  tamano,
  color,
  opacidad = 0.72,
}: {
  tamano: [number, number, number]
  color: string
  opacidad?: number
}) {
  return (
    <mesh>
      <boxGeometry args={tamano} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.35}
        transparent
        opacity={opacidad}
        depthWrite
        roughness={0.2}
        metalness={0.1}
      />
      <Edges color={color} lineWidth={1.5} />
    </mesh>
  )
}

function Pulso({
  desde,
  color,
  desfase,
  rebota,
  quieto,
}: {
  desde: THREE.Vector3
  color: string
  desfase: number
  rebota?: boolean
  quieto: boolean
}) {
  const ref = useRef<THREE.Mesh>(null)
  const hasta = useMemo(() => new THREE.Vector3(0, 0.12, 0), [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const ciclo = quieto ? 0.5 : (clock.elapsedTime * 0.35 + desfase) % 1
    // El pulso rechazado llega hasta el borde del contrato y regresa.
    const t = rebota ? (ciclo < 0.5 ? ciclo * 1.6 : (1 - ciclo) * 1.6) : ciclo
    ref.current.position.lerpVectors(desde, hasta, Math.min(t, 0.86))
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  )
}

function Red({ modo }: { modo: Modo }) {
  const grupo = useRef<THREE.Group>(null)
  const cursor = useRef({ x: 0, y: 0 })
  const lista = useMemo(() => creditos(modo.simple), [modo.simple])

  useEffect(() => {
    if (modo.simple || modo.quieto) return
    const mover = (e: PointerEvent) => {
      cursor.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      }
    }
    window.addEventListener("pointermove", mover)
    return () => window.removeEventListener("pointermove", mover)
  }, [modo.simple, modo.quieto])

  useFrame(() => {
    if (!grupo.current) return
    // Inclinación leve hacia el cursor, suavizada.
    grupo.current.rotation.y = THREE.MathUtils.lerp(
      grupo.current.rotation.y,
      cursor.current.x * 0.18,
      0.05
    )
    grupo.current.rotation.x = THREE.MathUtils.lerp(
      grupo.current.rotation.x,
      cursor.current.y * 0.06,
      0.05
    )
  })

  return (
    <group ref={grupo}>
      {/* Plataforma */}
      <mesh position={[0, -0.18, 0]}>
        <boxGeometry args={[9, 0.3, 9]} />
        <meshStandardMaterial color={COLORES.plataforma} roughness={0.7} />
        <Edges color={COLORES.bordePlataforma} />
      </mesh>

      {/* Contrato */}
      <group position={[0, 1.3, 0]}>
        <Bloque tamano={[1.4, 2.6, 1.4]} color={COLORES.agua} opacidad={0.6} />
        <mesh position={[0, 1.36, 0]}>
          <boxGeometry args={[1.5, 0.12, 1.5]} />
          <meshBasicMaterial color={COLORES.lima} toneMapped={false} />
        </mesh>
      </group>

      {lista.map((credito, i) => {
        const desde = new THREE.Vector3(credito.posicion[0], 0.12, credito.posicion[2])
        const bloque = (
          <group position={credito.posicion}>
            <Bloque tamano={[0.8, 0.8, 0.8]} color={credito.color} />
          </group>
        )
        return (
          <group key={i}>
            {modo.quieto ? (
              bloque
            ) : (
              <Float speed={1.6} floatIntensity={0.35} rotationIntensity={0}>
                {bloque}
              </Float>
            )}
            <Line
              points={[desde, [0, 0.12, 0]]}
              color={credito.rechazado ? COLORES.rosa : COLORES.agua}
              lineWidth={1.4}
              transparent
              opacity={0.7}
            />
            <Pulso
              desde={desde}
              color={credito.rechazado ? COLORES.rosa : COLORES.lima}
              desfase={i / lista.length}
              rebota={credito.rechazado}
              quieto={modo.quieto}
            />
          </group>
        )
      })}
    </group>
  )
}

export default function EscenaRed() {
  const modo = useModo()
  return (
    <Canvas
      orthographic
      camera={{ position: [10, 9, 10], zoom: modo.simple ? 40 : 64 }}
      dpr={modo.simple ? [1, 1.5] : [1, 2]}
      frameloop={modo.quieto ? "demand" : "always"}
      gl={{ antialias: true, alpha: true }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[6, 12, 4]} intensity={1.3} />
      <pointLight position={[0, 3, 0]} color={COLORES.agua} intensity={18} distance={9} />
      <pointLight position={[-4, 2, 4]} color={COLORES.lima} intensity={8} distance={8} />
      <Red modo={modo} />
    </Canvas>
  )
}
