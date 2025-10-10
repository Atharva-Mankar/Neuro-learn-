// ✅ Correct API URL - must match your backend terminal output
const API_URL = "http://127.0.0.1:8000"; // ensure this matches backend

const handleResponse = async (response) => {
  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || JSON.stringify(errorData);
    } catch (e) {
      // The response was not JSON, which can happen with CORS errors or server misconfigurations
      errorDetail = `Request failed with status ${response.status}. Could not parse error response.`;
    }
    throw new Error(errorDetail);
  }
  return response.json();
};

export const api = {
  // ---------- Register ----------
  register: async (userData) => {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  // ---------- Login ----------
  login: async (userData) => {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  // ---------- Current User ----------
  getCurrentUser: async (token) => {
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return await handleResponse(response);
    } catch (err) {
      console.error("Get Current User API Error:", err);
      throw err;
    }
  },
};
