import axios from 'axios';

const API_BASE_URL = 'http://localhost:5117/api';

export const getCategories = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_BASE_URL}/categories`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getLocations = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_BASE_URL}/locations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createLostItem = async (itemData) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_BASE_URL}/items/lost`, itemData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createFoundItem = async (itemData) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_BASE_URL}/items/found`, itemData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const searchItems = async (filters = {}) => {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams();
  
  if (filters.type) params.append('Type', filters.type);
  if (filters.categoryId) params.append('CategoryId', filters.categoryId);
  if (filters.locationId) params.append('LocationId', filters.locationId);
  if (filters.status) params.append('Status', filters.status);
  if (filters.search) params.append('Search', filters.search);

  const response = await axios.get(`${API_BASE_URL}/items?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const confirmMatchPair = async (lostItemId, foundItemId) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${API_BASE_URL}/items/matches/confirm`,
    { lostItemId, foundItemId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// Update Status API (Matched / Claimed / Resolved)
export const updateItemStatus = async (itemId, status) => {
  const token = localStorage.getItem('token');
  const response = await axios.patch(
    `${API_BASE_URL}/items/${itemId}/status`,
    { status },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};