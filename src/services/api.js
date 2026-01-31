import axios from "axios";
import { auth } from "../firebase";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
});

// 1. Helper: Wait for Firebase to initialize
const waitForAuth = () => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// 2. Interceptor: Before ANY request, get the token
api.interceptors.request.use(
  async (config) => {
    let currentUser = auth.currentUser;

    // If Firebase isn't ready yet, WAIT for it
    if (!currentUser) {
      currentUser = await waitForAuth();
    }

    if (currentUser) {
      const token = await currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`; // <--- ATTACH TOKEN
      console.log("✅ Token attached!");
    } else {
      console.log("❌ No User found. Sending without token.");
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
