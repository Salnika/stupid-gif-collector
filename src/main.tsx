import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './shared/styles/global.css'

const getRouterBasename = (): string => {
  if (import.meta.env.BASE_URL !== '/') {
    return import.meta.env.BASE_URL
  }

  const marker = '/stupid-gif-collector/'
  return window.location.pathname.startsWith(marker) ? marker : '/'
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={getRouterBasename()}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
