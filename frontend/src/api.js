import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").trim();
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
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${listingType} listings:`, error);
    throw error;
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

export const getEvidenceRecords = async () => {
  try {
    const response = await api.get("/evidence");
    return response.data;
  } catch (error) {
    console.error("Error fetching evidence records:", error);
    throw error;
  }
};

export { api };
