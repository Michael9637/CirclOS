import axios from "axios";

const rawApiUrl = (import.meta.env.VITE_API_URL || "").trim();

const normalizeApiBaseUrl = (value) => {
  if (!value) {
    return "";
  }

  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return withProtocol.replace(/\/+$/, "");
};

const API_BASE_URL = normalizeApiBaseUrl(rawApiUrl);
const isProd = import.meta.env.PROD;

export const apiConfigError = isProd && !API_BASE_URL
  ? "Missing VITE_API_URL in frontend production environment."
  : null;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const isMissingListingTypeColumnError = (error) => {
  const detail = error?.response?.data?.detail;
  if (typeof detail !== "string") {
    return false;
  }

  const normalized = detail.toLowerCase();
  return normalized.includes("listing_type") && normalized.includes("does not exist");
};

const hasListingTypeField = (listings) =>
  listings.some((listing) =>
    Object.prototype.hasOwnProperty.call(listing ?? {}, "listing_type")
  );

const coerceListingsByType = (listings, listingType) => {
  if (!listingType) {
    return listings;
  }

  if (!hasListingTypeField(listings)) {
    // Legacy schema had only seller-style listings and no listing_type column.
    return listingType === "seller" ? listings : [];
  }

  return listings.filter((listing) => listing?.listing_type === listingType);
};

api.interceptors.request.use((config) => {
  if (apiConfigError) {
    return Promise.reject(new Error(apiConfigError));
  }
  return config;
});

export const createCompany = async (data) => {
  try {
    const response = await api.post("/companies", data);
    return response.data;
  } catch (error) {
    console.error("Error creating company:", error);
    throw error;
  }
};

export const createListing = async (data) => {
  try {
    const response = await api.post("/listings", data);
    return response.data;
  } catch (error) {
    console.error("Error creating listing:", error);
    throw error;
  }
};

export const getListings = async () => {
  try {
    const response = await api.get("/listings");
    return response.data;
  } catch (error) {
    console.error("Error fetching listings:", error);
    throw error;
  }
};

export const getListingsByType = async (listingType) => {
  try {
    const response = await api.get("/listings", {
      params: { listing_type: listingType },
    });
    const listings = Array.isArray(response.data) ? response.data : [];
    return coerceListingsByType(listings, listingType);
  } catch (error) {
    if (!isMissingListingTypeColumnError(error)) {
      console.error(`Error fetching ${listingType} listings:`, error);
      throw error;
    }

    try {
      const fallbackResponse = await api.get("/listings");
      const fallbackListings = Array.isArray(fallbackResponse.data)
        ? fallbackResponse.data
        : [];
      return coerceListingsByType(fallbackListings, listingType);
    } catch (fallbackError) {
      console.error(`Error fetching fallback listings for ${listingType}:`, fallbackError);
      throw fallbackError;
    }
  }
};

export const getListing = async (id) => {
  try {
    const response = await api.get(`/listings/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching listing with id ${id}:`, error);
    throw error;
  }
};

export const getMatches = async (listingId) => {
  try {
    const response = await api.get(`/listings/${listingId}/matches`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching matches for listing ${listingId}:`, error);
    throw error;
  }
};

export const confirmMatch = async (matchData) => {
  try {
    const response = await api.post("/matches/confirm", matchData);
    return response.data;
  } catch (error) {
    console.error("Error confirming match:", error);
    throw error;
  }
};

export const scanWebsite = async (payload) => {
  try {
    const response = await api.post("/scan", payload);
    return response.data;
  } catch (error) {
    console.error("Error scanning website:", error);
    throw error;
  }
};

export const getEvidenceRecords = async (userId) => {
  if (!userId) {
    return [];
  }

  try {
    const response = await api.get("/evidence", {
      params: { user_id: userId },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching evidence records:", error);
    throw error;
  }
};

export { api };
