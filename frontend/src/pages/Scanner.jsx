import React, { useState } from "react";
import { scanWebsite } from "../api";
import { useAuth } from "../components/useAuth";
import styles from "./ToolSuite.module.css";

const Scanner = () => {
  const { user } = useAuth();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const claims = Array.isArray(result?.claims) ? result.claims : [];

  const handleScan = async (event) => {
    event.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    if (!user?.id) {
      setError("You must be signed in to run a scan.");
      setLoading(false);
      return;
    }

    try {
      const data = await scanWebsite({
        url,
        user_id: user.id,
      });
      setResult(data);
    } catch (scanError) {
      const detail = scanError?.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? `Scan failed: ${detail}`
          : "Scan failed. Check the URL and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getClaimStyle = (status) => {
    if (status === "prohibited") {
      return {
        cardClass: `${styles.claimCard} ${styles.claimProhibited}`,
        tagClass: `${styles.tag} ${styles.tagProhibited}`,
        tagText: "PROHIBITED",
      };
    }

    if (status === "needs_evidence") {
      return {
        cardClass: `${styles.claimCard} ${styles.claimNeedsEvidence}`,
        tagClass: `${styles.tag} ${styles.tagNeedsEvidence}`,
        tagText: "NEEDS EVIDENCE",
      };
    }

    return {
      cardClass: `${styles.claimCard} ${styles.claimCompliant}`,
      tagClass: `${styles.tag} ${styles.tagCompliant}`,
      tagText: "COMPLIANT",
    };
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <p className={styles.kicker}>Scanner</p>
        <h1 className={styles.title}>ECGT Compliance Scanner</h1>
        <p className={styles.subtitle}>
          Enter your website URL to detect green claims and classify risk against EU ECGT Directive 2024/825.
        </p>
      </div>

      <section className={styles.card}>
        <form onSubmit={handleScan} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="website-url">
              Website URL
            </label>
            <input
              id="website-url"
              type="text"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://www.yourcompany.at"
              required
              className={styles.input}
            />
          </div>

          <div className={styles.inlineActions}>
            <button
              type="submit"
              disabled={loading}
              className={`${styles.button} ${styles.buttonPrimary} ${loading ? styles.buttonDisabled : ""}`}
            >
              {loading ? "Scanning..." : "Scan Website"}
            </button>
          </div>
        </form>
      </section>

      {error ? <div className={`${styles.notice} ${styles.noticeError}`}>{error}</div> : null}

      {result ? (
        <section className={styles.stack}>
          <div className={styles.statsGrid}>
            {[
              { value: result.total_claims_found, label: "Claims found" },
              { value: result.prohibited_count, label: "Prohibited" },
              { value: result.needs_evidence_count, label: "Need evidence" },
            ].map(({ value, label }) => (
              <article key={label} className={styles.statCard}>
                <p className={styles.statValue}>{value}</p>
                <p className={styles.statLabel}>{label}</p>
              </article>
            ))}
          </div>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Detailed Claim Analysis</h2>

            {claims.length === 0 ? (
              <div className={`${styles.notice} ${styles.noticeMuted}`}>
                No claim-level details were returned by the scanner.
              </div>
            ) : (
              <div className={styles.claimList}>
                {claims.map((claim, index) => {
                  const claimStyle = getClaimStyle(claim.status);

                  return (
                    <article key={index} className={claimStyle.cardClass}>
                      <div className={styles.claimTopRow}>
                        <p className={styles.claimQuote}>"{claim.text}"</p>
                        <span className={claimStyle.tagClass}>{claimStyle.tagText}</span>
                      </div>

                      <div className={styles.claimRisk}>{claim.ecgt_risk}</div>
                      <p className={styles.bodyText}>
                        Keywords: {Array.isArray(claim.keywords_found) ? claim.keywords_found.join(", ") : "n/a"}
                      </p>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </section>
      ) : null}
    </div>
  );
};

export default Scanner;
