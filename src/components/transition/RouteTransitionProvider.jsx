import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { RouteTransitionContext } from './routeTransitionContext'
import RouteTransitionOverlay from './RouteTransitionOverlay'
import { crossesSection, getSectionLabel } from '../../utils/routeSection'
import { lockScroll, unlockScroll } from '../../utils/scrollLock'
import { readDurationMs } from '../../utils/cssDuration'

/**
 * Maquina de fases de la pantalla de transicion entre secciones.
 *
 *   idle --click que cruza--> cover --fin de la cortina--> hold --> reveal --> idle
 *                               |                           |
 *                        LA URL NO CAMBIA          aqui se llama navigate()
 *
 * La linea de tiempo la manda la cortina: una pagina que carga rapido no puede
 * acortarla, solo alargarla con useTransitionHold. Ver README.md.
 */

const PHASE = { IDLE: 'idle', COVER: 'cover', HOLD: 'hold', REVEAL: 'reveal' }

/** Respaldo en ms por si getComputedStyle no devuelve nada utilizable. El CSS manda. */
const FALLBACK = { cover: 480, holdMin: 700, holdMax: 2500, reveal: 760 }

/** Holgura del watchdog sobre la duracion declarada, en ms. */
const WATCHDOG_SLACK = 300

export default function RouteTransitionProvider({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  const [phase, setPhase] = useState(PHASE.IDLE)
  const [pendingLabel, setPendingLabel] = useState('')
  const [holdCount, setHoldCount] = useState(0)
  const [minHoldDone, setMinHoldDone] = useState(false)

  const rootRef = useRef(null)
  const pendingRef = useRef(null)
  const lockedRef = useRef(false)
  const reducedMotionRef = useRef(false)
  const pathnameRef = useRef(location.pathname)

  // Espejo sincrono de la fase: un avance puede dispararse desde un evento del
  // DOM y desde el watchdog en el mismo tick, antes de que React re-renderice.
  const phaseRef = useRef(PHASE.IDLE)

  // Un token por navegacion: cualquier evento o timeout tardio se descarta solo.
  const runRef = useRef(0)

  useEffect(() => {
    pathnameRef.current = location.pathname
  }, [location.pathname])

  // --- Lock de scroll idempotente -----------------------------------------
  const acquireLock = useCallback(() => {
    if (lockedRef.current) return
    lockedRef.current = true
    lockScroll()
  }, [])

  const releaseLock = useCallback(() => {
    if (!lockedRef.current) return
    lockedRef.current = false
    unlockScroll()
  }, [])

  useEffect(() => releaseLock, [releaseLock])

  // --- prefers-reduced-motion ---------------------------------------------
  // Se consulta desde JS y no solo desde CSS: con animation none no hay
  // animationend, y la maquina correria entera a base de watchdogs.
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotionRef.current = query.matches
    const handler = (event) => { reducedMotionRef.current = event.matches }
    query.addEventListener('change', handler)
    return () => query.removeEventListener('change', handler)
  }, [])

  // --- Avance de fase ------------------------------------------------------
  const advance = useCallback((runId, from, to, sideEffect) => {
    if (runId !== runRef.current) return
    if (phaseRef.current !== from) return
    phaseRef.current = to          // marca inmediata: el segundo disparo es no-op
    sideEffect?.()
    setPhase(to)
  }, [])

  /** Fin de cover: aqui y solo aqui cambia la URL. */
  const commit = useCallback((runId) => {
    advance(runId, PHASE.COVER, PHASE.HOLD, () => {
      const pending = pendingRef.current
      if (pending) navigate(pending.to, pending.options)
    })
  }, [advance, navigate])

  const finish = useCallback((runId) => {
    advance(runId, PHASE.REVEAL, PHASE.IDLE, () => {
      pendingRef.current = null
      setPendingLabel('')
    })
  }, [advance])

  /** La cortina es el elemento lider: su animationend avanza la maquina. */
  const handleLeadAnimationEnd = useCallback(() => {
    const runId = runRef.current
    if (phaseRef.current === PHASE.COVER) commit(runId)
    else if (phaseRef.current === PHASE.REVEAL) finish(runId)
  }, [commit, finish])

  // --- cover: espera a que la cortina cubra, luego commitea ---------------
  useEffect(() => {
    if (phase !== PHASE.COVER) return undefined
    const runId = runRef.current
    // La espera se lee del CSS: un respaldo mas corto que la animacion la truncaria.
    const wait = readDurationMs(rootRef.current, '--rt-cover', FALLBACK.cover) + WATCHDOG_SLACK
    const timer = window.setTimeout(() => commit(runId), wait)
    return () => window.clearTimeout(timer)
  }, [phase, commit])

  // --- hold: minimo cubierto + valvula de seguridad -----------------------
  useEffect(() => {
    if (phase !== PHASE.HOLD) return undefined
    const runId = runRef.current
    const minMs = readDurationMs(rootRef.current, '--rt-hold-min', FALLBACK.holdMin)
    const maxMs = readDurationMs(rootRef.current, '--rt-hold-max', FALLBACK.holdMax)

    const minTimer = window.setTimeout(() => setMinHoldDone(true), minMs)
    // Un fetch colgado no puede dejar al usuario atrapado tras una cortina opaca.
    const maxTimer = window.setTimeout(
      () => advance(runId, PHASE.HOLD, PHASE.REVEAL, releaseLock),
      maxMs,
    )

    return () => {
      window.clearTimeout(minTimer)
      window.clearTimeout(maxTimer)
    }
  }, [phase, advance, releaseLock])

  // Sale de hold solo cuando se cumplen AMBAS: el minimo paso y nadie retiene.
  useEffect(() => {
    if (phase !== PHASE.HOLD) return
    if (!minHoldDone || holdCount > 0) return
    advance(runRef.current, PHASE.HOLD, PHASE.REVEAL, releaseLock)
  }, [phase, minHoldDone, holdCount, advance, releaseLock])

  // --- reveal: espera a que la cortina se vaya ----------------------------
  useEffect(() => {
    if (phase !== PHASE.REVEAL) return undefined
    const runId = runRef.current
    const wait = readDurationMs(rootRef.current, '--rt-reveal', FALLBACK.reveal) + WATCHDOG_SLACK
    const timer = window.setTimeout(() => finish(runId), wait)
    return () => window.clearTimeout(timer)
  }, [phase, finish])

  // --- Aborto si la URL cambia sin que la commitearamos nosotros ----------
  // Durante cover todavia no navegamos, asi que cualquier entrada nueva del
  // historial es externa (atras/adelante, o un navigate fuera del sistema).
  useEffect(() => {
    if (phaseRef.current !== PHASE.COVER) return
    runRef.current += 1
    phaseRef.current = PHASE.IDLE
    pendingRef.current = null
    releaseLock()
    setPhase(PHASE.IDLE)
    setPendingLabel('')
  }, [location.key, releaseLock])

  // --- API -----------------------------------------------------------------

  /**
   * Unica puerta de decision. true = la pantalla se hace cargo y el llamador
   * debe cancelar su comportamiento por defecto; false = navegar normal.
   */
  const requestTransition = useCallback((to, options = {}) => {
    const { transition = 'auto', resolvedPath, ...navigateOptions } = options

    if (transition === 'never') return false
    if (typeof resolvedPath !== 'string' || resolvedPath === '') return false
    // Una URL externa no es nuestra: que la maneje el navegador.
    if (typeof to === 'string' && /^[a-z][a-z0-9+.-]*:/i.test(to)) return false

    const current = phaseRef.current
    // Pasado el commit ya no re-tapamos: el usuario se interrumpio a si mismo
    // y merece ir directo. Nunca se encola.
    if (current === PHASE.HOLD || current === PHASE.REVEAL) return false

    const shouldAnimate =
      transition === 'always' || crossesSection(pathnameRef.current, resolvedPath)
    if (!shouldAnimate) return false

    if (reducedMotionRef.current) {
      navigate(to, navigateOptions)
      return true
    }

    pendingRef.current = { to, options: navigateOptions, resolvedPath }

    // Segundo click antes del commit: re-apunta el destino sin cortar la animacion.
    if (current === PHASE.COVER) return true

    runRef.current += 1
    phaseRef.current = PHASE.COVER
    setMinHoldDone(false)
    setPendingLabel(getSectionLabel(resolvedPath))
    acquireLock()
    setPhase(PHASE.COVER)
    return true
  }, [navigate, acquireLock])

  /** Registra un retenedor y devuelve su liberador. Contador, no booleano. */
  const registerHold = useCallback(() => {
    setHoldCount((count) => count + 1)
    let released = false
    return () => {
      if (released) return
      released = true
      setHoldCount((count) => Math.max(0, count - 1))
    }
  }, [])

  const isCovering = phase === PHASE.COVER || phase === PHASE.HOLD

  const value = useMemo(() => ({
    phase,
    isCovering,
    requestTransition,
    registerHold,
  }), [phase, isCovering, requestTransition, registerHold])

  return (
    <RouteTransitionContext.Provider value={value}>
      {children}
      <RouteTransitionOverlay
        rootRef={rootRef}
        phase={phase}
        label={pendingLabel}
        onLeadAnimationEnd={handleLeadAnimationEnd}
      />
    </RouteTransitionContext.Provider>
  )
}
