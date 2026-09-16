import styles from './ViewToggle.module.css'

/**
 * ViewToggle
 * Toggle tipo pill para cambiar entre vistas (Grid, Lista, etc.)
 *
 * @param {Array} options - [{ value: string, label: string }]
 * @param {string} value - Valor de la opción actualmente activa
 * @param {Function} onChange - Callback (value: string) => void
 */
export default function ViewToggle({ options = [], value, onChange }) {
  return (
    <div className={styles.toggle} role="group" aria-label="Cambiar vista">
      {options.map((option) => (
        <button
          key={option.value}
          className={`${styles.option} ${value === option.value ? styles.optionActive : ''}`}
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          aria-label={`Vista ${option.label}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
