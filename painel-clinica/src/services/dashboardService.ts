import api from "../api";

// Endpoint correto com prefixo já incluído via config.ts -> baseURL
const ENDPOINT = "/dashboard";

export const getDashboardStats = async () => {
  const response = await api.get(ENDPOINT);
  return response.data;
};