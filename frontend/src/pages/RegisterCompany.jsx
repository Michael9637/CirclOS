import { useState } from 'react'
import { createCompany } from '../api'
import { useAuth } from '../components/AuthProvider'

export default function RegisterCompany() {
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    sector: '',
    location: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const result = await createCompany({
        ...formData,
        // Use the authenticated Supabase user id so backend FK checks pass.
        user_id: user?.id ?? null,
      })
      setMessage(`Company created: ${result.name || 'New company'}`)
      setFormData({
        name: '',
        sector: '',
        location: '',
        description: '',
      })
    } catch (submitError) {
      const detail = submitError?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Could not create company. Please check your backend and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', color: '#111827', marginBottom: '8px' }}>
        Register Company
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>
        Create your company profile to list waste streams and generate compliance evidence.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '24px' }}
      >
        <Field label="Company Name" name="name" value={formData.name} onChange={handleChange} required />
        <Field label="Sector" name="sector" value={formData.sector} onChange={handleChange} required />
        <Field label="Location" name="location" value={formData.location} onChange={handleChange} required />

        <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', color: '#1f2937' }}>
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '6px', padding: '10px 12px', marginBottom: '16px' }}
          placeholder="Describe your company and material flows"
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            background: loading ? '#9ca3af' : '#14532d',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '11px 18px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Saving...' : 'Register Company'}
        </button>

        {message && <div style={{ marginTop: '14px', color: '#166534', fontWeight: 600 }}>{message}</div>}
        {error && <div style={{ marginTop: '14px', color: '#b91c1c', fontWeight: 600 }}>{error}</div>}
      </form>
    </div>
  )
}

function Field({ label, ...inputProps }) {
  return (
    <>
      <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', color: '#1f2937' }}>{label}</label>
      <input
        {...inputProps}
        style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '6px', padding: '10px 12px', marginBottom: '16px' }}
      />
    </>
  )
}
