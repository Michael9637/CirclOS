import React, { useEffect, useState } from "react";
import { getListingsByType, getMatches, confirmMatch } from "../api";

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

  const getClassificationStyle = (classification) => {
    const base = {
      display: "inline-block",
      padding: "4px 10px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: 600,
      color: "#1f2933",
      textTransform: "uppercase",
      letterSpacing: "0.03em",
    };
    if (classification === "sekundaerrohstoff")
      return { ...base, backgroundColor: "#bbf7d0" };
    if (classification === "abfall")
      return { ...base, backgroundColor: "#fed7aa" };
    return { ...base, backgroundColor: "#e5e7eb" };
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

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#111827" }}>
          Active Waste Listings
        </h1>
        <p style={{ color: "#6b7280", marginTop: "8px" }}>Loading listings...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#111827" }}>
        Active Waste Listings
      </h1>
      <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>
        {listings.length > 0
          ? `${listings.length} listings available`
          : "No listings yet. Be the first!"}
      </p>

      {listings.map((listing) => {
        const { id, material_type, volume_kg_per_month, legal_classification, description, created_at } = listing;
        const formattedDate = created_at
          ? new Date(created_at).toLocaleDateString()
          : "";

        return (
          <div
            key={id}
            style={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "16px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#2d6a2d" }}>
              {material_type}
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "12px",
                fontSize: "14px",
                color: "#374151",
              }}
            >
              <span>{volume_kg_per_month} kg/month</span>
              {legal_classification && (
                <span style={getClassificationStyle(legal_classification)}>
                  {legal_classification}
                </span>
              )}
            </div>

            {description && (
              <p
                style={{
                  fontSize: "14px",
                  color: "#4b5563",
                  lineHeight: 1.5,
                }}
              >
                {truncate(description, 100)}
              </p>
            )}

            {formattedDate && (
              <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                Created on {formattedDate}
              </span>
            )}

            <button
              type="button"
              onClick={() => handleFindMatches(id)}
              disabled={Boolean(loadingMatch[id])}
              style={{
                background: "#2d6a2d",
                color: "white",
                padding: "8px 20px",
                border: "none",
                borderRadius: "4px",
                fontSize: "13px",
                marginTop: "12px",
                cursor: loadingMatch[id] ? "not-allowed" : "pointer",
                opacity: loadingMatch[id] ? 0.8 : 1,
                alignSelf: "flex-start",
              }}
            >
              {loadingMatch[id] ? "Searching..." : "Find Buyers"}
            </button>

            {Array.isArray(matches[id]) && matches[id].length === 0 && (
              <p
                style={{
                  color: "#777",
                  fontStyle: "italic",
                  marginTop: "8px",
                }}
              >
                No buyers found yet — more companies joining soon.
              </p>
            )}

            {matchErrors[id] && (
              <div
                style={{
                  marginTop: "10px",
                  padding: "10px",
                  borderRadius: "6px",
                  background: "#ffebee",
                  color: "#b71c1c",
                  fontSize: "13px",
                  lineHeight: 1.4,
                }}
              >
                Match lookup failed: {matchErrors[id]}
              </div>
            )}

            {Array.isArray(matches[id]) && matches[id].length > 0 && (
              <div style={{ marginTop: "12px" }}>
                <div
                  style={{
                    fontWeight: "bold",
                    color: "#1a3a1a",
                    fontSize: "13px",
                    marginBottom: "8px",
                  }}
                >
                  Matched Buyers (scored by AI):
                </div>

                {matches[id].map((match, index) => {
                  const ml = match?.listing || {};
                  const company = ml?.companies || {};
                  const percentage = (Number(match?.score || 0) * 100).toFixed(0);

                  return (
                    <div
                      key={`match-${index}`}
                      style={{
                        background: "#f0f7f0",
                        borderRadius: "6px",
                        padding: "12px 14px",
                        marginBottom: "8px",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: "bold",
                          color: "#1a3a1a",
                          fontSize: "16px",
                        }}
                      >
                        {company.name || "Unknown company"}
                      </div>

                      <div
                        style={{
                          fontSize: "13px",
                          color: "#555",
                          marginTop: "2px",
                        }}
                      >
                        {company.location || ""}
                        {company.sector ? ` · ${company.sector}` : ""}
                      </div>

                      {company.description && (
                        <p
                          style={{
                            fontSize: "13px",
                            color: "#444",
                            marginTop: "6px",
                            lineHeight: 1.4,
                          }}
                        >
                          AI compatibility: {percentage}%
                        </p>
                      )}

                      {company.max_volume_kg_per_month && (
                        <div
                          style={{
                            fontSize: "12px",
                            marginTop: "4px",
                          }}
                        >
                          Buys up to{" "}
                          {company.max_volume_kg_per_month.toLocaleString()} kg/month
                        </div>
                      )}

                      {company.accepted_classifications && (
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#666",
                            marginTop: "2px",
                          }}
                        >
                          Accepts: {company.accepted_classifications.join(", ")}
                        </div>
                      )}

                      <div
                        style={{
                          background: "#e0e0e0",
                          borderRadius: "4px",
                          height: "6px",
                          width: "100%",
                          marginTop: "10px",
                        }}
                      >
                        <div
                          style={{
                            background: "#4CAF50",
                            height: "100%",
                            borderRadius: "4px",
                            width: `${percentage}%`,
                          }}
                        />
                      </div>

                      <div
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          fontStyle: "italic",
                          marginTop: "4px",
                        }}
                      >
                        AI compatibility score: {percentage}%
                      </div>

                      <button
                        onClick={async () => {
                          try {
                            const result = await confirmMatch({
                              listing_id: id,
                              matched_listing_id: ml.id,
                              similarity_score: match.score,
                            });
                            alert(`Match confirmed!\n\n${result.certificate_text}`);
                          } catch (error) {
                            const detail = error?.response?.data?.detail;
                            const message = typeof detail === "string" ? detail : "Failed to confirm match.";
                            alert(`Failed to confirm match.\n\n${message}`);
                          }
                        }}
                        style={{
                          marginTop: "10px",
                          background: "#1a3a1a",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          padding: "6px 16px",
                          fontSize: "12px",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        Confirm Match — Generate Evidence Record
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Dashboard;