import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getListingsByType, getMatches, confirmMatch } from "../api";
import styles from "./ToolSuite.module.css";

const classificationToClassName = {
  sekundaerrohstoff: styles.badgeSuccess,
  abfall: styles.badgeWarning,
};

const Dashboard = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState({});
  const [loadingMatch, setLoadingMatch] = useState({});
  const [matchErrors, setMatchErrors] = useState({});

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await getListingsByType("seller");
        setListings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch listings:", error);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const truncate = (text, maxLength) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const getClassificationClassName = (classification) => {
    return `${styles.badge} ${classificationToClassName[classification] || styles.badgeNeutral}`;
  };

  const handleFindMatches = async (listingId) => {
    setLoadingMatch((prev) => ({ ...prev, [listingId]: true }));
    setMatchErrors((prev) => ({ ...prev, [listingId]: "" }));

    try {
      const result = await getMatches(listingId);
      const matchList = Array.isArray(result?.matches) ? result.matches : [];
      setMatches((prev) => ({ ...prev, [listingId]: matchList }));
    } catch (error) {
      console.error(`Failed to fetch matches for listing ${listingId}:`, error);
      const detail = error?.response?.data?.detail;
      setMatchErrors((prev) => ({
        ...prev,
        [listingId]: typeof detail === "string" ? detail : "Could not fetch matches right now.",
      }));
    } finally {
      setLoadingMatch((prev) => ({ ...prev, [listingId]: false }));
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <p className={styles.kicker}>Marketplace</p>
        <h1 className={styles.title}>Active Waste Listings</h1>
        <p className={styles.subtitle}>
          Review active supply, run AI matching, and confirm exchanges to generate evidence records.
        </p>
      </div>

      {loading ? <div className={`${styles.notice} ${styles.noticeMuted}`}>Loading listings...</div> : null}

      {!loading && listings.length === 0 ? (
        <div className={`${styles.notice} ${styles.noticeMuted}`}>
          No listings yet. Create your first listing from <Link to="/app/list">Waste</Link>.
        </div>
      ) : null}

      <div className={styles.stack}>
        {listings.map((listing) => {
          const { id, material_type, volume_kg_per_month, legal_classification, description, created_at } = listing;
          const formattedDate = created_at ? new Date(created_at).toLocaleDateString() : "";

          return (
            <article key={id} className={styles.card}>
              <div className={styles.cardHeaderRow}>
                <h2 className={styles.cardTitle}>{material_type || "Material listing"}</h2>
                {legal_classification ? (
                  <span className={getClassificationClassName(legal_classification)}>{legal_classification}</span>
                ) : null}
              </div>

              <div className={styles.metaRow}>
                <span>{Number(volume_kg_per_month || 0).toLocaleString()} kg/month</span>
                {formattedDate ? <span>Created on {formattedDate}</span> : null}
              </div>

              {description ? <p className={styles.bodyText}>{truncate(description, 130)}</p> : null}

              <div className={styles.inlineActions}>
                <button
                  type="button"
                  onClick={() => handleFindMatches(id)}
                  disabled={Boolean(loadingMatch[id])}
                  className={`${styles.button} ${styles.buttonPrimary}`}
                >
                  {loadingMatch[id] ? "Searching..." : "Find Buyers"}
                </button>
              </div>

              {Array.isArray(matches[id]) && matches[id].length === 0 ? (
                <div className={`${styles.notice} ${styles.noticeMuted}`}>No buyers found yet. More companies are joining.</div>
              ) : null}

              {matchErrors[id] ? (
                <div className={`${styles.notice} ${styles.noticeError}`}>Match lookup failed: {matchErrors[id]}</div>
              ) : null}

              {Array.isArray(matches[id]) && matches[id].length > 0 ? (
                <div className={styles.subSection}>
                  <p className={styles.subTitle}>Matched buyers (scored by AI)</p>

                  {matches[id].map((match, index) => {
                    const matchedListing = match?.listing || {};
                    const company = matchedListing?.companies || {};
                    const percentage = Number((Number(match?.score || 0) * 100).toFixed(0));

                    return (
                      <div key={`match-${index}`} className={styles.subCard}>
                        <h3 className={styles.cardTitle}>{company.name || "Unknown company"}</h3>

                        <div className={styles.metaRow}>
                          <span>{company.location || "Location unavailable"}</span>
                          {company.sector ? <span>{company.sector}</span> : null}
                        </div>

                        {company.description ? <p className={styles.bodyText}>{company.description}</p> : null}

                        {company.max_volume_kg_per_month ? (
                          <p className={styles.bodyText}>
                            Buys up to {Number(company.max_volume_kg_per_month).toLocaleString()} kg/month.
                          </p>
                        ) : null}

                        {Array.isArray(company.accepted_classifications) && company.accepted_classifications.length > 0 ? (
                          <p className={styles.bodyText}>Accepts: {company.accepted_classifications.join(", ")}</p>
                        ) : null}

                        <div className={styles.progressTrack}>
                          <div className={styles.progressFill} style={{ width: `${percentage}%` }} />
                        </div>
                        <p className={styles.bodyText}>AI compatibility score: {percentage}%</p>

                        <div className={styles.inlineActions}>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const result = await confirmMatch({
                                  listing_id: id,
                                  matched_listing_id: matchedListing.id,
                                  similarity_score: match.score,
                                });
                                alert(`Match confirmed!\n\n${result.certificate_text}`);
                              } catch (error) {
                                const detail = error?.response?.data?.detail;
                                const message =
                                  typeof detail === "string"
                                    ? detail
                                    : detail
                                      ? JSON.stringify(detail)
                                      : "Please try again.";
                                alert(`Failed to confirm match.\n\n${message}`);
                              }
                            }}
                            className={`${styles.button} ${styles.buttonGhost}`}
                          >
                            Confirm Match and Generate Evidence
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;