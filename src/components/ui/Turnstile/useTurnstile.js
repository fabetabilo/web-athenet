import { useCallback, useEffect, useRef } from 'react'

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || ''
// holgura para que el usuario resuelva el desafio interactivo si Cloudflare lo pide
const TOKEN_TIMEOUT_MS = 60000

let scriptPromise = null

function loadScript() {
  if (window.turnstile) return Promise.resolve(window.turnstile)

  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.async = true
    script.onload = () => resolve(window.turnstile)
    script.onerror = () => {
      scriptPromise = null
      script.remove()
      reject(new Error('No se pudo cargar Turnstile'))
    }
    document.head.appendChild(script)
  })

  return scriptPromise
}

function settle(pendingRef, outcome, value) {
  const pending = pendingRef.current
  pendingRef.current = null
  pending?.[outcome](value)
}

/**
 * Widget de Cloudflare Turnstile en modo explicito: el token se pide recien al enviar
 * y el widget solo se ve si Cloudflare exige interaccion.
 *
 * @returns {{
 *   containerRef: import('react').RefObject<HTMLDivElement>,
 *   prepare: () => void,
 *   getToken: () => Promise<string>,
 *   reset: () => void,
 * }}
 */
export function useTurnstile() {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)
  const readyRef = useRef(null)
  const pendingRef = useRef(null)

  const ensureWidget = useCallback(() => {
    if (!SITE_KEY) return Promise.reject(new Error('VITE_TURNSTILE_SITE_KEY no definida'))

    readyRef.current ??= loadScript()
      .then((turnstile) => {
        widgetIdRef.current ??= turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          execution: 'execute',
          appearance: 'interaction-only',
          theme: 'dark',
          language: 'es',
          retry: 'never',
          callback: (token) => settle(pendingRef, 'resolve', token),
          'error-callback': () => {
            settle(pendingRef, 'reject', new Error('Turnstile rechazo la verificacion'))
            return true
          },
          'timeout-callback': () => settle(pendingRef, 'reject', new Error('Desafio de Turnstile vencido')),
        })
        return turnstile
      })
      .catch((error) => {
        readyRef.current = null
        throw error
      })

    return readyRef.current
  }, [])

  // precarga al enfocar; si falla, el error real se reporta en getToken
  const prepare = useCallback(() => {
    ensureWidget().catch(() => {})
  }, [ensureWidget])

  const getToken = useCallback(async () => {
    const turnstile = await ensureWidget()

    return new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => settle(pendingRef, 'reject', new Error('Turnstile no respondio')),
        TOKEN_TIMEOUT_MS,
      )
      pendingRef.current = {
        resolve: (token) => { clearTimeout(timer); resolve(token) },
        reject: (error) => { clearTimeout(timer); reject(error) },
      }
      turnstile.execute(widgetIdRef.current)
    })
  }, [ensureWidget])

  // el token es de un solo uso: hay que resetear tras cada envio
  const reset = useCallback(() => {
    if (widgetIdRef.current !== null) window.turnstile?.reset(widgetIdRef.current)
  }, [])

  useEffect(() => () => {
    if (widgetIdRef.current !== null) window.turnstile?.remove(widgetIdRef.current)
    widgetIdRef.current = null
    readyRef.current = null
    settle(pendingRef, 'reject', new Error('Formulario desmontado'))
  }, [])

  return { containerRef, prepare, getToken, reset }
}
