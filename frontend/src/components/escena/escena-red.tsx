"use client"

import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { ContactShadows, Environment, Lightformer, Line, MeshReflectorMaterial, MeshTransmissionMaterial, OrthographicCamera, RoundedBox } from "@react-three/drei"
import * as THREE from "three"
import { ESCALAS } from "@/lib/escalas"
import { EscenaPoster } from "./escena-poster"

const C = {
  azul: ESCALAS.azul[950], fondo: ESCALAS.azul[975],
  agua: ESCALAS.agua[400], lima: ESCALAS.lima[200],
  rosa: ESCALAS.rosa[600], almendra: ESCALAS.almendra[100],
}
const FONDO_CRISTAL = new THREE.Color(C.azul)
type Punto = [number, number, number]
type Modo = { simple: boolean; quieto: boolean }

function useModo(): Modo {
  const [modo, setModo] = useState<Modo>({ simple: true, quieto: true })
  useEffect(() => {
    const compacto = matchMedia("(max-width: 767px)")
    const reducido = matchMedia("(prefers-reduced-motion: reduce)")
    const actualizar = () => setModo({ simple: compacto.matches, quieto: reducido.matches })
    actualizar()
    compacto.addEventListener("change", actualizar)
    reducido.addEventListener("change", actualizar)
    return () => {
      compacto.removeEventListener("change", actualizar)
      reducido.removeEventListener("change", actualizar)
    }
  }, [])
  return modo
}

function Encuadre() {
  const { size } = useThree()
  return <OrthographicCamera makeDefault position={[9, 7.5, 12]} near={0.1} far={70}
    zoom={Math.min(size.width / 11.5, size.height / 7.8)}
    onUpdate={camera => camera.lookAt(0, 1.15, 0)} />
}

function Pieza({ tamano, posicion = [0, 0, 0], color = C.fondo, metal = 0.35, brillo = 0, radio = 0.07 }: {
  tamano: Punto; posicion?: Punto; color?: string; metal?: number; brillo?: number; radio?: number
}) {
  return (
    <RoundedBox args={tamano} radius={Math.min(radio, ...tamano.map(n => n / 3))} smoothness={3}
      position={posicion} castShadow receiveShadow>
      <meshPhysicalMaterial color={color} metalness={metal} roughness={0.17} clearcoat={0.8} clearcoatRoughness={0.12}
        emissive={color} emissiveIntensity={brillo} />
    </RoundedBox>
  )
}

function Cristal({ tamano, posicion, simple }: { tamano: Punto; posicion: Punto; simple: boolean }) {
  return (
    <RoundedBox args={tamano} radius={0.045} smoothness={3} position={posicion}>
      {simple ? (
        <meshPhysicalMaterial color={C.agua} metalness={0.05} roughness={0.07}
          clearcoat={1} transparent opacity={0.25} depthWrite={false} />
      ) : (
        <MeshTransmissionMaterial color={ESCALAS.agua[100]} transmission={1}
          roughness={0.035} thickness={0.15} ior={1.2} resolution={512} samples={6}
          chromaticAberration={0.006} anisotropicBlur={0} distortion={0}
          temporalDistortion={0} clearcoat={1} envMapIntensity={1.2} background={FONDO_CRISTAL} />
      )}
    </RoundedBox>
  )
}

function Expediente({ color, pequeno = false }: { color: string; pequeno?: boolean }) {
  return (
    <group scale={pequeno ? 0.65 : 1}>
      <Pieza tamano={[0.72, 0.95, 0.09]} color={C.almendra} metal={0.1} radio={0.05} />
      <Pieza tamano={[0.18, 0.2, 0.016]} posicion={[0.18, 0.21, 0.053]} color={color} radio={0.02} />
      {[0.09, -0.05, -0.19].map((y, i) => (
        <Pieza key={y} tamano={[i === 2 ? 0.24 : 0.37, 0.035, 0.014]}
          posicion={[-0.05, y, 0.055]} color={ESCALAS.azul[500]} metal={0} radio={0.005} />
      ))}
    </group>
  )
}

