import { Link, useLocation } from 'react-router-dom'
import { FileSearch, LayoutDashboard, Settings, FileText, LogOut } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { storage } from '../../lib/storage'

export const Sidebar = () => {
    const location = useLocation()
    const { user, setUser } = useAppStore()

    const links = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
        { name: 'Scanner', path: '/scanner', icon: <FileSearch size={20} /> },
        { name: 'Viewer', path: '/viewer', icon: <FileText size={20} /> },
        { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
    ]

    const handleSignOut = () => {
        storage.setCurrentUser(null)
        setUser(null)
    }

    return (
        <div className="w-64 h-screen bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col">
            <div className="p-6">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center gap-2">
                    <span>AI</span>
                    <span className="text-white">Docs</span>
                </h1>
            </div>
            <nav className="flex-1 px-4 space-y-2">
                {links.map((link) => {
                    const isActive = location.pathname === link.path
                    return (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            {link.icon}
                            <span className="font-medium">{link.name}</span>
                        </Link>
                    )
                })}
            </nav>
            <div className="p-6 border-t border-slate-800 text-sm flex items-center justify-between group">
                <div className="flex items-center gap-2 truncate pr-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-slate-900 font-bold shrink-0">
                        {user?.email?.[0].toUpperCase() || 'U'}
                    </div>
                    <div className="ml-1 truncate">
                        <p className="text-slate-200 font-medium truncate" title={user?.email || 'User'}>
                            {user?.email || 'User'}
                        </p>
                        <p className="text-slate-500 text-xs">Online</p>
                    </div>
                </div>
                <button
                    onClick={handleSignOut}
                    className="text-slate-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-400/10"
                    title="Sign Out"
                >
                    <LogOut size={16} />
                </button>
            </div>
        </div>
    )
}
