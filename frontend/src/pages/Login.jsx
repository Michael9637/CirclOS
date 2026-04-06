import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase, supabaseConfigError } from '../supabase'
import { createCompany } from '../api'
import styles from './Login.module.css'

function normalizeLoginError(rawMessage) {
  const message = (rawMessage || '').toLowerCase()

  if (message.includes('invalid login credentials')) {
    return 'No account was found for these credentials. Create an account first or try again.'
  }

  if (message.includes('email not confirmed')) {
    return 'Your account exists but email confirmation is still pending. Check your inbox before signing in.'
  }

  return rawMessage || 'Sign in failed. Please try again.'
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'login')
  const [companyForm, setCompanyForm] = useState({
    name: '',
    sector: '',
    location: '',
    description: '',
  })
  const navigate = useNavigate()

  const isSignup = mode === 'signup'

  const handleCompanyChange = (event) => {
    const { name, value } = event.target
    setCompanyForm((prev) => ({ ...prev, [name]: value }))
  }

  const toggleMode = () => {
    setMode((currentMode) => (currentMode === 'login' ? 'signup' : 'login'))
    setError('')
    setMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (!supabase) {
      setError('Authentication service is unavailable right now. Please try again later.')
      setLoading(false)
      return
    }

    if (!isSignup) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

      if (signInError) {
        setError(normalizeLoginError(signInError.message))
        setLoading(false)
        return
      }

      navigate('/app/dashboard')
      setLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    const signupUserId = data?.user?.id

    if (signupUserId) {
      try {
        await createCompany({
          ...companyForm,
          user_id: signupUserId,
        })
      } catch (companyError) {
        const detail = companyError?.response?.data?.detail
        setError(
          typeof detail === 'string'
            ? detail
            : 'Account created, but company profile setup failed. You can complete it later in Profile.'
        )
        setLoading(false)
        return
      }
    }

    setMessage('Account created. Check your email to confirm your account, then sign in.')
    setMode('login')
    setLoading(false)
  }

  if (supabaseConfigError) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <Link to="/" className={styles.brand} aria-label="Go to CirclOS homepage">
              <span className={styles.brandMark}>C</span>
              <span className={styles.brandName}>CirclOS</span>
            </Link>
          </div>
        </header>

        <main className={styles.main}>
          <section className={styles.panel}>
            <p className={styles.kicker}>Authentication</p>
            <h1 className={styles.title}>Auth setup incomplete</h1>
            <p className={`${styles.notice} ${styles.noticeError}`}>{supabaseConfigError}</p>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#main-content">
        Skip to main content
      </a>

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.brand} aria-label="Go to CirclOS homepage">
            <span className={styles.brandMark}>C</span>
            <span className={styles.brandName}>CirclOS</span>
          </Link>
          <Link to="/" className={styles.backHome}>
            Back to Home
          </Link>
        </div>
      </header>

      <main id="main-content" className={styles.main}>
        <section className={styles.panel}>
          <p className={styles.kicker}>Account access</p>
          <h1 className={styles.title}>{isSignup ? 'Create your CirclOS account' : 'Sign in to CirclOS'}</h1>
          <p className={styles.subtitle}>
            {isSignup
              ? 'Create an account to access Waste, Compliance, Scanner, and Evidence workflows.'
              : 'Only existing accounts can sign in. If you do not have one yet, create your account first.'}
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              required
              onChange={(event) => setEmail(event.target.value)}
              className={styles.input}
              autoComplete="email"
            />

            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              required
              onChange={(event) => setPassword(event.target.value)}
              className={styles.input}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
            />

            {isSignup ? (
              <div className={styles.companyGrid}>
                <div>
                  <label className={styles.label} htmlFor="company-name">
                    Company Name
                  </label>
                  <input
                    id="company-name"
                    name="name"
                    type="text"
                    value={companyForm.name}
                    required
                    onChange={handleCompanyChange}
                    className={styles.input}
                  />
                </div>

                <div>
                  <label className={styles.label} htmlFor="company-sector">
                    Sector
                  </label>
                  <input
                    id="company-sector"
                    name="sector"
                    type="text"
                    value={companyForm.sector}
                    required
                    onChange={handleCompanyChange}
                    className={styles.input}
                  />
                </div>

                <div className={styles.companyWide}>
                  <label className={styles.label} htmlFor="company-location">
                    Location
                  </label>
                  <input
                    id="company-location"
                    name="location"
                    type="text"
                    value={companyForm.location}
                    required
                    onChange={handleCompanyChange}
                    className={styles.input}
                  />
                </div>

                <div className={styles.companyWide}>
                  <label className={styles.label} htmlFor="company-description">
                    Description
                  </label>
                  <textarea
                    id="company-description"
                    name="description"
                    value={companyForm.description}
                    onChange={handleCompanyChange}
                    rows={3}
                    className={styles.textarea}
                    placeholder="Describe your company and material flows"
                  />
                </div>
              </div>
            ) : null}

            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <p className={styles.modeRow}>
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
            <button type="button" onClick={toggleMode} className={styles.modeButton}>
              {isSignup ? 'Sign in' : 'Sign up'}
            </button>
          </p>

          {error ? <div className={`${styles.notice} ${styles.noticeError}`}>{error}</div> : null}
          {message ? <div className={`${styles.notice} ${styles.noticeSuccess}`}>{message}</div> : null}
        </section>

        <aside className={styles.sidePanel}>
          <h2>Integrated Circular Operations</h2>
          <p>
            Once signed in, your workspace uses the same visual system and navigation style as the homepage across every
            tool page.
          </p>
          <ul className={styles.featureList}>
            <li>List waste streams and match with buyers in one flow.</li>
            <li>Run compliance scans and capture evidence with shared context.</li>
            <li>Return to Home instantly through unified navigation.</li>
          </ul>
        </aside>
      </main>
    </div>
  )
}