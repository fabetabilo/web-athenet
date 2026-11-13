import styles from './Avatar.module.css'

const SIZES = { sm: styles.sm, md: styles.md, lg: styles.lg, xl: styles.xl, xxl: styles.xxl }

/**
 * Avatar del usuario: su foto si la tiene (`user.foto`) o, si no, la silueta generica
 * de perfil sin foto (cabeza y hombros sobre gris). Es decorativo (aria-hidden): el
 * nombre siempre va escrito al lado.
 *
 * @param {Object} props
 * @param {{ foto?: string }} props.user
 * @param {'sm'|'md'|'lg'|'xl'|'xxl'} [props.size='md'] - 'xxl' toma su lado de `--avatar-size` (10rem por defecto).
 * @param {string} [props.className]
 */
export default function Avatar({ user, size = 'md', className = '' }) {
  return (
    <span className={`${styles.avatar} ${SIZES[size] ?? SIZES.md} ${className}`.trim()} aria-hidden="true">
      {user?.foto ? (
        <img className={styles.image} src={user.foto} alt="" />
      ) : (
        <svg className={styles.silhouette} viewBox="0 0 100 100" focusable="false">
          <circle cx="50" cy="38" r="17" />
          <path d="M14 100c0-24 15-36 36-36s36 12 36 36z" />
        </svg>
      )}
    </span>
  )
}
