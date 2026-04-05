import { useState, useEffect } from 'react'
import { supabase, supabaseConfigError } from '../supabase'
import { AuthContext } from './AuthContext'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(supabase))

  useEffect(() => {
    if (!supabase) {
      return undefined
    }

    let isMounted = true

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!isMounted) {
          return
        }
        setUser(session?.user ?? null)
        setLoading(false)
      })
      .catch(() => {
        if (isMounted) {
          setLoading(false)
        }
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
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