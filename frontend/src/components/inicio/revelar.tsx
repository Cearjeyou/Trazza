"use client"

import { motion } from "motion/react"

// Aparición suave al entrar en pantalla. Con "reducir movimiento" activado,
// MotionConfig (en la página) desactiva el desplazamiento.
export function Revelar({
  children,
  retraso = 0,
  className,
}: {
  children: React.ReactNode
  retraso?: number
  className?: string
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, delay: retraso, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
