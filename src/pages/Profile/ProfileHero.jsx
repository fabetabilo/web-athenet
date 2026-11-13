import { useRef, useState } from 'react'
import Avatar from '../../components/ui/Avatar/Avatar'
import Button from '../../components/ui/Button/Button'
import { MapPin } from '../../components/icons'
import { useAuth } from '../../auth/useAuth'
import { getRegionLabel } from '../../auth/authConfig'
import { PHOTO_TYPES, resizeImageToDataUrl } from '../../utils/imageResize'
import styles from './Profile.module.css'

const COVER_IMAGE = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop'

/**
 * Cabecera del perfil
 */
export default function ProfileHero() {
  const { user, updateProfile } = useAuth()
  const fileRef = useRef(null)
  const region = getRegionLabel(user.region)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

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

  return (
    <section className={styles.hero} aria-labelledby="profile-name">
      <div className={styles.cover} style={{ backgroundImage: `url(${COVER_IMAGE})` }} aria-hidden="true" />

      <div className={styles.heroInner}>
        <Avatar user={user} size="xxl" className={styles.heroAvatar} />

        <div className={styles.heroInfo}>
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

          <div className={styles.photoActions}>
            <Button type="button" variant="light" size="sm" onClick={() => fileRef.current?.click()} disabled={busy}>
              Subir foto
            </Button>
            <Button type="button" variant="light" size="sm" onClick={() => savePhoto(async () => null)} disabled={busy || !user.foto}>
              Quitar
            </Button>
          </div>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <input ref={fileRef} type="file" accept={PHOTO_TYPES.join(',')} onChange={handleFile} hidden />
        </div>
      </div>
    </section>
  )
}
