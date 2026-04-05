import React, { useState } from "react";
import { scanWebsite } from "../api";
import { useAuth } from "../components/useAuth";

const Scanner = () => {
  const { user } = useAuth();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

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
    } catch {
      setError("Scan failed. Check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status) => {
    if (status === "prohibited") return "#fdecea";
    if (status === "needs_evidence") return "#fff8e1";
    return "#e8f5e9";
  };

  const statusLabel = (status) => {
    if (status === "prohibited") return { text: "PROHIBITED", color: "#c62828" };
    if (status === "needs_evidence") return { text: "NEEDS EVIDENCE", color: "#e65100" };
    return { text: "COMPLIANT", color: "#2e7d32" };
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "16px 0" }}>
      <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#1a3a1a", marginBottom: "8px" }}>
        ECGT Compliance Scanner
      </h1>
      <p style={{ color: "#555", marginBottom: "20px", fontSize: "15px" }}>
        Enter your company website URL. CirclOS scans for green claims and classifies them against EU ECGT Directive 2024/825.
      </p>

      <form onSubmit={handleScan} style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.yourcompany.at"
          required
          style={{ flex: 1, padding: "12px 16px", fontSize: "15px", border: "1px solid #ddd", borderRadius: "4px" }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            background: loading ? "#aaa" : "#1a3a1a",
            color: "white",
            padding: "12px 24px",
            border: "none",
            borderRadius: "4px",
            fontSize: "15px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {loading ? "Scanning..." : "Scan Website"}
        </button>
      </form>

      {error && (
        <div style={{ padding: "16px", background: "#fdecea", borderRadius: "6px", color: "#c62828", marginBottom: "24px" }}>
          {error}
        </div>
      )}

      {result && (
        <div>
          <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
            {[
              { value: result.total_claims_found, label: "Claims found", bg: "#fff", color: "#1a3a1a" },
              { value: result.prohibited_count, label: "Prohibited", bg: "#fdecea", color: "#c62828" },
              { value: result.needs_evidence_count, label: "Need evidence", bg: "#fff8e1", color: "#e65100" },
            ].map(({ value, label, bg, color }) => (
              <div
                key={label}
                style={{
                  background: bg,
                  borderRadius: "8px",
                  padding: "16px 24px",
                  flex: 1,
                  minWidth: "140px",
                  textAlign: "center",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
                }}
              >
                <div style={{ fontSize: "32px", fontWeight: 700, color }}>{value}</div>
                <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>{label}</div>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1a3a1a", marginBottom: "16px" }}>
            Detailed Claim Analysis
          </h2>

          {result.claims.map((claim, index) => {
            const label = statusLabel(claim.status);
            return (
              <div
                key={index}
                style={{
                  background: statusColor(claim.status),
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "12px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                  <p style={{ fontSize: "14px", color: "#222", lineHeight: 1.5, margin: 0, flex: 1, fontStyle: "italic" }}>
                    "{claim.text}"
                  </p>
                  <span
                    style={{
                      background: label.color,
                      color: "white",
                      padding: "3px 10px",
                      borderRadius: "999px",
                      fontSize: "11px",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {label.text}
                  </span>
                </div>
                <div
                  style={{
                    marginTop: "10px",
                    padding: "10px",
                    background: "rgba(255,255,255,0.6)",
                    borderRadius: "4px",
                    fontSize: "13px",
                    color: "#444",
                    lineHeight: 1.5,
                  }}
                >
                  {claim.ecgt_risk}
                </div>
                <div style={{ marginTop: "6px", fontSize: "12px", color: "#666" }}>
                  Keywords: {claim.keywords_found.join(", ")}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Scanner;
