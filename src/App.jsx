import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store/authStore'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import NewTradePage from './pages/NewTradePage'

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
        <Route path="/trades" element={<ProtectedRoute><div className="min-h-screen bg-[#0F172A] text-white p-8">Trade History (coming soon)</div></ProtectedRoute>} />
        <Route path="/trades/new" element={<ProtectedRoute><NewTradePage /></ProtectedRoute>} />
        <Route path="/insights" element={<ProtectedRoute><div className="min-h-screen bg-[#0F172A] text-white p-8">Insights (coming soon)</div></ProtectedRoute>} />
        <Route path="/playbook" element={<ProtectedRoute><div className="min-h-screen bg-[#0F172A] text-white p-8">Playbook (coming soon)</div></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App