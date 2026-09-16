import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import logo from '../../assets/icon/brand.png'
import Button from '../ui/Button/Button'
import styles from './Navbar.module.css'

export default function Navbar() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav className={`${styles.navbar} ${(scrolled || menuOpen) ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/" className={styles.logo} aria-label="Inicio">
          <img src={logo} alt="Logo" className={styles.logoIcon} />
        </Link>

        {/* --- Links escritorio */}
        <div className={styles.links}>
          {['Inicio', 'Rankings', 'Instituciones', 'Noticias', 'Quiénes Somos'].map((item) => (
            <Link key={item} to={item === 'Inicio' ? '/' : item === 'Instituciones' ? '/institutions' : '#'} className={styles.link}>{item}</Link>
          ))}
        </div>

        <div className={styles.cta}>
          <Button variant="accent" style={{ height: '38px', fontSize: 'var(--text-base)' }} onClick={() => navigate('/events')}>EVENTOS</Button>
        </div>

        {/* menu hamburguesa */}
        <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menú">
          <span className={styles.hamburgerLine} style={{ transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <span className={styles.hamburgerLine} style={{ opacity: menuOpen ? 0 : 1 }} />
          <span className={styles.hamburgerLine} style={{ transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </button>

      </div>

      {/* --- Menú móvil (Drawer) */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}>
        <div className={styles.mobileMenuInner}>
          {['Inicio', 'Rankings', 'Instituciones', 'Noticias', 'Quiénes Somos'].map((item) => (
            <Link key={item} to={item === 'Inicio' ? '/' : item === 'Instituciones' ? '/institutions' : '#'} className={styles.mobileLink} onClick={() => setMenuOpen(false)}>{item}</Link>
          ))}
          <Button variant="accent" style={{ height: '38px', fontSize: 'var(--text-lg)' }} onClick={() => { setMenuOpen(false); navigate('/events'); }}>EVENTOS</Button>
        </div>
      </div>
    </nav>
  )
}
