import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/icon/brand2.png'
import { Search, Menu, Close } from '../icons'
import styles from './Navbar.module.css'

// Debe coincidir con el breakpoint de Navbar.module.css
const DESKTOP_QUERY = '(min-width: 1024px)'

const NAV_LINKS = [
  { label: 'Eventos', to: '/events' },
  { label: 'Rankings', to: '#' },
  { label: 'Instituciones', to: '/institutions' },
  { label: 'Noticias', to: '#' },
  { label: 'Equipos', to: '#' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // En desktop el drawer no existe: al cruzar el breakpoint hay que cerrarlo
  // o el bloqueo de scroll se queda puesto sobre una pagina sin drawer
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY)
    const handler = (e) => { if (e.matches) setMenuOpen(false) }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Bloquea el scroll de la pagina mientras el drawer esta abierto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.inner}>
          <div className={styles.left}>
            {/* menu hamburguesa escritorio (sin logica todavia) */}
            <button type="button" className={`${styles.iconBtn} ${styles.menuBtn}`} aria-label="Menú">
              <Menu className={styles.menuIcon} aria-hidden="true" />
            </button>

            {/* menu hamburguesa movil: abre el drawer */}
            <button type="button" className={`${styles.iconBtn} ${styles.hamburger}`} onClick={() => setMenuOpen(true)} aria-label="Menú" aria-expanded={menuOpen}>
              <Menu className={styles.menuIcon} aria-hidden="true" />
            </button>

            {/* Logo */}
            <Link to="/" className={styles.logo} aria-label="Inicio">
              <img src={logo} alt="Logo" className={styles.logoIcon} />
            </Link>
          </div>

          {/* --- Links escritorio */}
          <div className={styles.links}>
            {NAV_LINKS.map(({ label, to }) => (
              <Link key={label} to={to} className={styles.link}>{label}</Link>
            ))}
          </div>

          <div className={styles.cta}>
            <button type="button" className={styles.iconBtn} aria-label="Buscar">
              <Search className={styles.searchIcon} aria-hidden="true" />
            </button>
          </div>
        </div>
      </nav>

      <div className={`${styles.scrim} ${menuOpen ? styles.scrimOpen : ''}`} aria-hidden="true" />

      {/* --- Drawer movil/tablet: entra desde la izquierda y cubre la pantalla */}
      <div className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerHeader}>
          <div className={styles.drawerActions}>
            <button type="button" className={styles.iconBtn} onClick={() => setMenuOpen(false)} aria-label="Cerrar menú">
              <Close className={styles.menuIcon} aria-hidden="true" />
            </button>
            <button type="button" className={styles.iconBtn} aria-label="Buscar">
              <Search className={styles.searchIcon} aria-hidden="true" />
            </button>
          </div>

          <Link to="/" className={styles.logo} aria-label="Inicio" onClick={() => setMenuOpen(false)}>
            <img src={logo} alt="Logo" className={styles.logoIcon} />
          </Link>
        </div>

        {/* Links: se rediseñan en el siguiente paso */}
        <div className={styles.drawerNav}>
          {NAV_LINKS.map(({ label, to }) => (
            <Link key={label} to={to} className={styles.mobileLink} onClick={() => setMenuOpen(false)}>{label}</Link>
          ))}
        </div>
      </div>
    </>
  )
}
