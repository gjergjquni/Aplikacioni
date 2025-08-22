// frontend/src/services/api.js

const API_URL = 'http://localhost:3000';

// A helper function to manage all API requests
async function fetchApi(path, options = {}) {
  // 1. Create a base headers object.
  const finalHeaders = {
    'Content-Type': 'application/json',
  };

  // 2. Manually add any extra headers passed in options.
  if (options.headers) {
    for (const key in options.headers) {
      finalHeaders[key] = options.headers[key];
    }
  }

  // --- NEW: Add the Authorization header if a token exists ---
  const token = localStorage.getItem('token');
  if (token) {
    // Your backend's AuthMiddleware will use this to identify the logged-in user
    finalHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  // 3. Create the final request configuration object.
  const fetchConfig = {};

  // 4. Manually add all properties from the 'options' object (like method, body).
  for (const key in options) {
    if (key !== 'headers') {
      fetchConfig[key] = options[key];
    }
  }

  // 5. Add our final, complete headers object to the configuration.
  fetchConfig.headers = finalHeaders;

  // 6. Make the final API call with the manually built configuration.
  const response = await fetch(`${API_URL}${path}`, fetchConfig);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error.message || 'An unknown error occurred');
  }

  return response.json();
}

// --- Authentication Functions ---

export const login = (email, password) => {
  return fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const register = (userData) => {
  return fetchApi('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

// --- NEW: Function to get dashboard data ---
/**
 * Fetches the main summary data for the home dashboard.
 * Requires a valid auth token.
 * @returns {Promise<object>} The dashboard data including balance, income, expenses, etc.
 */
export const getHomeDashboardData = () => {
  return fetchApi('/dashboard/home');
};