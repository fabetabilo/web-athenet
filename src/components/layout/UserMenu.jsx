import { useEffect, useRef, useState } from 'react'
import Avatar from '../ui/Avatar/Avatar'
import { TransitionLink } from '../transition'
import { ChevronDown } from '../icons'
import { useAuth } from '../../auth/useAuth'
import styles from './UserMenu.module.css'

/**
 * Menu del usuario con sesion iniciada. En la barra es un desplegable (avatar + nombre) con
 * el acceso al perfil; "Cerrar sesion" va como boton aparte en el Navbar. Con `inline` se
 * muestra plano, con ambas opciones, para el drawer.
 *
 * @param {Object} props
 * @param {boolean} [props.inline=false]
 * @param {() => void} [props.onNavigate] - Se llama al elegir una opcion (cierra el drawer).
 */
export default function UserMenu({ inline = false, onNavigate }) {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)

  // Cierra al hacer clic o enfocar fuera, y con Escape devolviendo el foco al boton
  useEffect(() => {
    if (!open) return undefined

    const closeIfOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener('pointerdown', closeIfOutside)
    document.addEventListener('focusin', closeIfOutside)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', closeIfOutside)
      document.removeEventListener('focusin', closeIfOutside)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (!user) return null

  const choose = () => {
    setOpen(false)
    onNavigate?.()
  }
  const handleSignOut = () => {
    choose()
    signOut()
  }

  const identity = (
    <div className={styles.identity}>
      {inline && <Avatar user={user} size="md" />}
      <div className={styles.identityText}>
        <strong className={styles.fullName}>
          {user.nombre} {user.apellido}
        </strong>
        <span className={styles.email}>{user.email}</span>
      </div>
    </div>
  )

  const profileLink = (
    <TransitionLink to="/perfil" className={styles.item} onClick={choose}>
      Mi perfil
    </TransitionLink>
  )

  if (inline) {
    return (
      <div className={styles.inline}>
        {identity}
        <div className={styles.inlineItems}>
          {profileLink}
          <button type="button" className={styles.item} onClick={handleSignOut}>
            Cerrar sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls="user-menu"
        onClick={() => setOpen((current) => !current)}
      >
        <Avatar user={user} size="sm" />
        <span className={styles.name}>
          {user.nombre} {user.apellido}
        </span>
        <ChevronDown className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <div id="user-menu" className={styles.panel}>
          {identity}
          {profileLink}
        </div>
      )}
    </div>
  )
}
