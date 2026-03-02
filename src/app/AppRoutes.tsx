import { Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from '../pages/HomePage'
import { MyCollectionPage } from '../pages/MyCollectionPage'
import { SharedGifPage } from '../pages/SharedGifPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/my-collection" element={<MyCollectionPage />} />
      <Route path="/ma-collection" element={<Navigate to="/my-collection" replace />} />
      <Route path="/share/:gifNumber" element={<SharedGifPage />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  )
}
