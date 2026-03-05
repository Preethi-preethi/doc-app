import React, { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar } from './components/layout/Sidebar'
import { Dashboard } from './pages/Dashboard'
import { Scanner } from './pages/Scanner'
import { DocumentViewer } from './pages/DocumentViewer'
import { SharedDocument } from './pages/SharedDocument'
import { Login } from './pages/Login'
import { useAppStore } from './store/useAppStore'
import { supabase } from './lib/supabase'

// A wrapper to protect routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAppStore()
    if (!user) {
        return <Navigate to="/login" replace />
    }
    return <>{children}</>
}

export const App = () => {
    const { setUser } = useAppStore()

    useEffect(() => {
        // Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
        })

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [setUser])

    return (
        <HashRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/share/:id" element={<SharedDocument />} />
                <Route
                    path="/*"
                    element={
                        <ProtectedRoute>
                            <div className="flex min-h-screen bg-slate-950 font-sans text-slate-200 overflow-hidden">
                                <Sidebar />
                                <main className="flex-1 overflow-y-auto">
                                    <Routes>
                                        <Route path="/" element={<Dashboard />} />
                                        <Route path="/scanner" element={<Scanner />} />
                                        <Route path="/viewer" element={<DocumentViewer />} />
                                    </Routes>
                                </main>
                            </div>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </HashRouter>
    )
}

export default App
