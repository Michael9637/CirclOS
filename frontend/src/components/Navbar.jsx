import { Link, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'

export default function Navbar() {
  const { user, supabase } = useAuth()
  const location = useLocation()

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
        <Link to="/register" style={linkStyle('/register')}>Register</Link>
      </div>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
          <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px' }}>
            {user.email}
          </span>
          <button
            onClick={() => supabase.auth.signOut()}
            style={{
              background: 'rgba(255,255,255,0.1)', color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '6px 14px', borderRadius: '6px',
              fontSize: '13px', cursor: 'pointer'
            }}>
            Sign out
          </button>
        </div>
      )}
    </nav>
  )
}