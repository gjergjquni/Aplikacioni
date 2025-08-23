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


// --- NEW: TRANSACTIONS FUNCTIONS ---

/**
 * Fetches a list of all transactions for the logged-in user.
 * It can also accept filters in the future.
 * @returns {Promise<object>} An object containing the list of transactions.
 */
export const getTransactions = (filters = {}) => {
    // We can build a query string for filters later if needed
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

// --- NEW: GOALS FUNCTIONS ---

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


// --- NEW: SETTINGS / USER PROFILE FUNCTIONS ---

/**
 * Fetches the complete profile for the logged-in user.
 * @returns {Promise<object>} An object containing the user's profile data.
 */
export const getProfile = () => {
    return fetchApi('/user/profile');
  };
  
  /**
   * Updates the profile information for the logged-in user.
   * @param {object} profileData - The profile data to update (e.g., { fullName, status, profession }).
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

  export const getSettings = () => fetchApi('/settings/notifications'); // Endpoint for preferences and notifications

  export const updateSettings = (data) => fetchApi('/settings/notifications', { method: 'PUT', body: JSON.stringify(data) });

  // --- NEW: AI CHAT FUNCTIONS ---

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

