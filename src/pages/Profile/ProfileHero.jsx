import { useEffect, useRef, useState } from 'react'
import Avatar from '../../components/ui/Avatar/Avatar'
import { Camera, MapPin } from '../../components/icons'
import { useAuth } from '../../auth/useAuth'
import { getRegionLabel } from '../../auth/authConfig'
import { PHOTO_TYPES, resizeImageToDataUrl } from '../../utils/imageResize'
import styles from './Profile.module.css'

const COVER_IMAGE = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop'

/**
 * Cabecera del perfil: portada, columna lateral (foto, datos y `nav`) y contenido (`children`).
 *
 * @param {Object} props
 * @param {import('react').ReactNode} props.nav - Barra de secciones, bajo los datos del usuario.
 * @param {import('react').ReactNode} props.children - Contenido de la seccion activa.
 */
export default function ProfileHero({ nav, children }) {
  const { user, updateProfile } = useAuth()
  const fileRef = useRef(null)
  const region = getRegionLabel(user.region)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const avatarRef = useRef(null)
  const triggerRef = useRef(null)

  // Sube una foto nueva (foto = data URL) o la quita (foto = null)
  const savePhoto = async (getPhoto) => {
    setError('')
    setBusy(true)
    try {
      await updateProfile({ foto: await getPhoto() })
    } catch (failure) {
      setError(failure.message || 'No pudimos actualizar la foto.')
    }
    setBusy(false)
  }

  const handleFile = (event) => {
    const file = event.target.files[0]
    event.target.value = '' // permite volver a elegir el mismo archivo
    if (file) savePhoto(() => resizeImageToDataUrl(file))
  }

  // Menu de la foto: se cierra al hacer clic fuera o con Escape
  useEffect(() => {
    if (!menuOpen) return undefined

    const closeIfOutside = (event) => {
      if (!avatarRef.current?.contains(event.target)) setMenuOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return
      setMenuOpen(false)
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
  }, [menuOpen])

  // Sin foto abre el selector; con foto, el menu para cambiarla o quitarla
  const handleAvatarClick = () => {
    if (user.foto) setMenuOpen((current) => !current)
    else fileRef.current?.click()
  }

  const chooseFile = () => {
    setMenuOpen(false)
    fileRef.current?.click()
  }

  const removePhoto = () => {
    setMenuOpen(false)
    savePhoto(async () => null)
  }

  return (
    <div className={styles.hero}>
      <div className={styles.cover} style={{ backgroundImage: `url(${COVER_IMAGE})` }} aria-hidden="true" />

      <div className={styles.layout}>
        <div className={styles.side}>
          <div className={styles.avatarWrap} ref={avatarRef}>
            <button
              ref={triggerRef}
              type="button"
              className={styles.avatarButton}
              aria-label={user.foto ? 'Foto de perfil: cambiar o quitar' : 'Subir foto de perfil'}
              aria-haspopup={user.foto ? 'menu' : undefined}
              aria-expanded={user.foto ? menuOpen : undefined}
              aria-busy={busy}
              disabled={busy}
              onClick={handleAvatarClick}
            >
              <Avatar user={user} size="xxl" className={styles.heroAvatar} />
              <span className={styles.avatarOverlay} aria-hidden="true">
                <Camera />
              </span>
            </button>

            {menuOpen && (
              <div className={styles.photoMenu} role="menu">
                <button type="button" role="menuitem" className={styles.photoMenuItem} onClick={chooseFile}>
                  Cambiar foto
                </button>
                <button type="button" role="menuitem" className={styles.photoMenuItem} onClick={removePhoto}>
                  Quitar foto
                </button>
              </div>
            )}
          </div>

          <section className={styles.heroInfo} aria-labelledby="profile-name">
            <h1 id="profile-name" className={styles.heroName}>
              {user.nombre} {user.apellido}
            </h1>
            {region && (
              <p className={styles.heroLocation}>
                <MapPin aria-hidden="true" />
                {region}, Chile
              </p>
            )}
            <p className={styles.heroEmail}>{user.email}</p>

            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}
            <input ref={fileRef} type="file" accept={PHOTO_TYPES.join(',')} onChange={handleFile} hidden />
          </section>

          {nav}
        </div>

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  )
}
