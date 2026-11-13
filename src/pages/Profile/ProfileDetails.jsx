import { useState } from 'react'
import Button from '../../components/ui/Button/Button'
import Field from '../../components/ui/Field/Field'
import { Pencil } from '../../components/icons'
import { useAuth } from '../../auth/useAuth'
import { GENDER_OPTIONS, REGION_OPTIONS, getRegionLabel } from '../../auth/authConfig'
import { validateName } from '../../auth/validation'
import styles from './Profile.module.css'

// Campos que edita cada fila. El correo no se edita: es el usuario de Cognito.
const ROW_FIELDS = {
  nombre: ['nombre', 'apellido'],
  genero: ['genero'],
  region: ['region'],
}

// Las cuentas anteriores al campo region no lo tienen: se parte de ''
const fromUser = (user) => ({
  nombre: user.nombre,
  apellido: user.apellido,
  genero: user.genero,
  region: user.region ?? '',
})

function validate(values) {
  return {
    nombre: validateName(values.nombre, 'nombre'),
    apellido: validateName(values.apellido, 'apellido'),
    genero: values.genero ? '' : 'Selecciona una opción.',
    region: values.region ? '' : 'Selecciona tu región.',
  }
}

/**
 * Fila de datos: en lectura muestra el valor con un lapiz; al editar muestra
 * sus controles con Guardar / Cancelar. Sin `onEdit` no tiene lapiz (dato fijo).
 */
function ProfileRow({ id, className = '', title, display, muted = false, onEdit, editing, saving, canSave, error, onSave, onCancel, children }) {
  if (editing) {
    return (
      <div className={`${styles.row} ${className}`.trim()}>
        <span className={styles.rowTitle}>{title}</span>
        <form
          className={styles.rowForm}
          onSubmit={(event) => {
            event.preventDefault()
            onSave()
          }}
          onKeyDown={(event) => event.key === 'Escape' && onCancel()}
          noValidate
        >
          {children}
          <div className={styles.rowActions}>
            <Button type="submit" variant="accent" size="sm" disabled={!canSave || saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
            <Button type="button" variant="light" size="sm" onClick={onCancel} disabled={saving}>
              Cancelar
            </Button>
            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className={`${styles.row} ${className}`.trim()}>
      <span className={styles.rowTitle}>{title}</span>
      <div className={styles.rowValue}>
        <p className={muted ? styles.valueMuted : styles.value}>{display}</p>
        {onEdit && (
          <button
            id={`edit-${id}`}
            type="button"
            className={styles.iconButton}
            onClick={onEdit}
            aria-label={`Editar ${title.toLowerCase()}`}
            title="Editar"
          >
            <Pencil aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Pestana "Perfil": datos en modo lectura; el lapiz de cada fila habilita su edicion.
 * Se edita una fila a la vez. La foto se cambia desde la cabecera.
 */
export default function ProfileDetails() {
  const { user, updateProfile } = useAuth()

  const [editing, setEditing] = useState(null) // clave de ROW_FIELDS o null
  const [values, setValues] = useState(() => fromUser(user))
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [formError, setFormError] = useState('')

  const all = validate(values)
  const errors = Object.fromEntries(
    Object.entries(all).map(([key, message]) => [key, submitted || touched[key] ? message : '']),
  )
  const isDirty = (row) => ROW_FIELDS[row].some((key) => values[key] !== (user[key] ?? ''))

  const field = (name) => ({
    value: values[name],
    error: errors[name],
    onChange: (event) => setValues((current) => ({ ...current, [name]: event.target.value })),
    onBlur: () => setTouched((current) => ({ ...current, [name]: true })),
  })

  const startEdit = (row) => {
    setValues(fromUser(user))
    setTouched({})
    setSubmitted(false)
    setFormError('')
    setSaved(false)
    setEditing(row)
  }

  // Sale de la edicion y devuelve el foco al lapiz de esa fila
  const stopEdit = (row) => {
    setEditing(null)
    requestAnimationFrame(() => document.getElementById(`edit-${row}`)?.focus())
  }

  const save = async (row) => {
    setSubmitted(true)
    setFormError('')
    if (ROW_FIELDS[row].some((key) => all[key])) return

    setSaving(true)
    try {
      const patch = Object.fromEntries(ROW_FIELDS[row].map((key) => [key, values[key].trim?.() ?? values[key]]))
      await updateProfile(patch)
      setSaved(true)
      stopEdit(row)
    } catch {
      setFormError('No pudimos guardar los cambios. Inténtalo de nuevo.')
    }
    setSaving(false)
  }

  // Props comunes de una fila editable
  const rowProps = (row) => ({
    editing: editing === row,
    saving,
    canSave: isDirty(row),
    error: formError,
    id: row,
    onEdit: () => startEdit(row),
    onSave: () => save(row),
    onCancel: () => stopEdit(row),
  })

  const genderLabel = GENDER_OPTIONS.find((option) => option.value === user.genero)?.label
  const regionLabel = getRegionLabel(user.region)

  return (
    <div>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>Información personal</h2>
        {saved && (
          <p className={styles.saved} role="status">
            Cambios guardados.
          </p>
        )}
      </div>

      <ProfileRow title="Nombre" display={`${user.nombre} ${user.apellido}`} {...rowProps('nombre')}>
        <div className={styles.pair}>
          <Field tone="light" hideLabel label="Nombre" autoComplete="given-name" autoFocus {...field('nombre')} />
          <Field tone="light" hideLabel label="Apellido" autoComplete="family-name" {...field('apellido')} />
        </div>
      </ProfileRow>

      <ProfileRow title="Correo electrónico" display={user.email} />

      <ProfileRow title="Género" display={genderLabel} {...rowProps('genero')}>
        <Field tone="light" hideLabel label="Género" options={GENDER_OPTIONS} autoFocus {...field('genero')} />
      </ProfileRow>

      <ProfileRow
        title="Región"
        className={styles.rowLast}
        display={regionLabel || 'Sin definir'}
        muted={!regionLabel}
        {...rowProps('region')}
      >
        <Field tone="light" hideLabel label="Región" options={REGION_OPTIONS} autoFocus {...field('region')} />
      </ProfileRow>
    </div>
  )
}
