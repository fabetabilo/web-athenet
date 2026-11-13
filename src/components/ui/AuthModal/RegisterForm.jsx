import { useState } from 'react'
import Field from '../Field/Field'
import Button from '../Button/Button'
import { Check } from '../../icons'
import { useAuth } from '../../../auth/useAuth'
import { GENDER_OPTIONS, PASSWORD_RULES, REGION_OPTIONS } from '../../../auth/authConfig'
import { getAuthMessage } from '../../../auth/authMessages'
import { validateEmail, validateName, validatePassword } from '../../../auth/validation'
import styles from './AuthModal.module.css'

const EMPTY = { nombre: '', apellido: '', genero: '', region: '', email: '', password: '', confirm: '', terms: false }

function validate(values) {
  return {
    nombre: validateName(values.nombre, 'nombre'),
    apellido: validateName(values.apellido, 'apellido'),
    genero: values.genero ? '' : 'Selecciona una opción.',
    region: values.region ? '' : 'Selecciona tu región.',
    email: validateEmail(values.email),
    password: validatePassword(values.password),
    confirm: values.confirm === values.password ? (values.confirm ? '' : 'Repite tu contraseña.') : 'Las contraseñas no coinciden.',
    terms: values.terms ? '' : 'Debes aceptar los términos para continuar.',
  }
}

/**
 * Formulario de registro. Al crear la cuenta avisa con `onRegistered(email)` para pasar
 * al paso de verificacion. La contrasena no sale de este componente salvo hacia signUp.
 *
 * @param {{ onRegistered: (email: string) => void, onSwitchToLogin: (email?: string) => void }} props
 */
export default function RegisterForm({ onRegistered, onSwitchToLogin }) {
  const { signUp } = useAuth()
  const [values, setValues] = useState(EMPTY)
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [serverError, setServerError] = useState(null)

  // Un campo muestra su error tras salir de el o tras el primer intento de envio
  const all = validate(values)
  const errors = Object.fromEntries(
    Object.entries(all).map(([field, message]) => [field, submitted || touched[field] ? message : '']),
  )

  const set = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setValues((current) => ({ ...current, [field]: value }))
  }
  const blur = (field) => () => setTouched((current) => ({ ...current, [field]: true }))
  const field = (name) => ({ value: values[name], onChange: set(name), onBlur: blur(name), error: errors[name] })

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitted(true)
    setServerError(null)
    if (Object.values(all).some(Boolean)) return

    setBusy(true)
    try {
      await signUp({
        nombre: values.nombre.trim(),
        apellido: values.apellido.trim(),
        genero: values.genero,
        region: values.region,
        email: values.email.trim(),
        password: values.password,
      })
      onRegistered(values.email.trim())
    } catch (error) {
      setServerError({ code: error.code, message: getAuthMessage(error) })
      setBusy(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.row}>
        <Field label="Nombre" autoComplete="given-name" {...field('nombre')} />
        <Field label="Apellido" autoComplete="family-name" {...field('apellido')} />
      </div>

      <div className={styles.row}>
        <Field label="Género" options={GENDER_OPTIONS} {...field('genero')} />
        <Field label="Región" options={REGION_OPTIONS} {...field('region')} />
      </div>
      <Field label="Correo electrónico" type="email" autoComplete="email" {...field('email')} />
      <Field label="Contraseña" type="password" autoComplete="new-password" {...field('password')} />

      {/* Requisitos en vivo, para no descubrirlos al enviar */}
      <ul className={styles.rules} aria-label="Requisitos de la contraseña">
        {PASSWORD_RULES.map((rule) => {
          const met = rule.test(values.password)
          return (
            <li key={rule.id} className={met ? styles.ruleMet : undefined}>
              <Check className={styles.ruleIcon} aria-hidden="true" />
              {rule.label}
              <span className={styles.srOnly}>{met ? ' (cumplido)' : ' (pendiente)'}</span>
            </li>
          )
        })}
      </ul>

      <Field label="Repetir contraseña" type="password" autoComplete="new-password" {...field('confirm')} />

      <div>
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={values.terms}
            onChange={set('terms')}
            onBlur={blur('terms')}
            aria-invalid={errors.terms ? true : undefined}
          />
          <span>Acepto los términos y condiciones y la política de privacidad de Athenet.</span>
        </label>
        {errors.terms && <p className={styles.checkError}>{errors.terms}</p>}
      </div>

      {serverError && (
        <p className={styles.alert} role="alert">
          {serverError.message}{' '}
          {serverError.code === 'USER_EXISTS' && (
            <button type="button" className={styles.linkButton} onClick={() => onSwitchToLogin(values.email.trim())}>
              Iniciar sesión
            </button>
          )}
        </p>
      )}

      <Button type="submit" variant="accent" disabled={busy}>
        {busy ? 'Creando cuenta…' : 'Crear cuenta'}
      </Button>
    </form>
  )
}
