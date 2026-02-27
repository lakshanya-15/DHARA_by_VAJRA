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

  const login = async (phone, password) => {
    try {
      const response = await authAPI.login(phone, password);
      const { token, user: userData } = response.data.data;
      localStorage.setItem('rural_uber_user', JSON.stringify(userData));
      localStorage.setItem('rural_uber_token', token);
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || "Login failed" };
    }
  };

  const requestOTP = async (phone) => {
    try {
      const response = await authAPI.requestOTP(phone);
      return { success: true, message: response.data.data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || "Failed to send OTP" };
    }
  };

  const verifyOTP = async (phone, otp) => {
    try {
      const response = await authAPI.verifyOTP(phone, otp);
      const { token, user: userData } = response.data.data;
      localStorage.setItem('rural_uber_user', JSON.stringify(userData));
      localStorage.setItem('rural_uber_token', token);
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || "Invalid OTP" };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      let userDataOut = null;
      if (response.data.data?.token) {
        const { token, user } = response.data.data;
        userDataOut = user;
        localStorage.setItem('rural_uber_user', JSON.stringify(userDataOut));
        localStorage.setItem('rural_uber_token', token);
        setUser(userDataOut);
      }
      return { success: true, user: userDataOut };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || "Registration failed" };
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
    requestOTP,
    verifyOTP,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
