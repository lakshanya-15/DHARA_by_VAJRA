import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rural_uber_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (phone, password) => api.post('/auth/login', { phone, password }),
  requestOTP: (phone) => api.post('/auth/request-otp', { phone }),
  verifyOTP: (phone, otp) => api.post('/auth/verify-otp', { phone, otp }),
  register: (userData) => api.post('/auth/register', userData),
  me: () => api.get('/auth/me'),
};

export const assetsAPI = {
  getAll: (params) => api.get('/assets', { params }),
  create: (assetData) => api.post('/assets', assetData),
  getById: (id) => api.get(`/assets/${id}`),
  update: (id, data) => api.patch(`/assets/${id}`, data),
  delete: (id) => api.delete(`/assets/${id}`),
};

export const bookingsAPI = {
  create: (bookingData) => api.post('/bookings', bookingData),
  getMyBookings: () => api.get('/bookings/my'),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
};

export const walletAPI = {
  getMy: () => api.get('/wallet/my'),
  deposit: (amount) => api.post('/wallet/deposit', { amount }),
};

export const reviewsAPI = {
  create: (reviewData) => api.post('/reviews', reviewData),
  getForOperator: (operatorId) => api.get(`/reviews/operator/${operatorId}`),
};

export const disputesAPI = {
  create: (disputeData) => api.post('/disputes', disputeData),
};

export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
};

export const maintenanceAPI = {
  list: (params) => api.get('/maintenance', { params }),
  create: (data) => api.post('/maintenance', data),
  delete: (id) => api.delete(`/maintenance/${id}`),
};

export default api;
