import { useId, useState } from 'react';
import styles from './NewsletterForm.module.css';
import Button from '../Button/Button';
import { useTurnstile } from '../Turnstile/useTurnstile';
import { subscribe } from '../../../service/notificationsApi';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ERROR_MESSAGES = {
  invalid: 'Revisa el correo: no parece una dirección válida.',
  captcha: 'No pudimos verificar que no eres un bot. Intenta de nuevo.',
  rate: 'Demasiados intentos. Espera unos minutos y vuelve a probar.',
  unavailable: 'El servicio no está disponible ahora. Intenta más tarde.',
};

const STATUS_MESSAGES = {
  loading: 'Enviando…',
  ok: 'Revisa tu correo para confirmar la suscripción.',
};

/**
 * Formulario de suscripcion al correo, protegido con Turnstile.
 * Al escribir el primer caracter despliega los terminos; el hueco de esos
 * terminos esta siempre reservado, asi el contenido de abajo no se mueve.
 * El exito solo indica que el backend recibio la solicitud: la suscripcion
 * queda pendiente hasta que se confirme desde el correo.
 *
 * @param {Object} props
 * @param {string} [props.className] - Clases adicionales para el formulario.
 */
export default function NewsletterForm({ className = '' }) {
  const id = useId();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | ok | error
  const [errorKind, setErrorKind] = useState(null);
  const { containerRef, prepare, getToken, reset } = useTurnstile();

  const isLoading = status === 'loading';
  const showLegal = email.length > 0 && status === 'idle';
  const statusMessage = status === 'error'
    ? ERROR_MESSAGES[errorKind] ?? ERROR_MESSAGES.unavailable
    : STATUS_MESSAGES[status];

  const fail = (kind) => {
    setErrorKind(kind);
    setStatus('error');
  };

  const handleChange = (event) => {
    setEmail(event.target.value);
    setStatus('idle');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isLoading) return;

    const value = email.trim();
    if (!EMAIL_PATTERN.test(value)) {
      fail('invalid');
      return;
    }

    setStatus('loading');
    try {
      const turnstileToken = await getToken();
      await subscribe({ email: value, turnstileToken });
      setStatus('ok');
      setEmail('');
    } catch (error) {
      // los errores de Turnstile no traen kind; los del servicio si
      fail(error.kind ?? 'captcha');
    } finally {
      reset();
    }
  };

  return (
    <form className={`${styles.form} ${className}`.trim()} onSubmit={handleSubmit} noValidate>
      <label htmlFor={`${id}-email`} className={styles.srLabel}>
        Correo electrónico
      </label>

      <div className={styles.field}>
        <input
          id={`${id}-email`}
          className={styles.input}
          type="email"
          name="email"
          value={email}
          onChange={handleChange}
          onFocus={prepare}
          readOnly={isLoading}
          placeholder="Ingresa tu correo"
          autoComplete="email"
          aria-describedby={`${id}-legal`}
          aria-invalid={(status === 'error' && errorKind === 'invalid') || undefined}
        />
        <Button
          type="submit"
          variant="solid"
          showArrow
          className={styles.submit}
          disabled={isLoading}
          aria-busy={isLoading || undefined}
        >
          Suscribirme
        </Button>
      </div>

      <div className={styles.legalSlot}>
        <p
          id={`${id}-legal`}
          className={`${styles.legal} ${showLegal ? styles.legalVisible : ''}`.trim()}
        >
          Al ingresar tu correo aceptas recibir novedades, eventos e información de Athenet.
          Puedes darte de baja cuando quieras.{' '}
          <a href="#">Lee nuestra Política de Privacidad</a>.
        </p>

        <p
          className={`${styles.status} ${status !== 'idle' ? styles.statusVisible : ''} ${status === 'error' ? styles.statusError : ''}`.trim()}
          role="status"
          aria-live="polite"
        >
          {statusMessage}
        </p>
      </div>

      <div ref={containerRef} className={styles.captcha} />
    </form>
  );
}
