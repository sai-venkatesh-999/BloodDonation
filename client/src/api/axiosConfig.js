import axios from 'axios';
import { toast } from 'react-toastify';

// Create a new Axios instance with a base URL
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://blood-donation-management-2805.onrender.com/api"  || "http://localhost:5173/api", // for Vite
});

// --- RESPONSE INTERCEPTOR ---
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        toast.error("Your session has expired. Please log in again.");

        localStorage.removeItem('token');
        localStorage.removeItem('user');

        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
    }
    return Promise.reject(error);
  }
);

// --- REQUEST INTERCEPTOR ---
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;


