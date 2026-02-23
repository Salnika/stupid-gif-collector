import { NavLink } from 'react-router-dom'

export function AppNavigation() {
  return (
    <>
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

      <a
        className="app-nav__github"
        href="https://github.com/Salnika/stupid-gif-collector"
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Open GitHub repository"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 0.296c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.386-1.333-1.756-1.333-1.756-1.09-.745.082-.729.082-.729 1.205.085 1.838 1.236 1.838 1.236 1.07 1.835 2.81 1.305 3.495.998.108-.775.418-1.305.76-1.605-2.665-.304-5.467-1.335-5.467-5.932 0-1.31.47-2.38 1.235-3.22-.12-.303-.54-1.523.12-3.176 0 0 1.01-.324 3.3 1.23a11.46 11.46 0 0 1 6 0c2.28-1.554 3.285-1.23 3.285-1.23.66 1.653.245 2.873.12 3.176.77.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.921.435.375.81 1.102.81 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.694.825.576 4.765-1.585 8.19-6.082 8.19-11.385 0-6.627-5.373-12-12-12Z"
          />
        </svg>
      </a>
    </>
  )
}
