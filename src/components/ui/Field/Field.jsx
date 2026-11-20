import { useId, useState } from 'react'
import { ChevronDown, Eye, EyeOff } from '../../icons'
import styles from './Field.module.css'

/**
 * Campo de formulario: etiqueta en mayusculas, control con borde y mensaje de error/ayuda.
 * Renderiza `<select>` si recibe `options`; si `type="password"` agrega el boton de ver/ocultar.
 *
 * @param {Object} props
 * @param {string} props.label
 * @param {string} [props.error] - Mensaje de error; marca el campo como invalido.
 * @param {string} [props.hint] - Ayuda bajo el campo (se oculta si hay error).
 * @param {string} [props.type='text']
 * @param {{ value: string, label: string }[]} [props.options] - Convierte el campo en select.
 * @param {'dark'|'light'} [props.tone='dark'] - 'light' para fondos claros (paginas); 'dark' para el modal.
 * @param {boolean} [props.hideLabel=false] - Oculta la etiqueta a la vista pero la deja para lectores de pantalla.
 * @param {string} [props.className]
 */
export default function Field({ label, error, hint, type = 'text', options, tone = 'dark', hideLabel = false, className = '', ...props }) {
  const id = useId()
  const [visible, setVisible] = useState(false)
  const noteId = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  const isPassword = type === 'password'

  const control = {
    id,
    className: styles.control,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': noteId,
    ...props,
  }

  return (
    <div className={`${styles.field} ${tone === 'light' ? styles.light : ''} ${error ? styles.invalid : ''} ${className}`.trim()}>
      <label className={`${styles.label} ${hideLabel ? styles.srOnly : ''}`.trim()} htmlFor={id}>
        {label}
      </label>

      <div className={styles.wrap}>
        {options ? (
          <>
            <select {...control}>
              {/* hidden: se ve como valor inicial del campo, pero no aparece en la lista */}
              <option value="" disabled hidden>
                Selecciona
              </option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className={styles.chevron} aria-hidden="true" />
          </>
        ) : (
          <>
            <input {...control} type={isPassword && visible ? 'text' : type} />
            {isPassword && (
              <button
                type="button"
                className={styles.toggle}
                onClick={() => setVisible((current) => !current)}
                aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-pressed={visible}
              >
                {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
              </button>
            )}
          </>
        )}
      </div>

      {(error || hint) && (
        <p id={noteId} className={error ? styles.error : styles.hint}>
          {error || hint}
        </p>
      )}
    </div>
  )
}