function Sello() {
  return (
    <group position={[0, 0.37, 1.095]}>
      <Pieza tamano={[0.58, 0.62, 0.09]} color={C.fondo} radio={0.07} />
      <Line points={[[-0.18, 0.2, 0.055], [0, 0.26, 0.055], [0.18, 0.2, 0.055],
        [0.16, -0.08, 0.055], [0, -0.23, 0.055], [-0.16, -0.08, 0.055], [-0.18, 0.2, 0.055]]}
        color={C.lima} lineWidth={2} />
      <Line points={[[-0.09, 0.015, 0.065], [-0.015, -0.06, 0.065], [0.1, 0.09, 0.065]]}
        color={C.lima} lineWidth={2.5} />
    </group>
  )
}

function Registro({ simple }: { simple: boolean }) {
  const niveles = simple ? 7 : 10
  return (
    <group>
      <Pieza tamano={[2.55, 0.19, 2.25]} posicion={[0, 0.095, 0]} color={C.fondo} radio={0.2} />
      <Pieza tamano={[2.4, 0.055, 2.12]} posicion={[0, 0.215, 0]} color={C.agua} brillo={0.6} radio={0.16} />
      <Pieza tamano={[2.38, 0.24, 2.1]} posicion={[0, 0.36, 0]} color={C.almendra} metal={0.72} radio={0.15} />
      <Pieza tamano={[2.16, 0.16, 1.91]} posicion={[0, 0.56, 0]} radio={0.12} />
      <Pieza tamano={[2.12, 0.07, 1.88]} posicion={[0, 0.68, 0]} color={C.almendra} metal={0.6} radio={0.12} />
      <Sello />
      {/* El núcleo es un archivo de registros, protegido por tres aletas de cristal. */}
      {Array.from({ length: niveles }, (_, i) => {
        const y = 0.95 + i * (2.4 / niveles)
        return (
          <group key={i} position={[0, y, 0]}>
            <Pieza tamano={[1.06, 0.18, 0.96]} color={C.almendra} metal={0.2} radio={0.05} />
            <Pieza tamano={[0.27, 0.026, 0.025]} posicion={[-0.2, 0, 0.49]} color={ESCALAS.azul[500]} radio={0.006} />
            <Pieza tamano={[0.08, 0.045, 0.025]} posicion={[0.37, 0, 0.49]} color={C.lima} brillo={1.1} radio={0.01} />
          </group>
        )
      })}
      <Cristal tamano={[0.17, 3.25, 1.5]} posicion={[-0.79, 2.37, 0]} simple={simple} />
      <Cristal tamano={[0.17, 3.6, 1.5]} posicion={[0.79, 2.54, 0]} simple={simple} />
      <Cristal tamano={[1.5, 3.43, 0.17]} posicion={[0, 2.46, -0.78]} simple={simple} />
      {[-0.79, 0.79].map(x => (
        <group key={x}>
          <Pieza tamano={[0.035, 3.2, 0.035]} posicion={[x, 2.36, 0.73]} color={C.agua} brillo={0.7} radio={0.01} />
          <Pieza tamano={[0.2, 0.045, 1.53]} posicion={[x, x < 0 ? 4 : 4.34, 0]} color={C.almendra} metal={0.8} radio={0.014} />
          <Pieza tamano={[0.18, 0.045, 1.53]} posicion={[x, 0.8, 0]} color={C.lima} brillo={0.9} radio={0.014} />
          <Pieza tamano={[0.025, x < 0 ? 3.2 : 3.54, 0.025]} posicion={[x + 0.085, x < 0 ? 2.4 : 2.57, -0.72]} color={C.almendra} metal={0.9} radio={0.007} />
        </group>
      ))}
    </group>
  )
}

