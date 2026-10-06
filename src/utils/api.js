const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getAuthToken = () => {
  return localStorage.getItem('mediqueue_auth_token');
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('mediqueue_auth_token', token);
  } else {
    localStorage.removeItem('mediqueue_auth_token');
  }
};

export const getSavedUser = () => {
  try {
    const userStr = localStorage.getItem('mediqueue_auth_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

export const setSavedUser = (user) => {
  if (user) {
    localStorage.setItem('mediqueue_auth_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('mediqueue_auth_user');
  }
};

const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

/* Authentication APIs */
export const loginUser = async ({ email, password }) => {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    setAuthToken(data.token);
    setSavedUser(data.user);
    return data;
  } catch (err) {
    console.error('Login error:', err);
    throw err;
  }
};

export const registerUser = async ({ name, email, password, role = 'patient', doctorId = null }) => {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role, doctorId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    setAuthToken(data.token);
    setSavedUser(data.user);
    return data;
  } catch (err) {
    console.error('Registration error:', err);
    throw err;
  }
};

export const fetchCurrentUser = async () => {
  try {
    const token = getAuthToken();
    if (!token) return null;
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    });
    if (!res.ok) {
      setAuthToken(null);
      setSavedUser(null);
      return null;
    }
    const data = await res.json();
    setSavedUser(data.user);
    return data.user;
  } catch (err) {
    console.error('Fetch me error:', err);
    return null;
  }
};

export const logoutUser = () => {
  setAuthToken(null);
  setSavedUser(null);
};

/* Data APIs */
export const fetchBranches = async () => {
  try {
    const res = await fetch(`${API_BASE}/branches`, { headers: getHeaders() });
    return await res.json();
  } catch (err) {
    console.error('Error fetching branches:', err);
    return [];
  }
};

export const fetchDepartments = async () => {
  try {
    const res = await fetch(`${API_BASE}/departments`, { headers: getHeaders() });
    return await res.json();
  } catch (err) {
    console.error('Error fetching departments:', err);
    return [];
  }
};

export const fetchDoctors = async () => {
  try {
    const res = await fetch(`${API_BASE}/doctors`, { headers: getHeaders() });
    return await res.json();
  } catch (err) {
    console.error('Error fetching doctors:', err);
    return [];
  }
};

export const bookToken = async ({ doctorId, patientName, isEmergency }) => {
  try {
    const res = await fetch(`${API_BASE}/tokens/book`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ doctorId, patientName, isEmergency }),
    });
    return await res.json();
  } catch (err) {
    console.error('Error booking token:', err);
    return null;
  }
};

export const fetchTokenStatus = async (tokenNumber) => {
  try {
    const res = await fetch(`${API_BASE}/tokens/${tokenNumber}`, { headers: getHeaders() });
    return await res.json();
  } catch (err) {
    console.error('Error fetching token status:', err);
    return null;
  }
};

export const advanceQueue = async (doctorId) => {
  try {
    const res = await fetch(`${API_BASE}/doctors/${doctorId}/advance`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return await res.json();
  } catch (err) {
    console.error('Error advancing queue:', err);
    return null;
  }
};

export const kioskScanToken = async (tokenNumber) => {
  try {
    const res = await fetch(`${API_BASE}/tokens/${tokenNumber}/scan`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return await res.json();
  } catch (err) {
    console.error('Error scanning token at kiosk:', err);
    return null;
  }
};

export const fetchAllTokens = async ({ limit = 20, doctorName } = {}) => {
  try {
    let url = `${API_BASE}/tokens?limit=${limit}`;
    if (doctorName) url += `&doctorName=${encodeURIComponent(doctorName)}`;
    const res = await fetch(url, { headers: getHeaders() });
    return await res.json();
  } catch (err) {
    console.error('Error fetching tokens list:', err);
    return [];
  }
};

export const fetchStats = async () => {
  try {
    const res = await fetch(`${API_BASE}/stats`, { headers: getHeaders() });
    return await res.json();
  } catch (err) {
    console.error('Error fetching stats:', err);
    return null;
  }
};

export const checkApiHealth = async () => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
};
