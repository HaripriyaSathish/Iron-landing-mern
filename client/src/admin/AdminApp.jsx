import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useSiteFavicon } from '../lib/useSeo'
import { AuthProvider } from './AuthContext'
import { ToastProvider } from './components/Toast'
import AdminLayout from './AdminLayout'
import Login from './pages/Login'
import Overview from './pages/Overview'
import BrandingPage from './pages/BrandingPage'
import MenuPage from './pages/MenuPage'
import QuickConnectPage from './pages/QuickConnectPage'
import SliderPage from './pages/SliderPage'
import StoryPage from './pages/StoryPage'
import ServicesPage from './pages/ServicesPage'
import PromisePage from './pages/PromisePage'
import ProcessPage from './pages/ProcessPage'
import TestimonialsPage from './pages/TestimonialsPage'
import ContactPage from './pages/ContactPage'
import FooterPage from './pages/FooterPage'
import EmailPage from './pages/EmailPage'
import LanguagesPage from './pages/LanguagesPage'
import TranslatePage from './pages/TranslatePage'
import AccountPage from './pages/AccountPage'
import './admin.css'

export default function AdminApp() {
  useSiteFavicon()
  useEffect(() => {
    document.title = 'Iron Me Ka · Studio Admin'
  }, [])

  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route element={<AdminLayout />}>
            <Route index element={<Overview />} />
            <Route path="branding" element={<BrandingPage />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="quick-connect" element={<QuickConnectPage />} />
            <Route path="slider" element={<SliderPage />} />
            <Route path="story" element={<StoryPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="promise" element={<PromisePage />} />
            <Route path="process" element={<ProcessPage />} />
            <Route path="reviews" element={<TestimonialsPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="footer" element={<FooterPage />} />
            <Route path="email" element={<EmailPage />} />
            <Route path="languages" element={<LanguagesPage />} />
            <Route path="languages/:code" element={<TranslatePage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}
