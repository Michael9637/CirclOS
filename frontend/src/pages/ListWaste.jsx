import React, { useState } from "react";
import { createListing } from "../api";
import { useAuth } from "../components/useAuth";

const ListWaste = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    listing_type: "seller",
    material_type: "",
    volume_kg_per_month: "",
    legal_classification: "sekundaerrohstoff",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    if (!user?.id) {
      setErrorMessage("You must be signed in to create listings.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        user_id: user.id,
        volume_kg_per_month: formData.volume_kg_per_month
          ? Number(formData.volume_kg_per_month)
          : 0,
      };

      await createListing(payload);
      setSuccessMessage("Waste stream listed successfully.");
      setFormData({
        listing_type: "seller",
        material_type: "",
        volume_kg_per_month: "",
        legal_classification: "sekundaerrohstoff",
        description: "",
      });
    } catch {
      setErrorMessage(
        "Something went wrong while listing your waste stream. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const pageStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  };

  const titleStyle = {
    fontSize: "28px",
    fontWeight: 700,
    marginBottom: "4px",
    color: "#111827",
    textAlign: "center",
  };

  const subtitleStyle = {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "24px",
    textAlign: "center",
  };

  const formContainerStyle = {
    backgroundColor: "#ffffff",
    maxWidth: "600px",
    margin: "0 auto",
    padding: "32px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  };

  const fieldStyle = {
    marginBottom: "20px",
  };

  const labelStyle = {
    display: "block",
    fontWeight: "bold",
    marginBottom: "6px",
    fontSize: "14px",
    color: "#374151",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    boxSizing: "border-box",
  };

  const textareaStyle = {
    ...inputStyle,
    resize: "vertical",
  };

  const buttonStyle = {
    backgroundColor: "#2d6a2d",
    color: "#ffffff",
    padding: "12px 32px",
    border: "none",
    borderRadius: "4px",
    cursor: loading ? "default" : "pointer",
    fontSize: "16px",
  };

  const successStyle = {
    marginTop: "16px",
    padding: "12px",
    borderRadius: "4px",
    backgroundColor: "#e8f5e9",
    color: "#1b5e20",
    fontSize: "14px",
  };

  const errorStyle = {
    marginTop: "16px",
    padding: "12px",
    borderRadius: "4px",
    backgroundColor: "#ffebee",
    color: "#b71c1c",
    fontSize: "14px",
  };

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>List a Waste Stream</h1>
      <p style={subtitleStyle}>
        List your industrial byproducts and get matched with licensed buyers
        and recyclers
      </p>

      <div style={formContainerStyle}>
        <form onSubmit={handleSubmit}>
          <div style={fieldStyle}>
            <label htmlFor="listing_type" style={labelStyle}>
              I am a...
            </label>
            <select
              id="listing_type"
              name="listing_type"
              value={formData.listing_type}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="seller">Seller - I have waste to offer</option>
              <option value="buyer">Buyer - I am looking for material</option>
            </select>
          </div>

          <div style={fieldStyle}>
            <label htmlFor="material_type" style={labelStyle}>
              Material Type
            </label>
            <input
              id="material_type"
              name="material_type"
              type="text"
              placeholder="e.g. Holzspäne, Kunststoffabfälle, Metallspäne"
              value={formData.material_type}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>

          <div style={fieldStyle}>
            <label htmlFor="volume_kg_per_month" style={labelStyle}>
              Monthly Volume (kg)
            </label>
            <input
              id="volume_kg_per_month"
              name="volume_kg_per_month"
              type="number"
              min="0"
              value={formData.volume_kg_per_month}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>

          <div style={fieldStyle}>
            <label htmlFor="legal_classification" style={labelStyle}>
              Legal Classification
            </label>
            <select
              id="legal_classification"
              name="legal_classification"
              value={formData.legal_classification}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="sekundaerrohstoff">
                Sekundärrohstoff (free trade)
              </option>
              <option value="abfall">
                Abfall (licensed buyer required)
              </option>
            </select>
          </div>

          <div style={fieldStyle}>
            <label htmlFor="description" style={labelStyle}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Describe the material, condition, availability"
              value={formData.description}
              onChange={handleChange}
              style={textareaStyle}
            />
          </div>

          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? "Submitting..." : "List Waste Stream"}
          </button>
        </form>

        {successMessage && <div style={successStyle}>{successMessage}</div>}
        {errorMessage && <div style={errorStyle}>{errorMessage}</div>}
      </div>
    </div>
  );
};

export default ListWaste;

