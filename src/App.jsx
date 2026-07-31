import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { BottomNav } from './components/BottomNav'
import { Login } from './pages/Login'
import { Home } from './pages/Home'
import { Upload } from './pages/Upload'
import { History } from './pages/History'
import { Ranking } from './pages/Ranking'
import { Profile } from './pages/Profile'
import { UserProfile } from './pages/UserProfile'
import { Admin } from './pages/Admin'
import { Lines } from './pages/Lines'
import { LineDetails } from './pages/LineDetails'
import { SearchPage } from './pages/Search'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && profile?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}

function AppContent() {
  const { user, profile } = useAuth()
  
  const isAdmin = profile?.role === 'admin'

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ranking"
          element={
            <ProtectedRoute>
              <Ranking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lines"
          element={
            <ProtectedRoute>
              <Lines />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lines/:id"
          element={
            <ProtectedRoute>
              <LineDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {user && <BottomNav isAdmin={isAdmin} />}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