function Origen({ posicion }: { posicion: Punto }) {
  return (
    <group position={posicion}>
      <Pieza tamano={[1.65, 0.16, 1.5]} posicion={[0, 0.08, 0]} color={C.almendra} metal={0.65} radio={0.12} />
      <Pieza tamano={[1.58, 0.88, 1.4]} posicion={[0, 0.58, 0]} radio={0.14} />
      <Pieza tamano={[1.23, 0.48, 0.065]} posicion={[0, 0.6, 0.718]} color={ESCALAS.rosa[975]} metal={0.45} radio={0.05} />
      {[-1, 1].map(lado => (
        <group key={lado}>
          <Pieza tamano={[1.3, 0.065, 0.12]} posicion={[0, 0.6 + lado * 0.27, 0.74]} color={C.almendra} metal={0.9} radio={0.025} />
          <Pieza tamano={[0.065, 0.55, 0.12]} posicion={[lado * 0.65, 0.6, 0.74]} color={C.almendra} metal={0.9} radio={0.025} />
        </group>
      ))}
      <RoundedBox args={[1.2, 0.46, 0.06]} radius={0.04} position={[0, 0.6, 0.78]}>
        <meshPhysicalMaterial color={C.rosa} roughness={0.08} metalness={0.2} clearcoat={1}
          transmission={0.6} thickness={0.08} ior={1.45} emissive={C.rosa} emissiveIntensity={0.12} />
      </RoundedBox>
      <Pieza tamano={[1.06, 0.025, 0.05]} posicion={[0, 0.79, 0.82]} color={C.rosa} brillo={3} radio={0.008} />
      <Pieza tamano={[0.91, 0.02, 0.05]} posicion={[0, 0.39, 0.82]} color={C.rosa} brillo={2} radio={0.006} />
      <Pieza tamano={[1.07, 0.09, 0.65]} posicion={[0, 1.04, -0.04]} radio={0.04} />
      {[0, 1, 2].map(i => (
        <group key={i} position={[-0.08 + i * 0.07, 1.38 + i * 0.06, 0.13 - i * 0.21]} rotation={[-0.12, 0, 0]}>
          <Expediente color={C.rosa} />
        </group>
      ))}
      {[0.37, 0.61].map(y => <Pieza key={y} tamano={[0.025, 0.035, 0.6]} posicion={[-0.8, y, 0]} color={ESCALAS.azul[500]} radio={0.005} />)}
    </group>
  )
}

function Fondeador({ posicion, simple }: { posicion: Punto; simple: boolean }) {
  return (
    <group position={posicion}>
      <Pieza tamano={[1.8, 0.2, 1.7]} posicion={[0, 0.1, 0]} color={C.almendra} metal={0.7} radio={0.14} />
      <Pieza tamano={[1.65, 0.12, 1.55]} posicion={[0, 0.27, 0]} radio={0.08} />
      <Pieza tamano={[1.6, 0.05, 1.48]} posicion={[0, 0.36, 0]} color={C.agua} brillo={0.8} radio={0.06} />
      <Cristal tamano={[1.64, 1.7, 1.54]} posicion={[0, 1.23, 0]} simple={simple} />
      {[-1, 1].map(lado => (
        <group key={lado}>
          <Pieza tamano={[1.64, 0.035, 0.045]} posicion={[0, 2.08, lado * 0.74]} color={C.almendra} metal={0.9} radio={0.01} />
          <Pieza tamano={[0.045, 0.035, 1.52]} posicion={[lado * 0.78, 2.08, 0]} color={C.almendra} metal={0.9} radio={0.01} />
          {[-0.73, 0.73].map(z => <Pieza key={z} tamano={[0.025, 1.64, 0.025]} posicion={[lado * 0.79, 1.23, z]} color={C.almendra} metal={0.9} radio={0.007} />)}
        </group>
      ))}
      {[0, 1, 2].map(i => (
        <group key={i} position={[-0.05 + i * 0.04, 1.08 + i * 0.04, 0.32 - i * 0.28]} rotation={[-0.08, 0, 0]}>
          <Expediente color={C.agua} />
        </group>
      ))}
      <mesh position={[0.86, 1.1, 0.05]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 0.13, 24]} />
        <meshStandardMaterial color={C.almendra} metalness={0.8} roughness={0.19} />
      </mesh>
      <mesh position={[0.94, 1.1, 0.05]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.13, 0.025, 8, 24]} />
        <meshStandardMaterial color={C.fondo} metalness={0.7} roughness={0.2} />
      </mesh>
    </group>
  )
}

