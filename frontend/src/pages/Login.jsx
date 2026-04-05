import { useState } from 'react'
import { supabase, supabaseConfigError } from '../supabase'
import { useNavigate } from 'react-router-dom'
import { createCompany } from '../api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('login')
  const [message, setMessage] = useState('')
  const [companyForm, setCompanyForm] = useState({
    name: '',
    sector: '',
    location: '',
    description: '',
  })
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else navigate('/')
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        const signupUserId = data?.user?.id
        if (signupUserId) {
          try {
            await createCompany({
              ...companyForm,
              user_id: signupUserId,
            })
            setMessage('Account created and company profile saved. Check your email to confirm your account, then sign in.')
          } catch (companyError) {
            const detail = companyError?.response?.data?.detail
            setError(typeof detail === 'string' ? detail : 'Account created, but company profile setup failed. You can complete it later in Profile.')
          }
        } else {
          setMessage('Account created. Check your email to confirm your account, then sign in.')
        }
      }
    }
    setLoading(false)
  }

  const handleCompanyChange = (event) => {
    const { name, value } = event.target
    setCompanyForm((prev) => ({ ...prev, [name]: value }))
  }

  const card = {
    width: '400px', margin: '80px auto', background: 'white',
    padding: '40px', borderRadius: '12px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.1)'
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', border: '1px solid #e0e0dc',
    borderRadius: '6px', fontSize: '15px', marginTop: '6px',
    marginBottom: '16px', display: 'block'
  }

  const btnStyle = {
    width: '100%', padding: '13px', background: '#1a3a1a',
    color: 'white', border: 'none', borderRadius: '6px',
    fontSize: '15px', fontWeight: '500', cursor: 'pointer',
    opacity: loading ? 0.6 : 1, marginTop: '8px'
  }

  if (supabaseConfigError) {
    return (
      <div style={{ background: '#f7f7f5', minHeight: '100vh', padding: '40px 20px' }}>
        <div
          style={{
            maxWidth: '680px',
            margin: '40px auto',
            background: '#fff4e5',
            border: '1px solid #f8d7a8',
            borderRadius: '10px',
            padding: '20px 22px',
            color: '#8a4b00',
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: '10px' }}>Auth setup incomplete</h2>
          <p style={{ margin: 0 }}>
            {supabaseConfigError}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#f7f7f5', minHeight: '100vh' }}>
      <div style={card}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#1a3a1a' }}>
            Circl<span style={{ color: '#8BC34A' }}>OS</span>
          </div>
          <div style={{ color: '#9e9e9a', fontSize: '14px', marginTop: '4px' }}>
            The Circular Operating System
          </div>
        </div>

        <h2 style={{ fontSize: '18px', marginBottom: '24px', textAlign: 'center' }}>
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </h2>

        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: '13px', fontWeight: '500', color: '#5c5c58' }}>
            Email
          </label>
          <input
            type="email" value={email} required
            onChange={e => setEmail(e.target.value)}
            style={inputStyle}
          />
          <label style={{ fontSize: '13px', fontWeight: '500', color: '#5c5c58' }}>
            Password
          </label>
          <input
            type="password" value={password} required
            onChange={e => setPassword(e.target.value)}
            style={inputStyle}
          />

          {mode === 'signup' && (
            <>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Company Information
              </div>

              <label style={{ fontSize: '13px', fontWeight: '500', color: '#5c5c58' }}>
                Company Name
              </label>
              <input
                name="name"
                type="text"
                value={companyForm.name}
                required
                onChange={handleCompanyChange}
                style={inputStyle}
              />

              <label style={{ fontSize: '13px', fontWeight: '500', color: '#5c5c58' }}>
                Sector
              </label>
              <input
                name="sector"
                type="text"
                value={companyForm.sector}
                required
                onChange={handleCompanyChange}
                style={inputStyle}
              />

              <label style={{ fontSize: '13px', fontWeight: '500', color: '#5c5c58' }}>
                Location
              </label>
              <input
                name="location"
                type="text"
                value={companyForm.location}
                required
                onChange={handleCompanyChange}
                style={inputStyle}
              />

              <label style={{ fontSize: '13px', fontWeight: '500', color: '#5c5c58' }}>
                Description
              </label>
              <textarea
                name="description"
                value={companyForm.description}
                onChange={handleCompanyChange}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="Describe your company and material flows"
              />
            </>
          )}

          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#5c5c58' }}>
          {mode === 'login' ? (
            <>Don't have an account?{' '}
              <span onClick={() => setMode('signup')}
                style={{ color: '#2d6a2d', cursor: 'pointer', textDecoration: 'underline' }}>
                Sign up
              </span>
            </>
          ) : (
            <>Already have an account?{' '}
              <span onClick={() => setMode('login')}
                style={{ color: '#2d6a2d', cursor: 'pointer', textDecoration: 'underline' }}>
                Sign in
              </span>
            </>
          )}
        </div>

        {error && (
          <div style={{ marginTop: '16px', color: '#c62828', fontSize: '14px',
            background: '#ffebee', padding: '10px', borderRadius: '6px' }}>
            {error}
          </div>
        )}
        {message && (
          <div style={{ marginTop: '16px', color: '#2d6a2d', fontSize: '14px',
            background: '#e8f5e9', padding: '10px', borderRadius: '6px' }}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}