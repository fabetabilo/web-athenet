import { useEffect, useState } from 'react'
import Field from '../Field/Field'
import Button from '../Button/Button'
import { useAuth } from '../../../auth/useAuth'
import { MOCK_VERIFICATION_CODE, VERIFICATION_CODE_LENGTH } from '../../../auth/authConfig'
import { getAuthMessage } from '../../../auth/authMessages'
import { validateCode } from '../../../auth/validation'
import styles from './AuthModal.module.css'

const RESEND_COOLDOWN_S = 30

/**
 * Paso de verificacion: el usuario ingresa el codigo enviado a su correo.
 * `onVerified` pasa al login con el correo ya cargado; `onBack` vuelve al registro.
 *
 * @param {{ email: string, onVerified: () => void, onBack: () => void }} props
 */
export default function VerifyCodeForm({ email, onVerified, onBack }) {
  const { confirmSignUp, resendCode, isMock } = useAuth()
  const [code, setCode] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [serverError, setServerError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_S)

  // Cuenta regresiva para poder pedir otro codigo
  useEffect(() => {
    if (cooldown <= 0) return undefined
    const timer = setTimeout(() => setCooldown((current) => current - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const message = validateCode(code)
    setFieldError(message)
    setServerError('')
    setInfo('')
    if (message) return

    setBusy(true)
    try {
      await confirmSignUp({ email, code: code.trim() })
      onVerified()
    } catch (error) {
      setServerError(getAuthMessage(error))
      setBusy(false)
    }
  }

  const handleResend = async () => {
    setServerError('')
    setInfo('')
    try {
      await resendCode({ email })
      setInfo('Te enviamos un código nuevo.')
      setCooldown(RESEND_COOLDOWN_S)
    } catch (error) {
      setServerError(getAuthMessage(error))
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <p className={styles.lead}>
        Enviamos un código de {VERIFICATION_CODE_LENGTH} dígitos a <strong>{email}</strong>. Ingrésalo para activar tu cuenta.
      </p>

      <Field
        label="Código de verificación"
        value={code}
        onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, VERIFICATION_CODE_LENGTH))}
        error={fieldError}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={VERIFICATION_CODE_LENGTH}
        placeholder="000000"
      />

      {isMock && (
        <p className={styles.demo}>Modo demostración: no se envía ningún correo. Usa el código {MOCK_VERIFICATION_CODE}.</p>
      )}

      {serverError && (
        <p className={styles.alert} role="alert">
          {serverError}
        </p>
      )}
      {info && (
        <p className={styles.notice} role="status">
          {info}
        </p>
      )}

      <Button type="submit" variant="accent" disabled={busy}>
        {busy ? 'Verificando…' : 'Verificar cuenta'}
      </Button>

      <div className={styles.links}>
        <button type="button" className={styles.linkButton} onClick={handleResend} disabled={cooldown > 0}>
          {cooldown > 0 ? `Reenviar código en ${cooldown}s` : 'Reenviar código'}
        </button>
        <button type="button" className={styles.linkButton} onClick={onBack}>
          Cambiar correo
        </button>
      </div>
    </form>
  )
}
