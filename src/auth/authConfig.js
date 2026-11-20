/**
 * @file authConfig.js
 * Configuracion compartida de la autenticacion de usuarios externos.
 *
 * Mismo criterio que apiClient: sin la configuracion de Cognito (o con el modo demo global)
 * se usa una simulacion local, que no crea cuentas reales.
 */

const USER_POOL_ID = import.meta.env.VITE_COGNITO_USER_POOL_ID || ''
const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID || ''
const DEMO_MOCKS = import.meta.env.VITE_USE_DEMO_MOCKS === 'true'

export const AUTH_MOCK_MODE = DEMO_MOCKS || !USER_POOL_ID || !CLIENT_ID

export const COGNITO_CONFIG = { userPoolId: USER_POOL_ID, clientId: CLIENT_ID }

// La simulacion solo se muestra en desarrollo; en produccion exige Cognito o VITE_AUTH_DEMO=true
export const AUTH_ENABLED =
  !AUTH_MOCK_MODE || import.meta.env.DEV || import.meta.env.VITE_AUTH_DEMO === 'true'

// Codigo que acepta la simulacion en el paso de verificacion
export const MOCK_VERIFICATION_CODE = '123456'

export const VERIFICATION_CODE_LENGTH = 6

// Espejo de la politica por defecto de Cognito. Si el pool usa otra, se ajusta solo aqui
export const PASSWORD_RULES = [
  { id: 'length', label: '8 caracteres', test: (value) => value.length >= 8 },
  { id: 'lower', label: 'Una minúscula', test: (value) => /[a-z]/.test(value) },
  { id: 'upper', label: 'Una mayúscula', test: (value) => /[A-Z]/.test(value) },
  { id: 'number', label: 'Un número', test: (value) => /\d/.test(value) },
  { id: 'symbol', label: 'Un símbolo', test: (value) => /[^A-Za-z0-9\s]/.test(value) },
]

// Regiones de Chile, de norte a sur. El valor es estable (se guarda); la etiqueta es lo que se muestra
export const REGION_OPTIONS = [
  { value: 'arica-parinacota', label: 'Arica y Parinacota' },
  { value: 'tarapaca', label: 'Tarapacá' },
  { value: 'antofagasta', label: 'Antofagasta' },
  { value: 'atacama', label: 'Atacama' },
  { value: 'coquimbo', label: 'Coquimbo' },
  { value: 'valparaiso', label: 'Valparaíso' },
  { value: 'metropolitana', label: 'Metropolitana de Santiago' },
  { value: 'ohiggins', label: "O'Higgins" },
  { value: 'maule', label: 'Maule' },
  { value: 'nuble', label: 'Ñuble' },
  { value: 'biobio', label: 'Biobío' },
  { value: 'araucania', label: 'La Araucanía' },
  { value: 'los-rios', label: 'Los Ríos' },
  { value: 'los-lagos', label: 'Los Lagos' },
  { value: 'aysen', label: 'Aysén' },
  { value: 'magallanes', label: 'Magallanes y la Antártica Chilena' },
]

export const getRegionLabel = (value) => REGION_OPTIONS.find((option) => option.value === value)?.label ?? ''

export const GENDER_OPTIONS = [
  { value: 'femenino', label: 'Femenino' },
  { value: 'masculino', label: 'Masculino' },
  { value: 'otro', label: 'Otro' },
  { value: 'no_indica', label: 'Prefiero no decirlo' },
]
