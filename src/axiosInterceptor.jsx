import axios from 'axios';
import Cookies from 'js-cookie';

// Flag to prevent further requests after logout
let isLoggedOut = false;

// Request interceptor to add JWT token to headers
axios.interceptors.request.use(
  (config) => {
    const token = Cookies.get('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('[Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors (token expiration)
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401 && !isLoggedOut) {
      isLoggedOut = true; // Prevent further requests
      await handleLogout();
    }
    return Promise.reject(error);
  }
);

// Logout function
const handleLogout = async () => {
  try {
    await axios.post(`https://api.akbsproduction.com/logout`);
    // Remove cookies and local storage data
    Cookies.remove("jwt");
    localStorage.removeItem("role");
    localStorage.removeItem("uid");

    // Redirect to login page only if not already redirected
    if (window.location.pathname !== "/userlogin") {
      window.location.href = "/userlogin";
    }
  } catch (error) {
    console.error("Logout error:", error);
    isLoggedOut = false; 
  }
};

export default axios;