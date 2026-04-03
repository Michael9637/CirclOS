import React, { useEffect, useState } from "react";
import { getListingsByType } from "../api";

const BuyerListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await getListingsByType("buyer");
        setListings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch buyer listings:", error);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  if (loading) {
    return <p style={{ color: "#6b7280" }}>Loading buyer listings...</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#111827" }}>
        Active Buyer Listings
      </h1>
      <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>
        {listings.length > 0
          ? `${listings.length} buyer listings available`
          : "No buyer listings yet."}
      </p>

      {listings.map((listing) => (
        <div
          key={listing.id}
          style={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#1a3a1a" }}>
            {listing.material_type}
          </div>
          <div style={{ marginTop: "6px", color: "#374151", fontSize: "14px" }}>
            Needs {listing.volume_kg_per_month} kg/month
          </div>
          <div style={{ marginTop: "4px", color: "#6b7280", fontSize: "13px" }}>
            Classification: {listing.legal_classification}
          </div>
          {listing.description && (
            <p style={{ marginTop: "8px", color: "#4b5563", fontSize: "14px" }}>
              {listing.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default BuyerListings;
