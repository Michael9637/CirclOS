import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, supabaseConfigError } from '../supabase'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', fontSize: '15px', color: '#9e9e9a' }}>
        Loading...
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, supabase, supabaseConfigError }}>
      {children}
    </AuthContext.Provider>
  )
}