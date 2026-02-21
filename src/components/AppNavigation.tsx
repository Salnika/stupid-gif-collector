import { NavLink } from 'react-router-dom'

export function AppNavigation() {
  return (
    <nav className="app-nav" aria-label="Main navigation">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          isActive ? 'app-nav__button app-nav__button--active' : 'app-nav__button'
        }
      >
        Home
      </NavLink>
      <NavLink
        to="/my-collection"
        className={({ isActive }) =>
          isActive ? 'app-nav__button app-nav__button--active' : 'app-nav__button'
        }
      >
        My collection
      </NavLink>
    </nav>
  )
}
