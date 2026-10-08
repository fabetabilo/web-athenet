import './styles/App.css'
import { useEffect, useRef } from 'react'
import { Route, Routes, useLocation, useNavigationType } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import { RouteTransitionProvider, useRouteTransition } from './components/transition'
import { resetScroll } from './utils/resetScroll'
import Home from './pages/Home'
import Events from './pages/Events/Events'
import EventDetail from './pages/Events/EventDetail'
import Institutions from './pages/Institutions/Institutions'
import InstitutionDetail from './pages/Institutions/InstitutionDetail'

function AppShell() {
  const { phase, isCovering } = useRouteTransition()
  const { key } = useLocation()
  const navigationType = useNavigationType()
  const mainRef = useRef(null)
  const previousPhase = useRef(phase)

  // Toda navegacion arranca arriba. En POP (atras/adelante, y la carga inicial)
  // manda el navegador: restaura la posicion y respeta el #hash de entrada.
  useEffect(() => {
    if (navigationType !== 'POP') resetScroll()
  }, [key, navigationType])

  // El inert de abajo desenfoca el link clickeado, asi que al terminar el foco
  // queda en el body: se devuelve al contenido.
  useEffect(() => {
    if (previousPhase.current === 'reveal' && phase === 'idle') {
      mainRef.current?.focus({ preventScroll: true })
    }
    previousPhase.current = phase
  }, [phase])

  return (
    // inert mientras tapa: pointer-events por si solo no impide tabular al contenido oculto
    <div className="app-layout" inert={isCovering || undefined}>
      <Navbar />
      <main className="content" ref={mainRef} tabIndex={-1} aria-busy={isCovering}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/institutions" element={<Institutions />} />
          <Route path="/institutions/:id" element={<InstitutionDetail />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <RouteTransitionProvider>
      <AppShell />
    </RouteTransitionProvider>
  )
}

export default App
