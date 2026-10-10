import React from 'react'
import styles from './BoldBanner.module.css'

const VARIANTS = {
  light: styles.light,
  dark: styles.dark,
};

/**
 * Banner de titulo a dos capas: un texto en outline y otro solido superpuesto.
 *
 * @param {Object} props
 * @param {string} [props.outlineText] - Texto grande en contorno, al fondo.
 * @param {string} [props.solidText] - Texto solido que se superpone al anterior.
 * @param {'light'|'dark'} [props.variant='light'] - Paleta del banner.
 *   - 'light': fondo blanco y letras negras, para secciones claras.
 *   - 'dark': sin fondo y letras blancas, para montarlo sobre fondos oscuros.
 * @param {string} [props.className] - Clases adicionales para el contenedor.
 */
export default function BoldBanner({ outlineText, solidText, variant = 'light', className = '' }) {
  const variantClass = VARIANTS[variant] ?? VARIANTS.light;

  return (
    <section className={`${styles.container} ${variantClass} ${className}`.trim()}>
      {outlineText && (
        <div className={styles.titleStroke}>
          {outlineText}
        </div>
      )}
      {solidText && (
        <div className={styles.titleSolid}>
          {solidText}
        </div>
      )}
    </section>
  )
}
