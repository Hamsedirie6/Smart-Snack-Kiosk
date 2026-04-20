import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

// En dedikerad axios-instans för admin-anrop.
// Fördelen mot vanlig fetch: interceptors hanterar token och 401 centralt
// så att varje enskild sida slipper tänka på det.
const adminApi = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request-interceptor: lägg till Authorization-header på varje utgående request
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response-interceptor: om servern svarar 401 (token utgången/ogiltig)
// rensa sparad data och skicka tillbaka till login
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

// --- Auth ---
export const login = (credentials) => adminApi.post('/auth/login', credentials)

// --- Categories ---
export const getCategories = () => adminApi.get('/categories')
export const getCategoryById = (id) => adminApi.get(`/categories/${id}`)
export const createCategory = (data) => adminApi.post('/categories', data)
export const updateCategory = (id, data) => adminApi.put(`/categories/${id}`, data)
export const deleteCategory = (id) => adminApi.delete(`/categories/${id}`)

// --- Products ---
export const getProducts = () => adminApi.get('/products')
export const getProductById = (id) => adminApi.get(`/products/${id}`)
export const createProduct = (data) => adminApi.post('/products', data)
export const updateProduct = (id, data) => adminApi.put(`/products/${id}`, data)
export const deactivateProduct = (id) => adminApi.patch(`/products/${id}/deactivate`)
export const reactivateProduct = (id) => adminApi.patch(`/products/${id}/reactivate`)
export const deleteProduct = (id) => adminApi.delete(`/products/${id}`)

// --- Inventory ---
export const getInventory = () => adminApi.get('/inventory')
export const getLowStock = () => adminApi.get('/inventory/low-stock')
export const updateStock = (productId, newQuantity) =>
  adminApi.patch(`/inventory/${productId}/stock`, { newQuantity })

// --- Dashboard ---
export const getKpis = () => adminApi.get('/dashboard/kpis')
export const getSalesOverTime = (period) =>
  adminApi.get(`/dashboard/sales-over-time?period=${period}`)
export const getTopProducts = (period, top = 5) =>
  adminApi.get(`/dashboard/top-products?period=${period}&top=${top}`)
export const getDashboardLowStock = () => adminApi.get('/dashboard/low-stock')
