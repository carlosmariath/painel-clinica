import api from "../api";

const ENDPOINT = "/dashboard";

export const getDashboardStats = async () => {
  const response = await api.get(ENDPOINT);
  return response.data;
};