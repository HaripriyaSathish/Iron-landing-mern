import { useState } from 'react'
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { ChevronDown, ExternalLink, KeyRound, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from './AuthContext'
import sections, { groups, home } from './sections'
import { PageLoader } from './components/ui'

function SideLink({ path, end, icon: Icon, title, hint, tabIndex }) {
  return (
    <NavLink to={path} end={end} className="side-link" tabIndex={tabIndex}>
      <span className="side-link__icon">
        <Icon size={19} />
      </span>
      <span className="side-link__text">
        <span>{title}</span>
        <small>{hint}</small>
      </span>
    </NavLink>
  )
}

export default function AdminLayout() {
  const { admin, checking, logout } = useAuth()
  const location = useLocation()
  // Mobile drawer stays open only on the page it was opened from, so navigating closes it
  const [openedOn, setOpenedOn] = useState(null)
  const open = openedOn === location.pathname
  const setOpen = (value) => setOpenedOn(value ? location.pathname : null)

  // Sidebar folders: the one holding the current page is open, unless the admin opened/closed
  // one by hand on this page. Navigating resets to the current page's folder.
  const activeGroup = groups.find((g) => g.items.some((item) => location.pathname.startsWith(item.path)))?.id
  const [chosenGroup, setChosenGroup] = useState(null)
  const shownGroup = chosenGroup?.path === location.pathname ? chosenGroup.id : activeGroup

  if (checking) return <PageLoader />
  if (!admin) return <Navigate to="/admin/login" replace />

  const current = sections.find((s) => (s.end ? location.pathname === s.path : location.pathname.startsWith(s.path)))

  return (
    <div className={`admin ${open ? 'is-drawer-open' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar__brand">
          <span className="sidebar__mark">IMK</span>
          <div>
            <strong>Iron Me Ka</strong>
            <small>Studio Admin</small>
          </div>
          <button type="button" className="sidebar__close" onClick={() => setOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar__nav">
          <SideLink {...home} />

          {groups.map((group) => {
            const isOpen = shownGroup === group.id
            const hasActive = group.id === activeGroup
            return (
              <div key={group.id} className={`side-group ${isOpen ? 'is-open' : ''}`}>
                <button
                  type="button"
                  className={`side-group__toggle ${hasActive ? 'has-active' : ''}`}
                  aria-expanded={isOpen}
                  onClick={() => setChosenGroup({ path: location.pathname, id: isOpen ? null : group.id })}
                >
                  <group.icon size={16} />
                  <span>{group.title}</span>
                  <span className="side-group__count">{group.items.length}</span>
                  <ChevronDown size={16} className="side-group__chevron" />
                </button>
                <div className="side-group__items">
                  <div>
                    {group.items.map((item) => (
                      <SideLink key={item.path} {...item} tabIndex={isOpen ? undefined : -1} />
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </nav>

        <div className="sidebar__foot">
          <NavLink to="/admin/account" className="side-link side-link--plain">
            <span className="side-link__icon">
              <KeyRound size={18} />
            </span>
            <span className="side-link__text">
              <span>My Account</span>
            </span>
          </NavLink>
          <a href="/" target="_blank" rel="noreferrer" className="side-link side-link--plain">
            <span className="side-link__icon">
              <ExternalLink size={18} />
            </span>
            <span className="side-link__text">
              <span>View Site</span>
            </span>
          </a>
          <button type="button" className="side-link side-link--plain" onClick={logout}>
            <span className="side-link__icon">
              <LogOut size={18} />
            </span>
            <span className="side-link__text">
              <span>Log out</span>
            </span>
          </button>
        </div>
      </aside>

      <div className="sidebar-backdrop" onClick={() => setOpen(false)} />

      <div className="admin__main">
        <header className="topbar">
          <button type="button" className="topbar__menu" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
          <span className="topbar__crumb">{current?.title || 'My Account'}</span>
          <div className="topbar__user">
            <span className="topbar__avatar">{(admin.name || 'A').charAt(0).toUpperCase()}</span>
            <span className="topbar__name">Hello, {admin.name}</span>
          </div>
        </header>
        <main className="admin__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
