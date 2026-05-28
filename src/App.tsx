import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { BuildHydrator } from './components/builder/BuildHydrator'
import { CompareHydrator } from './components/compare/CompareHydrator'
import { BuildSummaryBar } from './components/layout/BuildSummaryBar'
import { Footer } from './components/layout/Footer'
import { Navbar } from './components/layout/Navbar'
import { CompareTray } from './components/ui/CompareTray'
import { ProductCardSkeleton } from './components/ui/Skeleton'
import { StorePage } from './pages/StorePage'
import { ProductDetailsPage } from './pages/ProductDetailsPage'
import { PCBuilderPage } from './pages/PCBuilderPage'
import { GuidesPage } from './pages/GuidesPage'
import { BuildCodePage } from './pages/BuildCodePage'
import { InstallPwaBanner } from './components/layout/InstallPwaBanner'

const AdminLogin = lazy(() => import('./pages/AdminLogin').then((m) => ({ default: m.AdminLogin })))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then((m) => ({ default: m.AdminDashboard })))

function PageFallback() {
  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 px-4 py-8 min-[480px]:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

function App() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <div className="app-shell flex min-h-screen flex-col bg-bg text-text">
      <div
        className="orb left-[10%] top-[15%] h-64 w-64 bg-brand/30"
        style={{ animationDelay: '0s' }}
        aria-hidden
      />
      <div
        className="orb right-[5%] top-[25%] h-48 w-48 bg-brand-cyan/25"
        style={{ animationDelay: '-4s' }}
        aria-hidden
      />
      <div
        className="orb bottom-[10%] left-[40%] h-56 w-56 bg-brand-deep/20"
        style={{ animationDelay: '-8s' }}
        aria-hidden
      />
      {!isAdminRoute && <Navbar />}
      {!isAdminRoute && <BuildHydrator />}
      {!isAdminRoute && <CompareHydrator />}
      <main className="flex w-full flex-1 justify-center">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<StorePage />} />
            <Route path="/guides" element={<GuidesPage />} />
            <Route path="/product/:productId" element={<ProductDetailsPage />} />
            <Route path="/builder" element={<PCBuilderPage />} />
            <Route path="/build/:code" element={<BuildCodePage />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdminRoute && <BuildSummaryBar />}
      {!isAdminRoute && <CompareTray />}
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <InstallPwaBanner />}
    </div>
  )
}

export default App
