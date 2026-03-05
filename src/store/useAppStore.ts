import { create } from 'zustand'

export type DocMode = 'product' | 'process'

interface AppState {
    user: any | null
    setUser: (user: any) => void
    scannedFolderPath: string | null
    setScannedFolderPath: (path: string | null) => void
    documentationMode: DocMode
    setDocumentationMode: (mode: DocMode) => void
    isGenerating: boolean
    setIsGenerating: (status: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
    user: null, // Initial mock user or actual session state
    setUser: (user) => set({ user }),
    scannedFolderPath: null,
    setScannedFolderPath: (path) => set({ scannedFolderPath: path }),
    documentationMode: 'product',
    setDocumentationMode: (mode) => set({ documentationMode: mode }),
    isGenerating: false,
    setIsGenerating: (status) => set({ isGenerating: status }),
}))
