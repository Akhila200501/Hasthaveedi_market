//frontend/services/api.js

const API_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000'; // backend URL

export const authFetch = async (url, options = {}) => {
  // Get token or redirect to login
  const token = localStorage.getItem('token');
  if (!token) {
    if (window.location.pathname !== '/auth' && window.location.pathname !== '/') {
      window.location.href = '/auth';
    }
    return { ok: false, status: 401, json: () => Promise.resolve({ error: 'Unauthorized' }) };
  }

  // Set auth header
  options.headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };

  let response = await fetch(`${API_URL}${url}`, options);

  // If token expired, try to refresh
  if (response.status === 401) {
    try {
      const newToken = await refreshToken();
      options.headers.Authorization = `Bearer ${newToken}`;
      response = await fetch(`${API_URL}${url}`, options);
    } catch (error) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('loggedIn');
      if (window.location.pathname !== '/auth' && window.location.pathname !== '/') {
        window.location.href = '/auth';
      }
      throw error;
    }
  }

  return response;
};

// Register user
export const register = async (userData) => {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Registration failed.');
    return data;
  } catch (error) {
    throw new Error(error.message || 'Error during registration.');
  }
};


export const resendVerification = async (data) => {
  try {
    const res = await fetch(`${API_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || result.message || 'Failed to resend verification.');
    return result;
  } catch (error) {
    throw new Error(error.message || 'Error resending verification.');
  }
};

// Login user
export const login = async (credentials) => {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed.');

    // Store both in localStorage and sessionStorage for consistency
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('user', JSON.stringify(data));

    sessionStorage.setItem('loggedIn', 'true');

    return data;
  } catch (error) {
    throw new Error(error.message || 'Error during login.');
  }
};
export const refreshToken = async () => {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include' // For http-only cookies if using them
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Token refresh failed');

    localStorage.setItem('token', data.token);
    return data.token;
  } catch (error) {
    // Redirect to login if refresh fails
    localStorage.removeItem('token');
    sessionStorage.removeItem('loggedIn');
    if (window.location.pathname !== '/auth' && window.location.pathname !== '/') {
      window.location.href = '/auth';
    }
    throw error;
  }
};
export const askGemini = async (prompt) => {
  const response = await fetch(`${API_URL}/api/gemini/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  return response.json();
};