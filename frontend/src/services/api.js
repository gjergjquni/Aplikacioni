// frontend/src/services/api.js

const API_URL = 'http://localhost:3000';

/**
 * A centralized helper function to manage all API requests.
 * It automatically handles JSON content type, adds the authorization token if it exists,
 * and standardizes error handling.
 * @param {string} path - The API endpoint path (e.g., '/auth/login').
 * @param {object} options - The standard `fetch` options object (method, body, etc.).
 * @returns {Promise<object>} The JSON response from the server.
 * @throws {Error} Throws an error with the message from the server if the request fails.
 */
async function fetchApi(path, options = {}) {
  const finalHeaders = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    for (const key in options.headers) {
      finalHeaders[key] = options.headers[key];
    }
  }

  const token = localStorage.getItem('token');
  if (token) {
    finalHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  const fetchConfig = {};

  for (const key in options) {
    if (key !== 'headers') {
      fetchConfig[key] = options[key];
    }
  }

  fetchConfig.headers = finalHeaders;

  const response = await fetch(`${API_URL}${path}`, fetchConfig);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error.message || 'An unknown error occurred');
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  } else {
    return {}; // Return an empty object for non-JSON responses (like DELETE)
  }
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

// --- Dashboard Functions ---

/**
 * Fetches the main summary data for the home dashboard.
 * Requires a valid auth token.
 * @returns {Promise<object>} The dashboard data including balance, income, expenses, etc.
 */
export const getHomeDashboardData = () => {
  return fetchApi('/dashboard/home');
};

// --- Transactions Functions ---

/**
 * Fetches a list of all transactions for the logged-in user.
 * @param {object} filters - Optional filters for the transaction query.
 * @returns {Promise<object>} An object containing the list of transactions and a summary.
 */
export const getTransactions = (filters = {}) => {
    return fetchApi('/transaction/list');
};
  
/**
 * Creates a new transaction for the logged-in user.
 * @param {object} transactionData - The details of the new transaction.
 * @returns {Promise<object>} The server's confirmation response.
 */
export const createTransaction = (transactionData) => {
    return fetchApi('/transaction/create', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
};

/**
 * Updates an existing transaction.
 * @param {string} transactionId - The ID of the transaction to update.
 * @param {object} transactionData - The new data for the transaction.
 * @returns {Promise<object>} The server's confirmation response.
 */
export const updateTransaction = (transactionId, transactionData) => {
    return fetchApi(`/transaction/update/${transactionId}`, {
      method: 'PUT',
      body: JSON.stringify(transactionData),
    });
};
  
/**
 * Deletes a transaction.
 * @param {string} transactionId - The ID of the transaction to delete.
 * @returns {Promise<object>} The server's confirmation response.
 */
export const deleteTransaction = (transactionId) => {
    return fetchApi(`/transaction/delete/${transactionId}`, {
      method: 'DELETE',
    });
};

// --- Goals Functions ---

/**
 * Fetches all financial goals for the logged-in user.
 * @returns {Promise<object>} An object containing the list of goals.
 */
export const getGoals = () => {
    return fetchApi('/goal/list');
};
  
/**
 * Creates a new financial goal for the logged-in user.
 * @param {object} goalData - The details of the new goal.
 * @returns {Promise<object>} The server's confirmation response.
 */
export const createGoal = (goalData) => {
    return fetchApi('/goal/create', {
      method: 'POST',
      body: JSON.stringify(goalData),
    });
};
  
/**
 * Updates an existing financial goal.
 * @param {string} goalId - The ID of the goal to update.
 * @param {object} goalData - The new data for the goal.
 * @returns {Promise<object>} The server's confirmation response.
 */
export const updateGoal = (goalId, goalData) => {
    return fetchApi(`/goal/update/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(goalData),
    });
};
  
/**
 * Deletes a financial goal.
 * @param {string} goalId - The ID of the goal to delete.
 * @returns {Promise<object>} The server's confirmation response.
 */
export const deleteGoal = (goalId) => {
    return fetchApi(`/goal/delete/${goalId}`, {
      method: 'DELETE',
    });
};

// --- Settings / User Profile Functions ---

/**
 * Fetches the complete profile for the logged-in user.
 * @returns {Promise<object>} An object containing the user's profile data.
 */
export const getProfile = () => {
    return fetchApi('/user/profile');
};
  
/**
 * Updates the profile information for the logged-in user.
 * @param {object} profileData - The profile data to update (e.g., { fullName, employmentStatus, jobTitle }).
 * @returns {Promise<object>} The server's confirmation response.
 */
export const updateProfile = (profileData) => {
    return fetchApi('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
};
  
/**
 * Changes the password for the logged-in user.
 * @param {object} passwordData - Contains { currentPassword, newPassword, confirmPassword }.
 * @returns {Promise<object>} The server's confirmation response.
 */
export const changePassword = (passwordData) => {
    return fetchApi('/user/password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
};

export const getSettings = () => fetchApi('/settings/notifications');

export const updateSettings = (data) => fetchApi('/settings/notifications', { method: 'PUT', body: JSON.stringify(data) });

/**
 * Permanently deletes the logged-in user's account and all associated data.
 * @returns {Promise<object>} The server's confirmation response.
 */
export const deleteAccount = () => {
  return fetchApi('/settings/delete-account', {
    method: 'DELETE',
  });
};

// --- AI Chat Functions ---

/**
 * Starts a new AI chat conversation session.
 * @param {string} topic - The initial topic for the chat.
 * @returns {Promise<object>} An object containing the new conversationId.
 */
export const startAIChat = (topic = 'General') => {
  return fetchApi('/ai-chat/start', {
      method: 'POST',
      body: JSON.stringify({ topic }),
  });
};

/**
* Sends a message to an ongoing AI chat conversation.
* @param {string} conversationId - The ID of the current conversation.
* @param {string} message - The user's message text.
* @returns {Promise<object>} An object containing the AI's response.
*/
export const sendMessageToAI = (conversationId, message) => {
  return fetchApi('/ai-chat/message', {
    method: 'POST',
    body: JSON.stringify({ conversationId, message }),
  });
};

// --- Password Reset Functions ---

export const forgotPassword = (email) => {
  return fetchApi('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

export const resetPassword = (data) => {
  return fetchApi('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};