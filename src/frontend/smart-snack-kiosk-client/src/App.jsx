import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import KioskPage from './pages/KioskPage'
import LoginPage from './pages/LoginPage'
import AdminLayout from './pages/admin/AdminLayout'
import DashboardPage from './pages/admin/DashboardPage'
import CategoriesPage from './pages/admin/CategoriesPage'
import ProductsPage from './pages/admin/ProductsPage'
import InventoryPage from './pages/admin/InventoryPage'
import PrivateRoute from './components/admin/PrivateRoute'
import './App.css'

// Routingstrukturen:
//   /              → kiosken (publik)
//   /login         → inloggning (publik)
//   /admin         → redirect till /admin/dashboard
//   /admin/*       → skyddade admin-sidor (kräver inloggning)
//
// AdminLayout wrappas i PrivateRoute → alla undersidor är automatiskt skyddade.
// Outlet i AdminLayout renderar den aktiva undersidan (Dashboard, Categories, osv).

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Publik: kiosk */}
        <Route path="/" element={<KioskPage />} />

        {/* Publik: login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Skyddade admin-sidor */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          {/* /admin → redirect till /admin/dashboard */}
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="inventory" element={<InventoryPage />} />
        </Route>

        {/* Okänd URL → kiosken */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
