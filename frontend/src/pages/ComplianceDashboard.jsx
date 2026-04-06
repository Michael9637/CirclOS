import { Link } from 'react-router-dom'
import styles from './ToolSuite.module.css'

export default function ComplianceDashboard() {
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <p className={styles.kicker}>Compliance</p>
        <h1 className={styles.title}>Compliance Dashboard</h1>
        <p className={styles.subtitle}>
          Monitor ECGT claim risk and evidence readiness across your operations using one integrated workflow.
        </p>
      </div>

      <div className={styles.panelGrid}>
        <Panel
          title="Website Scanner"
          text="Scan your website for potentially non-compliant green claims."
          linkTo="/app/scanner"
          linkLabel="Open Scanner"
        />
        <Panel
          title="Evidence Records"
          text="Review confirmed match records that can support claim substantiation."
          linkTo="/app/evidence"
          linkLabel="View Evidence"
        />
        <Panel
          title="Waste Listings"
          text="Keep listings current to generate fresh transaction evidence over time."
          linkTo="/app/list"
          linkLabel="Manage Listings"
        />
      </div>

      <div className={`${styles.notice} ${styles.noticeMuted}`}>
        Tip: Confirming marketplace matches automatically strengthens your compliance evidence trail.
      </div>
    </div>
  )
}

function Panel({ title, text, linkTo, linkLabel }) {
  return (
    <div className={styles.panelCard}>
      <h2 className={styles.panelTitle}>{title}</h2>
      <p className={styles.panelText}>{text}</p>
      <Link to={linkTo} className={`${styles.button} ${styles.buttonPrimary}`}>
        {linkLabel}
      </Link>
    </div>
  )
}
