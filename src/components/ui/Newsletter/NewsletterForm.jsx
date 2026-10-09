import { useId, useState } from 'react';
import styles from './NewsletterForm.module.css';
import { ArrowRight } from '../../icons';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Formulario de suscripcion al correo: input
 * Al escribir el primer caracter despliega los terminos; el hueco de esos
 * terminos esta siempre reservado, asi el contenido de abajo no se mueve.
 *
 * @param {Object} props
 * @param {(email: string) => void} [props.onSubmit] - Se invoca con el correo ya validado.
 * @param {string} [props.className] - Clases adicionales para el formulario.
 */
export default function NewsletterForm({ onSubmit, className = '' }) {
  const id = useId();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | ok | error

  const showLegal = email.length > 0 && status !== 'ok';

  const handleChange = (event) => {
    setEmail(event.target.value);
    setStatus('idle');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!EMAIL_PATTERN.test(email.trim())) {
      setStatus('error');
      return;
    }

    onSubmit?.(email.trim());
    setStatus('ok');
    setEmail('');
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
          placeholder="Ingresa tu correo"
          autoComplete="email"
          aria-describedby={`${id}-legal`}
          aria-invalid={status === 'error' || undefined}
        />
        <button type="submit" className={styles.submit} aria-label="Suscribirse">
          <ArrowRight />
        </button>
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
          {status === 'ok' && '¡Listo! Te escribiremos pronto.'}
          {status === 'error' && 'Revisa el correo: no parece una dirección válida.'}
        </p>
      </div>
    </form>
  );
}
