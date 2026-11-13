import { useState } from 'react'
import Field from '../Field/Field'
import Button from '../Button/Button'
import { useAuth } from '../../../auth/useAuth'
import { getAuthMessage } from '../../../auth/authMessages'
import { validateEmail } from '../../../auth/validation'
import styles from './AuthModal.module.css'

/**
 * Formulario de inicio de sesion. Si la cuenta existe pero no fue verificada,
 * pide un codigo nuevo y deriva al paso de verificacion (`onNeedsVerification`).
 *
 * @param {Object} props
 * @param {string} [props.initialEmail]
 * @param {string} [props.notice] - Mensaje informativo (ej. "cuenta verificada").
 * @param {(email: string) => void} props.onNeedsVerification
 */
export default function LoginForm({ initialEmail = '', notice = '', onNeedsVerification }) {
  const { signIn, resendCode, closeAuth } = useAuth()
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const next = {
      email: validateEmail(email),
      password: password ? '' : 'Ingresa tu contraseña.',
    }
    setErrors(next)
    setServerError('')
    if (next.email || next.password) return

    setBusy(true)
    try {
      await signIn({ email: email.trim(), password })
      closeAuth()
    } catch (error) {
      if (error.code === 'UNCONFIRMED') {
        try {
          await resendCode({ email: email.trim() })
        } catch {
          // si no se pudo reenviar, el usuario puede pedirlo desde el paso de verificacion
        }
        onNeedsVerification(email.trim())
        return
      }
      setServerError(getAuthMessage(error))
      setBusy(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {notice && (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      )}

      <Field
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={errors.email}
      />
      <Field
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
      />

      {serverError && (
        <p className={styles.alert} role="alert">
          {serverError}
        </p>
      )}

      <Button type="submit" variant="accent" disabled={busy}>
        {busy ? 'Ingresando…' : 'Iniciar sesión'}
      </Button>
    </form>
  )
}
