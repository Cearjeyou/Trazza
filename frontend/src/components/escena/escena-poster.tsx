function Archivo({ x, y, origen = false }: { x: number; y: number; origen?: boolean }) {
  const color = origen ? "var(--marca-rosa)" : "var(--marca-agua)"
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="m-43 20 50-25 44 23v13L0 57l-43-25Z" fill="var(--marca-almendra)" />
      <path d="m-40-25 48-24 40 23v54L0 52l-40-22Z" fill="var(--azul-975)" stroke={color} strokeWidth="2" />
      {!origen ? <path d="m-40-25 48-24 40 23-48 25Z" fill={color} fillOpacity=".3" stroke={color} /> : null}
      {[0, 1, 2].map(i => (
        <g key={i} transform={`translate(${i * 5 - 15} ${-i * 6 - 10})`}>
          <rect x="-13" y="-33" width="34" height="47" rx="4" fill="var(--marca-almendra)" stroke="var(--azul-500)" />
          <rect x="9" y="-26" width="7" height="9" rx="1" fill={color} />
          <path d="M-7-13H10M-7-6H10M-7 1H5" stroke="var(--azul-500)" strokeWidth="2" />
        </g>
      ))}
      {origen ? <path d="m-33 6 30 14v19l-30-15Z" fill={color} /> : <path d="m-40-25 40 24v53l-40-22Z" fill={color} fillOpacity=".24" stroke={color} />}
    </g>
  )
}

export function EscenaPoster() {
  return (
    <svg aria-hidden="true" className="h-full w-full" data-scene-poster="true"
      viewBox="0 0 720 500" fill="none" preserveAspectRatio="xMidYMid meet">
      <path d="m55 275 300-146 310 150v18L365 454 55 294Z" fill="var(--azul-975)" stroke="var(--marca-agua)" />
      <path d="m55 275 300-146 310 150-300 155Z" fill="var(--marca-azul)" stroke="var(--azul-700)" />
      <path d="m178 246 171 62 169-106m-271 139 102-33 199 29" stroke="var(--marca-agua)" strokeWidth="2" />
      <Archivo x={178} y={231} origen />
      <Archivo x={247} y={335} origen />
      <Archivo x={520} y={206} />
      <Archivo x={559} y={332} />
      <path d="m299 300 61-31 72 34v23l-63 33-70-34Z" fill="var(--marca-almendra)" stroke="var(--azul-500)" strokeWidth="2" />
      <path d="m299 313 70 34 63-32" stroke="var(--marca-agua)" strokeWidth="3" />
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i} transform={`translate(0 ${-i * 15})`}>
          <path d="m335 280 27-14 28 14v8l-26 15-29-14Z" fill="var(--marca-almendra)" stroke="var(--azul-500)" />
          <path d="m342 285 16 7" stroke="var(--azul-700)" strokeWidth="2" />
          <circle cx="383" cy="287" r="2" fill="var(--marca-lima)" />
        </g>
      ))}
      <path d="m315 136 21-10v173l-21 10Z" fill="var(--marca-agua)" fillOpacity=".32" stroke="var(--marca-agua)" strokeWidth="2" />
      <path d="m392 118 21 10v181l-21-10Z" fill="var(--marca-agua)" fillOpacity=".32" stroke="var(--marca-agua)" strokeWidth="2" />
      <path d="m335 123 28-14 30 14v177l-30-14-28 14Z" fill="var(--marca-agua)" fillOpacity=".14" stroke="var(--marca-agua)" />
      <path d="m315 136 21-10m56-8 21 10" stroke="var(--marca-almendra)" strokeWidth="4" />
      <path d="m315 308 21-10m56 1 21 10" stroke="var(--marca-lima)" strokeWidth="3" />
      <path d="m349 326 10 5 10-5v13l-10 10-10-10Zm5 10 4 4 7-9" stroke="var(--marca-lima)" strokeWidth="2" />
      <circle cx="285" cy="285" r="4" fill="var(--marca-lima)" />
      <circle cx="476" cy="321" r="4" fill="var(--marca-lima)" />
    </svg>
  )
}
