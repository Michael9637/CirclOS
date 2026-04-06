import React, { useEffect, useState } from "react";
import { getEvidenceRecords } from "../api";
import { useAuth } from "../components/useAuth";
import styles from "./ToolSuite.module.css";

const EvidenceRecords = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) {
      setRecords([]);
      setLoading(false);
      return;
    }

    const fetchEvidence = async () => {
      try {
        const data = await getEvidenceRecords(user.id);
        setRecords(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch evidence records:", error);
        const detail = error?.response?.data?.detail;
        setError(typeof detail === "string" ? detail : "Could not load evidence records.");
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvidence();
  }, [user?.id]);

  if (loading) {
    return <div className={`${styles.notice} ${styles.noticeMuted}`}>Loading evidence records...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <p className={styles.kicker}>Evidence</p>
        <h1 className={styles.title}>Evidence Timeline</h1>
        <p className={styles.subtitle}>Confirmed circular transactions with timestamped, auditable evidence records.</p>
      </div>

      {error ? <div className={`${styles.notice} ${styles.noticeError}`}>{error}</div> : null}

      {records.length === 0 ? (
        <div className={`${styles.notice} ${styles.noticeMuted}`}>
          No evidence records yet. Confirm a match on the dashboard to generate your first record.
        </div>
      ) : null}

      <div className={styles.stack}>
        {records.map((record) => (
          <article key={record.id} className={styles.timelineCard}>
            <div className={styles.timelineTop}>
              <span>Confirmed at {record.confirmed_at ? new Date(record.confirmed_at).toLocaleString() : "unknown"}</span>
              <span>Record #{record.id}</span>
            </div>

            <h2 className={styles.timelineTitle}>{record.material_type || "Material not specified"}</h2>

            <p className={styles.timelineMeta}>Volume: {record.volume_kg || 0} kg</p>
            <p className={styles.timelineMeta}>AWG classification: {record.awg_classification || "n/a"}</p>

            <div className={styles.certificate}>{record.certificate_text || "No certificate text available."}</div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default EvidenceRecords;
