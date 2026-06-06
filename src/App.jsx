import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store/authStore'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import NewTradePage from './pages/NewTradePage'
import TradeHistoryPage from './pages/TradeHistoryPage'
import TradeDetailPage from './pages/TradeDetailPage'
import InsightsPage from './pages/InsightsPage'
import PlaybookPage from './pages/PlaybookPage'
import EditTradePage from './pages/EditTradePage'
import SettingsPage from './pages/SettingsPage'



function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore()

  if (loading) return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <p className="text-white">Loading...</p>
    </div>
  )

  if (!user) return <Navigate to="/login" replace />
  return children
}

function App() {
  const { setUser, setLoading, fetchProfile } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) fetchProfile(session.user.id)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/trades" element={<ProtectedRoute><TradeHistoryPage /></ProtectedRoute>} />
        <Route path="/trades/:id" element={<ProtectedRoute><TradeDetailPage /></ProtectedRoute>} />
        <Route path="/trades/new" element={<ProtectedRoute><NewTradePage /></ProtectedRoute>} />
        <Route path="/insights" element={<ProtectedRoute><InsightsPage /></ProtectedRoute>} />
        <Route path="/playbook" element={<ProtectedRoute><PlaybookPage /></ProtectedRoute>} />
        <Route path="/trades/:id/edit" element={<ProtectedRoute><EditTradePage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App