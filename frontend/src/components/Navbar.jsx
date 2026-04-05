import { Link, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from './useAuth'

export default function Navbar() {
  const { user, supabase } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function isActive(path) {
    return location.pathname === path
  }

  const linkStyle = (path) => ({
    display: 'flex', alignItems: 'center', padding: '0 16px',
    color: isActive(path) ? 'white' : 'rgba(255,255,255,0.65)',
    textDecoration: 'none', fontSize: '14px', fontWeight: '500',
    borderBottom: isActive(path) ? '2px solid #8BC34A' : '2px solid transparent',
    height: '100%', transition: 'color 0.15s'
  })

  return (
    <nav style={{
      background: '#1a3a1a', padding: '0 32px', display: 'flex',
      alignItems: 'stretch', height: '58px', position: 'sticky',
      top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>
      <Link to="/" style={{
        color: 'white', fontSize: '20px', fontWeight: '700',
        textDecoration: 'none', display: 'flex', alignItems: 'center',
        letterSpacing: '-0.5px'
      }}>
        Circl<span style={{ color: '#8BC34A' }}>OS</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'stretch', marginLeft: '32px' }}>
        <Link to="/" style={linkStyle('/')}>Dashboard</Link>
        <Link to="/list" style={linkStyle('/list')}>List Waste</Link>
        <Link to="/compliance" style={linkStyle('/compliance')}>Compliance</Link>
        <Link to="/scanner" style={linkStyle('/scanner')}>Scanner</Link>
        <Link to="/evidence" style={linkStyle('/evidence')}>Evidence</Link>
      </div>

      {user && (
        <div ref={menuRef} style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', position: 'relative' }}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              maxWidth: '280px',
            }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</span>
            <span>{menuOpen ? '▲' : '▼'}</span>
          </button>

          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '48px',
                right: 0,
                minWidth: '180px',
                background: 'white',
                borderRadius: '8px',
                boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
              }}
            >
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  color: '#111827',
                  padding: '10px 12px',
                  fontSize: '14px',
                }}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  setMenuOpen(false)
                  supabase.auth.signOut()
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  background: 'white',
                  color: '#b91c1c',
                  padding: '10px 12px',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}