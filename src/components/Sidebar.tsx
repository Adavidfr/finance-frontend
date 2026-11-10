import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Receipt,
  Upload,
  Wallet,
  Target,
  Sparkles,
  LogOut,
  PiggyBank,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/transactions', label: 'Transacciones', icon: Receipt },
  { path: '/import', label: 'Importar', icon: Upload },
  { path: '/budgets', label: 'Presupuestos', icon: Wallet },
  { path: '/goals', label: 'Metas', icon: Target },
  { path: '/insights', label: 'Insights', icon: Sparkles },
]

export default function Sidebar() {
  const { logout } = useAuth()
  const location = useLocation()

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col bg-white border-r border-slate-200">
      {/* Logo + nombre — placeholder hasta definir la identidad final */}
      <div className="flex items-center gap-2 px-5 h-16 border-b border-slate-200">
        <PiggyBank size={22} className="text-slate-700" />
        <span className="font-semibold text-slate-800">Finanzas</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-200">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800"
        >
          <LogOut size={18} />
          Salir
        </button>
      </div>
    </aside>
  )
}