import { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on load
    const storedUser = localStorage.getItem('rural_uber_user');
    const token = localStorage.getItem('rural_uber_token');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem('rural_uber_user');
        localStorage.removeItem('rural_uber_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      // Backend returns { success: true, data: { token, user } }
      const { token, user: userData } = response.data.data;

      localStorage.setItem('rural_uber_user', JSON.stringify(userData));
      localStorage.setItem('rural_uber_token', token);

      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.error || "Login failed"
      };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const response = await authAPI.register(name, email, password, role);

      let userData = null;
      // If the backend returns a token immediately:
      if (response.data.data?.token) {
        const { token, user } = response.data.data;
        userData = user;
        localStorage.setItem('rural_uber_user', JSON.stringify(userData));
        localStorage.setItem('rural_uber_token', token);
        setUser(userData);
      }

      return { success: true, user: userData };
    } catch (error) {
      console.error("Registration failed:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.error || "Registration failed"
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('rural_uber_user');
    localStorage.removeItem('rural_uber_token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
