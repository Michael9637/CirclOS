import React, { useState } from "react";
import { createListing } from "../api";
import { useAuth } from "../components/useAuth";
import styles from "./ToolSuite.module.css";

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

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <p className={styles.kicker}>Waste Exchange</p>
        <h1 className={styles.title}>List a Waste Stream</h1>
        <p className={styles.subtitle}>
          Publish industrial byproducts, attract qualified buyers, and feed your compliance evidence timeline.
        </p>
      </div>

      <section className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label htmlFor="listing_type" className={styles.label}>
                I am a...
              </label>
              <select
                id="listing_type"
                name="listing_type"
                value={formData.listing_type}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="seller">Seller - I have waste to offer</option>
                <option value="buyer">Buyer - I am looking for material</option>
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="material_type" className={styles.label}>
                Material Type
              </label>
              <input
                id="material_type"
                name="material_type"
                type="text"
                placeholder="e.g. Holzspane, Kunststoffabfalle, Metallspane"
                value={formData.material_type}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="volume_kg_per_month" className={styles.label}>
                Monthly Volume (kg)
              </label>
              <input
                id="volume_kg_per_month"
                name="volume_kg_per_month"
                type="number"
                min="0"
                value={formData.volume_kg_per_month}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="legal_classification" className={styles.label}>
                Legal Classification
              </label>
              <select
                id="legal_classification"
                name="legal_classification"
                value={formData.legal_classification}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="sekundaerrohstoff">Sekundarrohstoff (free trade)</option>
                <option value="abfall">Abfall (licensed buyer required)</option>
              </select>
            </div>

            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label htmlFor="description" className={styles.label}>
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Describe the material, condition, and availability"
                value={formData.description}
                onChange={handleChange}
                className={styles.textarea}
              />
            </div>
          </div>

          <div className={styles.inlineActions}>
            <button
              type="submit"
              disabled={loading}
              className={`${styles.button} ${styles.buttonPrimary} ${loading ? styles.buttonDisabled : ""}`}
            >
              {loading ? "Submitting..." : "List Waste Stream"}
            </button>
          </div>

          {successMessage ? (
            <div className={`${styles.notice} ${styles.noticeSuccess}`}>{successMessage}</div>
          ) : null}

          {errorMessage ? (
            <div className={`${styles.notice} ${styles.noticeError}`}>{errorMessage}</div>
          ) : null}
        </form>
      </section>
    </div>
  );
};

export default ListWaste;

