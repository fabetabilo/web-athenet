import './styles/App.css'
import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Home from './pages/Home'

function App() {
  const [navCollapsed, setNavCollapsed] = useState(false)
  const toggleNav = () => setNavCollapsed((prev) => !prev)

  return (
    <div className="app-layout">
      <Navbar collapsed={navCollapsed} onCollapse={toggleNav} />
      <main className={`content ${navCollapsed ? 'nav-collapsed' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
