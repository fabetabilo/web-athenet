import { useState } from 'react'
import ProfileHero from './ProfileHero'
import ProfileDetails from './ProfileDetails'
import ProfileNotifications from './ProfileNotifications'
import FollowedTeams from './FollowedTeams'
import { User, Bell, Users } from '../../components/icons'
import styles from './Profile.module.css'

// Secciones de la barra lateral. Para agregar una: sumarla aqui y en PANELS
const SECTIONS = [
  { id: 'perfil', label: 'Perfil', Icon: User },
  { id: 'notificaciones', label: 'Notificaciones', Icon: Bell },
  { id: 'equipos', label: 'Equipos que sigues', Icon: Users },
]

const PANELS = {
  perfil: ProfileDetails,
  notificaciones: ProfileNotifications,
  equipos: FollowedTeams,
}

/** Perfil del usuario con sesion. Se monta dentro de ProtectedRoute: `user` siempre existe. */
export default function Profile() {
  const [section, setSection] = useState('perfil')
  const Panel = PANELS[section]

  return (
    <div className={styles.page}>
      <ProfileHero
        nav={
          // En pantallas angostas pasa a ser una fila con scroll horizontal
          <div className={styles.sidebar} role="tablist" aria-orientation="vertical" aria-label="Secciones del perfil">
            {SECTIONS.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                id={`tab-${id}`}
                aria-selected={section === id}
                aria-controls={`panel-${id}`}
                className={`${styles.sideItem} ${section === id ? styles.sideItemActive : ''}`}
                onClick={() => setSection(id)}
              >
                <Icon className={styles.sideIcon} aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        }
      >
        <div role="tabpanel" id={`panel-${section}`} aria-labelledby={`tab-${section}`}>
          <Panel />
        </div>
      </ProfileHero>
    </div>
  )
}
