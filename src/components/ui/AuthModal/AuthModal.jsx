import { useState } from 'react'
import Modal from '../Modal/Modal'
import RegisterForm from './RegisterForm'
import VerifyCodeForm from './VerifyCodeForm'
import LoginForm from './LoginForm'
import { useAuth } from '../../../auth/useAuth'
import logo from '../../../assets/icon/brand2.png'
import styles from './AuthModal.module.css'

const COPY = {
  register: {
    title: 'Crea tu cuenta',
    text: 'Únete a la comunidad deportiva universitaria y vive cada competencia más de cerca.',
  },
  verify: {
    title: 'Verifica tu correo',
    text: 'Un último paso para dejar tu cuenta lista.',
  },
  login: {
    title: 'Bienvenido de vuelta',
    text: 'Ingresa para seguir a tus equipos y participar en los partidos.',
  },
}

const PERKS = ['Sigue a los equipos de tu institución', 'Comenta los partidos en vivo', 'Tu perfil en un solo lugar']

const TABS = [
  { id: 'register', label: 'Registrarse' },
  { id: 'login', label: 'Iniciar sesión' },
]

/**
 * Contenido del modal. Vive solo mientras el modal esta abierto (Modal no monta hijos
 * cerrado), asi cada apertura parte de cero: sin campos, errores ni pasos anteriores.
 */
function AuthContent({ initialView }) {
  const [view, setView] = useState(initialView) // 'register' | 'verify' | 'login'
  const [email, setEmail] = useState('')
  const [notice, setNotice] = useState('')

  const goTo = (next, nextEmail = '', nextNotice = '') => {
    setEmail(nextEmail)
    setNotice(nextNotice)
    setView(next)
  }

  const copy = COPY[view]

  return (
    <div className={styles.layout}>
      {/* Panel izquierdo: el fade cian de la home (borde inferior izquierdo) */}
      <aside className={styles.brand}>
        <img className={styles.logo} src={logo} alt="Athenet" />
        <div>
          <h2 className={styles.title}>{copy.title}</h2>
          <p className={styles.text}>{copy.text}</p>
        </div>
        <ul className={styles.perks}>
          {PERKS.map((perk) => (
            <li key={perk}>{perk}</li>
          ))}
        </ul>
      </aside>

      <section className={styles.panel}>
        {view !== 'verify' && (
          <div className={styles.tabs} role="tablist" aria-label="Acceso">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={view === tab.id}
                className={`${styles.tab} ${view === tab.id ? styles.tabActive : ''}`}
                onClick={() => goTo(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {view === 'register' && (
          <RegisterForm
            onRegistered={(registeredEmail) => goTo('verify', registeredEmail)}
            onSwitchToLogin={(knownEmail) => goTo('login', knownEmail)}
          />
        )}
        {view === 'verify' && (
          <VerifyCodeForm
            email={email}
            onVerified={() => goTo('login', email, 'Cuenta verificada. Ya puedes iniciar sesión.')}
            onBack={() => goTo('register')}
          />
        )}
        {view === 'login' && (
          <LoginForm
            initialEmail={email}
            notice={notice}
            onNeedsVerification={(pendingEmail) => goTo('verify', pendingEmail)}
          />
        )}
      </section>
    </div>
  )
}

/**
 * Modal de acceso (registro, verificacion e inicio de sesion). Se abre con `openAuth(view)`
 * de useAuth; se monta una sola vez en App, dentro de AuthProvider.
 */
export default function AuthModal() {
  const { authView, closeAuth } = useAuth()

  return (
    <Modal open={authView !== null} onClose={closeAuth} label="Acceso a Athenet">
      {authView && <AuthContent initialView={authView} />}
    </Modal>
  )
}
