// Genera las escalas de color de Trazza a partir de los cinco colores de la
// marca. Cada escala conserva el tono de su color base y varía la luminosidad;
// el color base ocupa exactamente el paso más cercano a su luminosidad.
//
// Uso: pnpm escalas  (reescribe src/app/escalas.css y src/lib/escalas.ts)

import { writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const MARCA = {
  azul: "#0a2463",
  agua: "#03b5aa",
  lima: "#affc41",
  rosa: "#ca054d",
  almendra: "#ffddd2",
}

// Luminosidad (OKLCH) de cada paso, similar a las escalas de Tailwind, y peso
// de saturación: los extremos son más neutros que los pasos medios.
const PASOS = [
  [50, 0.97, 0.35],
  [100, 0.936, 0.5],
  [200, 0.885, 0.7],
  [300, 0.808, 0.85],
  [400, 0.707, 1],
  [500, 0.623, 1],
  [600, 0.546, 1],
  [700, 0.488, 1],
  [800, 0.424, 1],
  [900, 0.36, 0.95],
  [950, 0.29, 0.9],
  [975, 0.22, 0.85],
]

const aLineal = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const aGamma = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)

function hexAOklch(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => aLineal(parseInt(hex.slice(i, i + 2), 16) / 255))
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  return { L, C: Math.hypot(a, bb), H: ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360 }
}

function oklchARgb(L, C, H) {
  const a = C * Math.cos((H * Math.PI) / 180)
  const b = C * Math.sin((H * Math.PI) / 180)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}

const enGama = (rgb) => rgb.every((c) => c >= -1e-4 && c <= 1 + 1e-4)

// Mayor croma representable en sRGB para una luminosidad y tono dados.
function cromaMaxima(L, H) {
  let bajo = 0
  let alto = 0.4
  for (let i = 0; i < 30; i++) {
    const medio = (bajo + alto) / 2
    if (enGama(oklchARgb(L, medio, H))) bajo = medio
    else alto = medio
  }
  return bajo
}

const aHex = (rgb) =>
  "#" +
  rgb
    .map((c) => Math.round(aGamma(Math.min(1, Math.max(0, c))) * 255).toString(16).padStart(2, "0"))
    .join("")

function escala(hexBase) {
  const base = hexAOklch(hexBase)
  const pasoBase = PASOS.reduce((mejor, paso) =>
    Math.abs(paso[1] - base.L) < Math.abs(mejor[1] - base.L) ? paso : mejor
  )[0]
  const resultado = {}
  for (const [paso, L, peso] of PASOS) {
    resultado[paso] =
      paso === pasoBase
        ? hexBase
        : // Misma intensidad (croma) que el color base, sin salir de sRGB.
          aHex(oklchARgb(L, Math.min(base.C * peso, cromaMaxima(L, base.H)), base.H))
  }
  return { pasoBase, resultado }
}

const escalas = Object.fromEntries(
  Object.entries(MARCA).map(([nombre, hex]) => [nombre, escala(hex)])
)

const aviso = "Generado por scripts/generar-escalas.mjs; no editar a mano (pnpm escalas)."

let css = `/* ${aviso} */\n\n:root {\n`
for (const [nombre, hex] of Object.entries(MARCA)) css += `  --marca-${nombre}: ${hex};\n`
for (const [nombre, { pasoBase, resultado }] of Object.entries(escalas)) {
  css += `\n  /* ${nombre}: el color de la marca es el paso ${pasoBase} */\n`
  for (const [paso, hex] of Object.entries(resultado)) css += `  --${nombre}-${paso}: ${hex};\n`
}
css += "}\n\n@theme inline {\n"
for (const nombre of Object.keys(MARCA)) css += `  --color-marca-${nombre}: var(--marca-${nombre});\n`
for (const [nombre, { resultado }] of Object.entries(escalas))
  for (const paso of Object.keys(resultado)) css += `  --color-${nombre}-${paso}: var(--${nombre}-${paso});\n`
css += "}\n"

const ts = `// ${aviso}
// Para usos fuera de CSS, como la escena 3D (three.js no lee variables CSS).

export const ESCALAS = ${JSON.stringify(
  Object.fromEntries(Object.entries(escalas).map(([n, { resultado }]) => [n, resultado])),
  null,
  2
)} as const
`

const raiz = new URL("..", import.meta.url)
writeFileSync(fileURLToPath(new URL("src/app/escalas.css", raiz)), css)
writeFileSync(fileURLToPath(new URL("src/lib/escalas.ts", raiz)), ts)

for (const [nombre, { pasoBase, resultado }] of Object.entries(escalas))
  console.log(nombre.padEnd(9), `base=${pasoBase}`.padEnd(9), Object.values(resultado).join(" "))
