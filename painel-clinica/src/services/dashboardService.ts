import axios from "axios";

const API_URL = "http://localhost:3000/dashboard";

export const getDashboardStats = async () => {
  const token = localStorage.getItem("access_token");

  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};