import { Link } from 'react-router-dom'

export default function ComplianceDashboard() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', color: '#111827', marginBottom: '8px' }}>
        Compliance Dashboard
      </h1>
      <p style={{ color: '#4b5563', lineHeight: 1.6, marginBottom: '18px' }}>
        Use this area to monitor ECGT claim risk and evidence readiness across your marketing and operations.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '14px',
          marginTop: '12px',
        }}
      >
        <Panel
          title="Website Scanner"
          text="Scan your website for potentially non-compliant green claims."
          linkTo="/scanner"
          linkLabel="Open Scanner"
        />
        <Panel
          title="Evidence Records"
          text="Review confirmed match records that can support claim substantiation."
          linkTo="/evidence"
          linkLabel="View Evidence"
        />
        <Panel
          title="Waste Listings"
          text="Keep listings current to generate fresh transaction evidence over time."
          linkTo="/list"
          linkLabel="Manage Listings"
        />
      </div>
    </div>
  )
}

function Panel({ title, text, linkTo, linkLabel }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
      <h2 style={{ marginTop: 0, marginBottom: '6px', color: '#14532d', fontSize: '18px' }}>{title}</h2>
      <p style={{ color: '#4b5563', marginBottom: '12px', lineHeight: 1.5 }}>{text}</p>
      <Link
        to={linkTo}
        style={{
          display: 'inline-block',
          textDecoration: 'none',
          background: '#14532d',
          color: '#fff',
          borderRadius: '6px',
          padding: '8px 12px',
          fontWeight: 600,
        }}
      >
        {linkLabel}
      </Link>
    </div>
  )
}
