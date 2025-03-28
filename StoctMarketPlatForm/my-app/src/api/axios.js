import axios from "axios";
import { API_BASE_URL, AUTH_CREDENTIALS } from "../constants/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Basic ${AUTH_CREDENTIALS}`,
  },
});

const getErrorMessage = (error) => {
  switch (error.response?.status) {
    case 401:
      return "Unauthorized - Please check your credentials";
    case 403:
      return "Forbidden - You do not have permission to perform this action";
    case 404:
      return "Resource not found";
    case 405:
      return "This operation is not supported";
    case 500:
      return "Server error - Please try again later";
    default:
      return error.message || "An unexpected error occurred";
  }
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", {
      status: error.response?.status,
      message: getErrorMessage(error),
      details: error,
    });
    error.userMessage = getErrorMessage(error);
    return Promise.reject(error);
  }
);

export default api;
