import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import styles from './Navbar.module.css'

const appLinks = [
  { label: 'Home', to: '/' },
  { label: 'Dashboard', to: '/app/dashboard' },
  { label: 'Waste', to: '/app/list' },
  { label: 'Compliance', to: '/app/compliance' },
  { label: 'Scanner', to: '/app/scanner' },
  { label: 'Evidence', to: '/app/evidence' },
  { label: 'Profile', to: '/app/profile' },
]

export default function Navbar() {
  const { user, supabase } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const closeMenuOnEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    window.addEventListener('keydown', closeMenuOnEscape)
    return () => window.removeEventListener('keydown', closeMenuOnEscape)
  }, [])

  const accountName = user?.email?.split('@')[0] || 'User'

  const closeMenu = () => {
    setMenuOpen(false)
  }

  const handleLogout = async () => {
    closeMenu()
    if (supabase?.auth) {
      await supabase.auth.signOut()
    }
    navigate('/')
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <button type="button" className={styles.brand} onClick={() => navigate('/')} aria-label="Go to CirclOS homepage">
          <span className={styles.brandMark}>C</span>
          <span className={styles.brandName}>CirclOS</span>
        </button>

        <button
          type="button"
          className={styles.menuToggle}
          onClick={() => setMenuOpen((open) => !open)}
          aria-controls="app-primary-navigation"
          aria-expanded={menuOpen}
          aria-label="Toggle app navigation menu"
        >
          <span className={styles.menuToggleBar} />
          <span className={styles.menuToggleBar} />
          <span className={styles.menuToggleBar} />
        </button>

        <nav
          id="app-primary-navigation"
          aria-label="App"
          className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}
        >
          {appLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={closeMenu}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className={`${styles.actions} ${menuOpen ? styles.actionsOpen : ''}`}>
          <p className={styles.greeting}>Welcome, {accountName}!</p>
          <button
            type="button"
            onClick={handleLogout}
            className={styles.logoutButton}
          >
            Log Out
          </button>
        </div>
      </div>
    </header>
  )
}