import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  Lightbulb,
  Library,
  LogOut,
  TrendingUp,
  Settings
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/trades/new', icon: PlusCircle, label: 'New Trade' },
  { to: '/trades', icon: BookOpen, label: 'Trade History', end: true },
  { to: '/insights', icon: Lightbulb, label: 'Insights' },
  { to: '/playbook', icon: Library, label: 'Playbook' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const { signOut, profile } = useAuthStore()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-[#1E293B] flex flex-col z-50">

      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-700">
        <div className="bg-[#22C55E] p-2 rounded-lg">
          <TrendingUp size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg leading-none">Trade Journal</h1>
          <p className="text-slate-400 text-xs mt-1">Pro Trader</p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map(({ to, icon: Icon, label, end }) => (
         <NavLink
            key={to}
            to={to}
            end={end || to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#22C55E] text-white'
                  : 'text-slate-400 hover:bg-slate-700 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User & Sign Out */}
      <div className="px-4 py-4 border-t border-slate-700">
        <div className="px-4 py-2 mb-2">
          <p className="text-white text-sm font-medium truncate">
            {profile?.full_name || 'Trader'}
          </p>
          <p className="text-slate-400 text-xs truncate">{profile?.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

    </aside>
  )
}