import { Navigate, Route, Routes } from 'react-router-dom'
import { AppNavigation } from './components/AppNavigation'
import { HomePage } from './pages/HomePage'
import { MyCollectionPage } from './pages/MyCollectionPage'
import './App.css'

function App() {
  return (
    <>
      <AppNavigation />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/my-collection" element={<MyCollectionPage />} />
        <Route path="/ma-collection" element={<Navigate to="/my-collection" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