const RUTAS: Punto[][] = [
  [[-4.18, 0.055, -1.95], [-3.4, 0.055, -1.95], [-1.35, 0.055, -1.25],
    [0, 0.055, -1.25], [1.35, 0.055, -1.25], [1.3, 0.055, -2.8], [0.7, 0.055, -3.8]],
  [[-2.25, 0.055, 1.8], [-1.7, 0.055, 1.8], [-1.35, 0.055, 1.25],
    [0, 0.055, 1.25], [1.35, 0.055, 1.25], [2.8, 0.055, 0.6], [4, 0.055, 0.6]],
]

function Recorrido({ puntos, indice, quieto }: { puntos: Punto[]; indice: number; quieto: boolean }) {
  const ficha = useRef<THREE.Group>(null)
  const tiempo = useRef(indice * 9)
  const curva = useMemo(() => new THREE.CatmullRomCurve3(puntos.map(p => new THREE.Vector3(...p)), false, "centripetal"), [puntos])
  const posicion = useMemo(() => new THREE.Vector3(), [])
  useFrame((_, delta) => {
    if (!ficha.current) return
    if (!quieto) tiempo.current += delta
    curva.getPointAt(quieto ? (indice === 0 ? 0.22 : 0.8) : (tiempo.current % 22) / 22, posicion)
    ficha.current.position.copy(posicion)
    ficha.current.position.y += 0.39
  })
  return (
    <group>
      <Line points={curva.getPoints(50)} color={C.agua} lineWidth={1.5} transparent opacity={0.75} />
      <group ref={ficha}>
        <Expediente color={indice === 0 ? C.rosa : C.agua} pequeno />
        <Pieza tamano={[0.57, 0.035, 0.2]} posicion={[0, -0.32, 0]} color={C.lima} brillo={1.1} radio={0.012} />
      </group>
    </group>
  )
}

function Plataforma({ simple }: { simple: boolean }) {
  const huella = useMemo(() => {
    // Recortar la esquina vacía mantiene el borde de la plataforma dentro del encuadre.
    const vertices = [[-5.9, -5.1], [5.9, -5.1], [5.9, 5.1], [-2, 5.1], [-5.9, 0.5]]
      .map(([x, z]) => new THREE.Vector2(x, -z))
    const forma = new THREE.Shape()
    vertices.forEach((vertice, i) => {
      const anterior = vertices[(i + vertices.length - 1) % vertices.length]
      const siguiente = vertices[(i + 1) % vertices.length]
      const entrada = vertice.clone().add(anterior.clone().sub(vertice).normalize().multiplyScalar(0.22))
      const salida = vertice.clone().add(siguiente.clone().sub(vertice).normalize().multiplyScalar(0.22))
      if (i === 0) forma.moveTo(entrada.x, entrada.y)
      else forma.lineTo(entrada.x, entrada.y)
      forma.quadraticCurveTo(vertice.x, vertice.y, salida.x, salida.y)
    })
    forma.closePath()
    return forma
  }, [])
  return (
    <group>
      {[
        { y: -0.31, profundidad: 0.12, escala: 1, color: C.fondo },
        { y: -0.175, profundidad: 0.025, escala: 0.998, color: C.agua },
        { y: -0.14, profundidad: 0.11, escala: 0.994, color: C.azul },
      ].map((capa, i) => (
        <mesh key={i} position={[0, capa.y, 0]} rotation={[-Math.PI / 2, 0, 0]}
          scale={[capa.escala, capa.escala, 1]} receiveShadow>
          <extrudeGeometry args={[huella, { depth: capa.profundidad, bevelEnabled: true,
            bevelSize: 0.035, bevelThickness: 0.015, bevelSegments: 3, steps: 1 }]} />
          <meshPhysicalMaterial color={capa.color} metalness={0.6} roughness={0.22}
            clearcoat={1} emissive={capa.color} emissiveIntensity={i === 1 ? 0.5 : 0} />
        </mesh>
      ))}
      {!simple ? (
        <mesh position={[0, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.992, 0.992, 1]}>
          <shapeGeometry args={[huella]} />
          <MeshReflectorMaterial color={ESCALAS.azul[600]} resolution={512} blur={[128, 64]}
            mirror={0.8} mixBlur={0.5} mixStrength={1.8} roughness={0.3} metalness={0.2}
            depthScale={0.2} minDepthThreshold={0.6} maxDepthThreshold={1.5} />
        </mesh>
      ) : null}
    </group>
  )
}

