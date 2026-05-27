import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL 
    ? `${process.env.REACT_APP_API_URL}/api`
    : "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically inject JWT Bearer Token into headers
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;