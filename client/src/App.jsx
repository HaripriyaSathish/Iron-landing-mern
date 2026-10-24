import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

// Loaded separately so visitors never download the admin panel (and its styles never touch the site)
const Home = lazy(() => import('./pages/Home'))
const AdminApp = lazy(() => import('./admin/AdminApp'))

function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    </Suspense>
  )
}

export default App
