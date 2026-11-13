import { useState } from 'react'
import ProfileHero from './ProfileHero'
import ProfileDetails from './ProfileDetails'
import FollowedTeams from './FollowedTeams'
import styles from './Profile.module.css'

const TABS = [
  { id: 'perfil', label: 'Perfil' },
  { id: 'equipos', label: 'Equipos que sigues' },
]

/** Perfil del usuario con sesion. Se monta dentro de ProtectedRoute: `user` siempre existe. */
export default function Profile() {
  const [tab, setTab] = useState('perfil')

  return (
    <div className={styles.page}>
      <ProfileHero />

      <div className={styles.container}>
        <div className={styles.tabs} role="tablist" aria-label="Secciones del perfil">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`tab-${id}`}
              aria-selected={tab === id}
              aria-controls={`panel-${id}`}
              className={`${styles.tab} ${tab === id ? styles.tabActive : ''}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab === 'perfil' ? <ProfileDetails /> : <FollowedTeams />}
        </div>
      </div>
    </div>
  )
}