function Red({ modo }: { modo: Modo }) {
  return (
    <group position={[0.3, 0, 0]}>
      <Plataforma simple={modo.simple} />
      <Origen posicion={[-5, 0, -1.95]} />
      <Origen posicion={[-3.1, 0, 1.8]} />
      <Registro simple={modo.simple} />
      <Fondeador posicion={[1.6, 0, -3.8]} simple={modo.simple} />
      <Fondeador posicion={[4.9, 0, 0.6]} simple={modo.simple} />
      {RUTAS.map((puntos, i) => <Recorrido key={i} puntos={puntos} indice={i} quieto={modo.quieto} />)}
      <ContactShadows position={[0, 0.005, 0]} opacity={0.45} scale={15}
        blur={2.5} far={5} resolution={modo.simple ? 128 : 256} frames={1} />
    </group>
  )
}

function Lista({ onLista }: { onLista: () => void }) {
  // Solo revelar el Canvas cuando la escena y el entorno de reflejos se montaron.
  useEffect(() => { onLista() }, [onLista])
  return null
}

export default function EscenaRed({ onLista, onError }: { onLista: () => void; onError: () => void }) {
  const modo = useModo()
  return (
    <Canvas orthographic camera={{ position: [9, 7.5, 12], zoom: 45, near: 0.1, far: 70 }}
      dpr={modo.simple ? [1, 1.2] : [1, 1.6]} frameloop={modo.quieto ? "demand" : "always"}
      shadows="percentage"
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      onCreated={({ gl }) => { gl.domElement.addEventListener("webglcontextlost", onError, { once: true }) }}
      fallback={<EscenaPoster />} aria-hidden="true">
      <Encuadre />
      <ambientLight intensity={0.35} />
      <directionalLight position={[-3, 9, 7]} intensity={3} color={C.almendra} castShadow
        shadow-mapSize={[1024, 1024]} shadow-camera-left={-8} shadow-camera-right={8}
        shadow-camera-top={7} shadow-camera-bottom={-7} shadow-bias={-0.001} />
      <pointLight position={[0, 1, 0]} color={C.lima} intensity={7} distance={5} />
      <pointLight position={[-3, 1.5, 2]} color={C.rosa} intensity={8} distance={5} />
      <pointLight position={[3, 2, 1]} color={C.agua} intensity={10} distance={6} />
      <Suspense fallback={null}>
        <Environment resolution={modo.simple ? 64 : 128} frames={1}>
          <Lightformer form="rect" intensity={4} position={[0, 7, 2]} scale={[8, 4, 1]} rotation={[Math.PI / 2, 0, 0]} />
          <Lightformer form="rect" intensity={5} position={[0, 4, 7]} scale={[6, 2, 1]} rotation={[0, Math.PI, 0]} />
          <Lightformer form="rect" intensity={3} position={[-6, 2, 3]} scale={[2, 7, 1]} rotation={[0, Math.PI / 2, 0]} />
          <Lightformer form="rect" intensity={2.5} color={C.agua} position={[6, 3, 0]} scale={[3, 6, 1]} rotation={[0, -Math.PI / 2, 0]} />
        </Environment>
        <Red modo={modo} />
        <Lista onLista={onLista} />
      </Suspense>
    </Canvas>
  )
}
