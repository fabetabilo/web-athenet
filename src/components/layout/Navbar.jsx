import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/icon/brand2.png'
import { TransitionLink, TransitionNavLink } from '../transition'
import { lockScroll, unlockScroll } from '../../utils/scrollLock'
import { useAuth } from '../../auth/useAuth'
import UserMenu from './UserMenu'
import styles from './Navbar.module.css'

const MENU_DELAY = 70

const NAV_LINKS = [
  { label: 'Eventos', to: '/events' },
  { label: 'Rankings', to: '/rankings' },
  { label: 'Instituciones', to: '/institutions' },
  { label: 'Noticias', to: '#' },
  { label: 'Equipos', to: '#' },
]

// Portales y redes se consideran URLs externas
const SECONDARY_LINKS = [
  { label: 'Portal deportistas Athenet', to: '#' },
  { label: 'Funcionarios Athenet', to: '#' },
  { label: 'YouTube', to: '#' },
  { label: 'Facebook', to: '#' },
  { label: 'Instagram', to: '#' },
  { label: 'X', to: '#' },
]

// Paginas rutas internas de la propia web
const LEGAL_LINKS = [
  { label: 'Términos y Condiciones', to: '#' },
  { label: 'Plan de ayuda', to: '#' },
  { label: 'Compromiso con la Seguridad Estudiantil', to: '#' },
  { label: 'Sostenibilidad', to: '#' },
]

// Externo o interno segun la URL para no tener que marcarlo a mano
function DrawerLink({ to, className, onNavigate, children }) {
  if (to.startsWith('http')) {
    return <a href={to} className={className} target="_blank" rel="noopener noreferrer">{children}</a>
  }
  return <TransitionLink to={to} className={className} onClick={onNavigate}>{children}</TransitionLink>
}

// Destinos marcan activo. TEMPORAL: con to="#" se resuelve a la ruta actual para los que no tienen ruta aun.
function TopLink({ to, label }) {
  if (to === '#') return <Link to={to} className={styles.link}>{label}</Link>
  return (
    <TransitionNavLink to={to} className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}>
      {label}
    </TransitionNavLink>
  )
}

// Acceso de usuarios externos: abre el modal de registro / inicio de sesion
function AuthButtons({ onNavigate }) {
  const { openAuth } = useAuth()
  const open = (view) => () => {
    onNavigate?.()
    openAuth(view)
  }

  return (
    <>
      <button type="button" className={styles.loginButton} onClick={open('login')}>Iniciar sesión</button>
      <button type="button" className={styles.registerButton} onClick={open('register')}>Registrarse</button>
    </>
  )
}

// Sesion iniciada: menu del usuario; si no, botones de acceso. Mientras se recupera la sesion no muestra nada
function AuthArea({ inline = false, onNavigate }) {
  const { status, signOut } = useAuth()
  if (status === 'loading') return null
  if (status !== 'authenticated') return <AuthButtons onNavigate={onNavigate} />
  if (inline) return <UserMenu inline onNavigate={onNavigate} />

  return (
    <>
      <UserMenu />
      <button type="button" className={styles.logoutButton} onClick={signOut}>Cerrar sesión</button>
    </>
  )
}

