import React, { useEffect, useState } from "react";
import { getEvidenceRecords } from "../api";

const EvidenceRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvidence = async () => {
      try {
        const data = await getEvidenceRecords();
        setRecords(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch evidence records:", error);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvidence();
  }, []);

  if (loading) {
    return <p style={{ color: "#6b7280" }}>Loading evidence records...</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#111827" }}>
        Evidence Timeline
      </h1>
      <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "10px" }}>
        Confirmed circular transactions with timestamped evidence records.
      </p>

      {records.length === 0 && (
        <div
          style={{
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "18px",
            color: "#4b5563",
          }}
        >
          No evidence records yet. Confirm a match on the dashboard to generate your first record.
        </div>
      )}

      {records.map((record) => (
        <div
          key={record.id}
          style={{
            background: "#ffffff",
            borderRadius: "8px",
            padding: "16px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            borderLeft: "5px solid #1a3a1a",
          }}
        >
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            Confirmed at {record.confirmed_at ? new Date(record.confirmed_at).toLocaleString() : "unknown"}
          </div>
          <div style={{ marginTop: "8px", fontSize: "18px", fontWeight: 700, color: "#1f2937" }}>
            {record.material_type || "Material not specified"}
          </div>
          <div style={{ marginTop: "6px", fontSize: "14px", color: "#374151" }}>
            Volume: {record.volume_kg || 0} kg
          </div>
          <div style={{ marginTop: "4px", fontSize: "14px", color: "#374151" }}>
            AWG classification: {record.awg_classification || "n/a"}
          </div>
          <div
            style={{
              marginTop: "10px",
              background: "#f3f4f6",
              borderRadius: "6px",
              padding: "10px",
              fontSize: "13px",
              color: "#374151",
            }}
          >
            {record.certificate_text || "No certificate text available."}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EvidenceRecords;
