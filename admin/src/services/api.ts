import axios from 'axios'

const API_BASE_URL = 'https://api-medimap.onrender.com/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin-auth-storage')
    if (token) {
      try {
        const parsed = JSON.parse(token)
        if (parsed.state?.token) {
          config.headers.Authorization = `Bearer ${parsed.state.token}`
        }
      } catch (error) {
        console.error('Error parsing token:', error)
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin-auth-storage')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/admin/login', { email, password }),
}

// Admin API
export const adminAPI = {
  // Users
  getUsers: () => api.get('/admin/manage/users'),
  
  // Pharmacies
  getAllPharmacies: () => api.get('/admin/manage/pharmacies'),
  getPendingPharmacies: () => api.get('/admin/manage/pharmacies/pending'),
  approvePharmacy: (id: string) => api.put(`/admin/manage/pharmacies/${id}/approve`),
  rejectPharmacy: (id: string) => api.put(`/admin/manage/pharmacies/${id}/reject`),
  togglePharmacyStatus: (id: string) => api.put(`/admin/manage/pharmacies/${id}/toggle`),
  
  // Orders
  getOrders: (params?: any) => api.get('/admin/manage/orders', { params }),
  
  // Medicines
  getMedicines: () => api.get('/admin/manage/medicines'),
  createMedicine: (data: any) => api.post('/admin/manage/medicines', data),
  updateMedicine: (id: string, data: any) => api.put(`/admin/manage/medicines/${id}`, data),
  deleteMedicine: (id: string) => api.delete(`/admin/manage/medicines/${id}`),
  
  // Analytics
  getAnalytics: () => api.get('/admin/manage/analytics'),
  exportExcel: () => api.get('/admin/manage/analytics/excel', { responseType: 'blob' }),
  exportPDF: () => api.get('/admin/manage/analytics/pdf', { responseType: 'blob' }),
}

export default api