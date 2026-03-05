import React, { useState } from 'react'
import { storage } from '../lib/storage'
import { useNavigate } from 'react-router-dom'
import { Lock, User, Loader2, RefreshCcw } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

type AuthMode = 'login' | 'signup' | 'forgot-password'

export const Login = () => {
    const navigate = useNavigate()
    const { setUser } = useAppStore()
    const [profileName, setProfileName] = useState('')
    const [password, setPassword] = useState('')
    const [oldPassword, setOldPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [mode, setMode] = useState<AuthMode>('login')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            // Simulated network delay
            await new Promise(resolve => setTimeout(resolve, 800))
            const profiles = storage.getProfiles()

            if (mode === 'signup') {
                if (profiles[profileName]) {
                    throw new Error('Profile already exists. Please choose a different name.')
                }
                storage.saveProfile({ profileName, passwordHash: password })
                storage.setCurrentUser(profileName)
                setUser({ email: profileName }) // Keep existing shape
                navigate('/')
            } else if (mode === 'login') {
                const userProfile = profiles[profileName]
                if (!userProfile) {
                    throw new Error('Profile not found.')
                }
                if (userProfile.passwordHash !== password) {
                    throw new Error('Invalid password.')
                }
                storage.setCurrentUser(profileName)
                setUser({ email: profileName })
                navigate('/')
            } else if (mode === 'forgot-password') {
                const userProfile = profiles[profileName]
                if (!userProfile) {
                    throw new Error('Profile not found.')
                }
                if (userProfile.passwordHash !== oldPassword) {
                    throw new Error('Incorrect old password.')
                }
                if (password !== confirmPassword) {
                    throw new Error('New passwords do not match.')
                }
                storage.saveProfile({ profileName, passwordHash: password })
                setSuccess('Password updated successfully! Please login.')
                setMode('login')
                setPassword('')
                setOldPassword('')
                setConfirmPassword('')
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during authentication')
        } finally {
            setLoading(false)
        }
    }

    const toggleMode = (newMode: AuthMode) => {
        setMode(newMode)
        setError(null)
        setSuccess(null)
        setPassword('')
        setOldPassword('')
        setConfirmPassword('')
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950 font-sans text-slate-200">
            <div className="w-full max-w-md p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">
                        AI Docs
                    </h1>
                    <p className="text-slate-400">
                        {mode === 'signup' ? 'Create a new profile' : mode === 'forgot-password' ? 'Reset your password' : 'Sign in to your profile'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-sm text-center">
                        {success}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Profile Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="text"
                                value={profileName}
                                onChange={(e) => setProfileName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                placeholder="eg. JohnDoe123"
                                required
                            />
                        </div>
                    </div>

                    {mode === 'forgot-password' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Old Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">
                            {mode === 'forgot-password' ? 'New Password' : 'Password'}
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    {mode === 'forgot-password' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Confirm New Password</label>
                            <div className="relative">
                                <RefreshCcw className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : mode === 'signup' ? 'Create Profile' : mode === 'forgot-password' ? 'Update Password' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 flex flex-col items-center gap-2 text-sm text-slate-400">
                    {mode === 'login' && (
                        <>
                            <div>
                                <button
                                    onClick={() => toggleMode('forgot-password')}
                                    className="text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-4"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                            <div>
                                Don't have a profile?{' '}
                                <button
                                    onClick={() => toggleMode('signup')}
                                    className="text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-4"
                                >
                                    Create one
                                </button>
                            </div>
                        </>
                    )}
                    {mode === 'signup' && (
                        <div>
                            Already have a profile?{' '}
                            <button
                                onClick={() => toggleMode('login')}
                                className="text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-4"
                            >
                                Sign in
                            </button>
                        </div>
                    )}
                    {mode === 'forgot-password' && (
                        <div>
                            Remember your password?{' '}
                            <button
                                onClick={() => toggleMode('login')}
                                className="text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-4"
                            >
                                Sign in
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
