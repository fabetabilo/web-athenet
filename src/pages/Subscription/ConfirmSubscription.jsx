import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTransitionHold } from '../../components/transition';
import PageBanner from '../../components/ui/PageBanner/PageBanner';
import Button from '../../components/ui/Button/Button';
import { confirmSubscription } from '../../service/notificationsApi';
import styles from './ConfirmSubscription.module.css';

const MESSAGES = {
  loading: {
    title: 'Confirmando',
    text: 'Estamos validando tu enlace.',
  },
  ok: {
    title: 'Suscripción confirmada',
    text: 'Desde ahora recibirás eventos, competencias y resultados directo en tu correo.',
  },
  expired: {
    title: 'Enlace vencido',
    text: 'Este enlace ya expiró. Vuelve a suscribirte desde el pie de página y te enviaremos uno nuevo.',
  },
  invalid: {
    title: 'Enlace no válido',
    text: 'No reconocemos este enlace. Revisa que esté completo o vuelve a suscribirte desde el pie de página.',
  },
  unavailable: {
    title: 'No pudimos confirmar',
    text: 'El servicio no está disponible ahora. Vuelve a abrir el enlace del correo más tarde.',
  },
};

/**
 * Destino del enlace del correo de confirmacion: /suscripcion/confirmar?token=...
 * La confirmacion es un POST desde aqui y no un GET en el enlace, para que los
 * escaneres de correo que abren links no confirmen por el usuario.
 */
export default function ConfirmSubscription() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState(token ? 'loading' : 'invalid');
  const requestedRef = useRef(false);

  useTransitionHold(status === 'loading');

  useEffect(() => {
    // StrictMode monta el efecto dos veces: el POST debe salir una sola vez
    if (!token || requestedRef.current) return;
    requestedRef.current = true;

    confirmSubscription(token)
      .then(() => setStatus('ok'))
      .catch((error) => {
        setStatus(error.kind === 'expired' || error.kind === 'invalid' ? error.kind : 'unavailable');
      });
  }, [token]);

  const { title, text } = MESSAGES[status];

  return (
    <div className={styles.page}>
      <PageBanner
        title="SUSCRIPCIÓN"
        backgroundImage="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop"
      />

      <section className={styles.content}>
        <div className={styles.container} role="status" aria-live="polite">
          <span className={styles.eyebrow}>NEWSLETTER ATHENET</span>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.description}>{text}</p>
          {status !== 'loading' && (
            <Button to="/" variant="light" showArrow className={styles.action}>
              Volver al inicio
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