export default function Navbar() {
  const { authEnabled } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [sweep, setSweep] = useState(false)   // barrido de las barras al pasar el cursor

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Bloquea el scroll de la pagina mientras el drawer esta abierto via scrollLock. la pantalla de transicion tambien bloquea
  useEffect(() => {
    if (!menuOpen) return undefined
    lockScroll()
    return unlockScroll
  }, [menuOpen])

  // Su estado cambia con retardo
  const toggleMenu = () => {
    setSweep(false)   // el barrido no sobrevive al click: a partir de aqui manda el morph a X
    window.setTimeout(() => setMenuOpen((open) => !open), MENU_DELAY)
  }

  return (
    <>
      {/* Controles de la barra (menu y buscador): viven fuera del nav para escapar de su stacking context y quedar siempre por encima del drawer*/}
      <div className={styles.topControls}>
        <div className={styles.topControlsInner}>
          <button
            type="button"
            className={`${styles.iconBtn} ${styles.menuBtn} ${menuOpen ? styles.menuBtnOpen : ''} ${sweep ? styles.menuBtnSweep : ''}`}
            onClick={toggleMenu}
            onMouseEnter={() => { if (!menuOpen) setSweep(true) }}
            aria-label={menuOpen ? 'Cerrar menú' : 'Menú'}
            aria-expanded={menuOpen}
            aria-controls="navbar-drawer"
          >
            <span className={styles.burger} aria-hidden="true">
              <span className={`${styles.bar} ${styles.barTop}`}>
                <span className={styles.barFill} />
              </span>
              <span className={`${styles.bar} ${styles.barBottom}`}>
                <span className={styles.barFill} onAnimationEnd={() => setSweep(false)} />
              </span>
            </span>
            <span className={styles.menuLabel} aria-hidden="true">Cerrar</span>
          </button>
        </div>
      </div>

      <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.inner}>
          <div className={styles.left}>
            {/* Logo */}
            <TransitionLink to="/" className={styles.logo} aria-label="Inicio">
              <img src={logo} alt="Logo" className={styles.logoIcon} />
            </TransitionLink>
          </div>

          {/* --- Links escritorio */}
          <div className={styles.links}>
            {NAV_LINKS.map(({ label, to }) => (
              <TopLink key={label} to={to} label={label} />
            ))}
          </div>

          {/* Acceso: en pantallas anchas va en la barra; en las demas, dentro del drawer */}
          {authEnabled && (
            <div className={styles.auth}>
              <AuthArea />
            </div>
          )}

        </div>
      </nav>

      <div
        className={`${styles.scrim} ${menuOpen ? styles.scrimOpen : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* --- Drawer: acordeon de 5 capas que baja desde arriba */}
      <div id="navbar-drawer" className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ''}`}>
        <div className={`${styles.layer} ${styles.layerFirst}`} aria-hidden="true" />
        <div className={`${styles.layer} ${styles.layerSecond}`} aria-hidden="true" />
        <div className={`${styles.layer} ${styles.layerThird}`} aria-hidden="true" />
        <div className={`${styles.layer} ${styles.layerFourth}`} aria-hidden="true" />

        <div className={`${styles.layer} ${styles.layerMain}`}>
          <div className={styles.layerContent}>
            <div className={styles.drawerHeader}>
              <TransitionLink to="/" className={styles.logo} aria-label="Inicio" onClick={() => setMenuOpen(false)}>
                <img src={logo} alt="Logo" className={styles.drawerLogoIcon} />
              </TransitionLink>
            </div>

            <div className={styles.drawerNav}>
              <div className={styles.drawerMain}>
                {NAV_LINKS.map(({ label, to }) => (
                  <DrawerLink key={label} to={to} className={styles.drawerMainLink} onNavigate={() => setMenuOpen(false)}>
                    {label}
                  </DrawerLink>
                ))}

                {authEnabled && (
                  <div className={styles.drawerAuth}>
                    <AuthArea inline onNavigate={() => setMenuOpen(false)} />
                  </div>
                )}
              </div>

              <div className={styles.drawerAside}>
                <div className={styles.drawerGroup}>
                  {SECONDARY_LINKS.map(({ label, to }) => (
                    <DrawerLink key={label} to={to} className={styles.drawerAsideLink} onNavigate={() => setMenuOpen(false)}>
                      {label}
                    </DrawerLink>
                  ))}
                </div>

                <div className={styles.drawerGroup}>
                  {LEGAL_LINKS.map(({ label, to }) => (
                    <DrawerLink key={label} to={to} className={styles.drawerLegalLink} onNavigate={() => setMenuOpen(false)}>
                      {label}
                    </DrawerLink>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
