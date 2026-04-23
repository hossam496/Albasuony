import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    timeout: 15000,
});

let accessToken = null;

export const setAccessToken = (token) => {
    accessToken = token;
};

export const getAccessToken = () => accessToken;

// Request interceptor — attach token from memory
api.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle 401 & token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and not already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh the token
                const { data } = await axios.post(`${API_BASE}/auth/refresh-token`, {}, {
                    withCredentials: true
                });

                if (data.success) {
                    accessToken = data.accessToken;
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed — clear memory and notify app
                accessToken = null;
                window.dispatchEvent(new CustomEvent('auth:expired'));
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

// ─── Auth ───────────────────────────────────────────────────────────────────
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    refreshToken: () => api.post('/auth/refresh-token'),
    getMe: () => api.get('/auth/me'),
    updateMe: (data) => api.put('/auth/me', data),
    changePassword: (data) => api.put('/auth/change-password', data),
};

// ─── Products ────────────────────────────────────────────────────────────────
export const productAPI = {
    getAll: (params) => api.get('/products', { params }),
    getOne: (id) => api.get(`/products/${id}`),
    getCategories: () => api.get('/products/categories'),
    create: (formData) =>
        api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    update: (id, formData) =>
        api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    delete: (id) => api.delete(`/products/${id}`),
    addReview: (id, data) => api.post(`/products/${id}/reviews`, data),
    deleteImage: (id, publicId) => api.delete(`/products/${id}/images/${publicId}`),
};

// ─── Cart ────────────────────────────────────────────────────────────────────
export const cartAPI = {
    get: () => api.get('/cart'),
    add: (productId, quantity = 1) => api.post('/cart', { productId, quantity }),
    update: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
    remove: (itemId) => api.delete(`/cart/${itemId}`),
    clear: () => api.delete('/cart/clear'),
};

// ─── Orders ──────────────────────────────────────────────────────────────────
export const orderAPI = {
    place: (data) => api.post('/orders', data),
    getMyOrders: (params) => api.get('/orders/my', { params }),
    getOne: (id) => api.get(`/orders/${id}`),
    cancel: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
};

// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminAPI = {
    getDashboard: (range) => api.get('/admin/dashboard', { params: { range } }),
    // Users
    getUsers: (params) => api.get('/admin/users', { params }),
    getUser: (id) => api.get(`/admin/users/${id}`),
    updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    bulkUpdateUsers: (userIds, status) => api.put('/admin/users/bulk', { userIds, status }),
    // Orders
    getOrders: (params) => api.get('/admin/orders', { params }),
    updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
    deleteOrder: (id) => api.delete(`/admin/orders/${id}`),
};

// ─── Inventory ───────────────────────────────────────────────────────────────
export const inventoryAPI = {
    getStats: () => api.get('/inventory/stats'),
    getLogs: (params) => api.get('/inventory/logs', { params }),
    adjust: (data) => api.post('/inventory/adjust', data),
};

// ─── Settings ──────────────────────────────────────────────────────────────
export const settingsAPI = {
    get: () => api.get('/settings'),
    update: (settings) => api.post('/settings', { settings }),
    uploadImage: (formData) => api.post('/settings/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

// ─── Brands ──────────────────────────────────────────────────────────────
export const brandAPI = {
    get: () => api.get('/brands'),
    getAll: () => api.get('/brands/all'),
    create: (data) => api.post('/brands', data),
    update: (id, data) => api.put(`/brands/${id}`, data),
    delete: (id) => api.delete(`/brands/${id}`),
    getStats: () => api.get('/brands/stats'),
};

// ─── Notifications ───────────────────────────────────────────────────────────
export const notificationAPI = {
    getMyNotifications: () => api.get('/notifications'),
    markAsRead: (id) => api.patch(`/notifications/${id}/read`),
    markAllAsRead: () => api.patch('/notifications/read-all'),
};

export default api;
