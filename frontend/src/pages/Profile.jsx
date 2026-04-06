import { useEffect, useState } from 'react'
import { createCompany, getMyCompany } from '../api'
import { useAuth } from '../components/useAuth'
import styles from './ToolSuite.module.css'

export default function Profile() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    sector: '',
    location: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const loadCompany = async () => {
      if (!user?.id) {
        return
      }

      setLoading(true)
      setError('')
      try {
        const company = await getMyCompany(user.id)
        setFormData({
          name: company?.name || '',
          sector: company?.sector || '',
          location: company?.location || '',
          description: company?.description || '',
        })
      } catch (loadError) {
        const detail = loadError?.response?.data?.detail
        if (typeof detail === 'string' && detail.toLowerCase().includes('no company profile')) {
          setFormData({
            name: '',
            sector: '',
            location: '',
            description: '',
          })
        } else {
          setError(typeof detail === 'string' ? detail : 'Could not load company profile.')
        }
      } finally {
        setLoading(false)
      }
    }

    loadCompany()
  }, [user?.id])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!user?.id) {
      setError('You must be signed in to edit your profile.')
      return
    }

    setSaving(true)
    setMessage('')
    setError('')

    try {
      await createCompany({
        ...formData,
        user_id: user.id,
      })
      setMessage('Profile saved successfully.')
    } catch (submitError) {
      const detail = submitError?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Could not save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <p className={styles.kicker}>Profile</p>
        <h1 className={styles.title}>Company Profile</h1>
        <p className={styles.subtitle}>Update company details used across listings, matching, and compliance workflows.</p>
      </div>

      <section className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <Field label="Company Name" name="name" value={formData.name} onChange={handleChange} required />
            <Field label="Sector" name="sector" value={formData.sector} onChange={handleChange} required />
            <Field label="Location" name="location" value={formData.location} onChange={handleChange} required />

            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label className={styles.label}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={styles.textarea}
                placeholder="Describe your company and material flows"
              />
            </div>
          </div>

          <div className={styles.inlineActions}>
            <button
              type="submit"
              disabled={saving || loading}
              className={`${styles.button} ${styles.buttonPrimary} ${saving || loading ? styles.buttonDisabled : ''}`}
            >
              {loading ? 'Loading...' : saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>

          {message ? <div className={`${styles.notice} ${styles.noticeSuccess}`}>{message}</div> : null}
          {error ? <div className={`${styles.notice} ${styles.noticeError}`}>{error}</div> : null}
        </form>
      </section>
    </div>
  )
}

function Field({ label, ...inputProps }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <input
        {...inputProps}
        className={styles.input}
      />
    </div>
  )
}
