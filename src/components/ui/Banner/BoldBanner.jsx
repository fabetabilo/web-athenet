import React from 'react'
import styles from './BoldBanner.module.css'

export default function BoldBanner({ outlineText, solidText }) {
  return (
    <section className={styles.container}>
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
