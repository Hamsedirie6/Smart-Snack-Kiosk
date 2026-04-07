import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import '../../admin.css'

// Sidebares navigeringslänkar samlade på ett ställe.
// Ikon + sökväg + visningsnamn.
const NAV_LINKS = [
  { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/admin/categories', icon: '🏷️', label: 'Kategorier' },
  { to: '/admin/products', icon: '📦', label: 'Produkter' },
  { to: '/admin/inventory', icon: '🏪', label: 'Lager' },
]

// Titlar per route för topbaren
const PAGE_TITLES = {
  '/admin/dashboard': 'Dashboard',
  '/admin/categories': 'Kategorier',
  '/admin/products': 'Produkter',
  '/admin/inventory': 'Lager',
}

function AdminLayout() {
  const { username, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  // Första bokstaven i användarnamnet används som avatar
  const avatarLetter = username ? username[0].toUpperCase() : 'A'
  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Admin'

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <NavLink to="/admin/dashboard" className="admin-sidebar__logo">
            <div className="admin-sidebar__logo-icon">🛒</div>
            <div className="admin-sidebar__logo-text">
              <span className="admin-sidebar__logo-name">SmartSnack</span>
              <span className="admin-sidebar__logo-sub">Admin-portal</span>
            </div>
          </NavLink>
        </div>

        <nav className="admin-nav">
          <p className="admin-nav__label">Meny</p>
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `admin-nav__link${isActive ? ' active' : ''}`
              }
            >
              <span className="admin-nav__icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">
            <div className="admin-sidebar__avatar">{avatarLetter}</div>
            <span className="admin-sidebar__username">{username}</span>
          </div>
          <button className="admin-sidebar__logout" onClick={handleLogout}>
            <span>↩</span>
            Logga ut
          </button>
        </div>
      </aside>

      {/* Huvudinnehåll */}
      <div className="admin-main">
        <header className="admin-topbar">
          <span className="admin-topbar__title">{pageTitle}</span>
          <span className="admin-topbar__breadcrumb">Admin / {pageTitle}</span>
        </header>

        <main className="admin-content">
          {/* Outlet renderar den aktiva undersidan här */}
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
