import React, { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar } from './components/layout/Sidebar'
import { Dashboard } from './pages/Dashboard'
import { Scanner } from './pages/Scanner'
import { DocumentViewer } from './pages/DocumentViewer'
import { SharedDocument } from './pages/SharedDocument'
import { Login } from './pages/Login'
import { useAppStore } from './store/useAppStore'
import { storage } from './lib/storage'

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
        // Initial session check from local storage
        const profileName = storage.getCurrentUser();
        if (profileName) {
            setUser({ email: profileName }); // Keep same shape user.email for minimal disruption
        }

        // Listen for storage events (e.g. from other tabs or logout)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'doc_app_current_user') {
                if (e.newValue) {
                    setUser({ email: e.newValue });
                } else {
                    setUser(null);
                }
            }
        };
        window.addEventListener('storage', handleStorageChange);

        return () => window.removeEventListener('storage', handleStorageChange);
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
