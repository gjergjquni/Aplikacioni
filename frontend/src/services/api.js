// frontend/src/services/api.js

const API_URL = 'http://localhost:3000';

// A helper function to manage all API requests
async function fetchApi(path, options = {}) {
  // 1. Create a base headers object.
  // This object will always contain the 'Content-Type'.
  const finalHeaders = {
    'Content-Type': 'application/json',
  };

  // 2. Manually add any extra headers.
  // If the 'options' object passed into this function has a 'headers' property...
  if (options.headers) {
    // ...loop through each key in that headers object (e.g., 'X-Custom-Header')...
    for (const key in options.headers) {
      // ...and add it to our finalHeaders object.
      finalHeaders[key] = options.headers[key];
    }
  }

  // 3. Create the final request configuration object.
  const fetchConfig = {};

  // 4. Manually add all properties from the 'options' object.
  // Loop through each key in the 'options' object (e.g., 'method', 'body')...
  for (const key in options) {
    // ...and add it to our final configuration, EXCEPT for 'headers'
    // because we have already handled them.
    if (key !== 'headers') {
      fetchConfig[key] = options[key];
    }
  }

  // 5. Add our final, complete headers object to the configuration.
  fetchConfig.headers = finalHeaders;


  // 6. Make the final API call with the manually built configuration.
  const response = await fetch(`${API_URL}${path}`, fetchConfig);


  // The rest of the function remains the same.
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