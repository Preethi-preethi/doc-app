import { useState } from 'react'
import { FolderOpen, Cpu } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { useNavigate } from 'react-router-dom'

// Add type for electron exposure
declare global {
    interface Window {
        electronAPI: any
    }
}

export const Scanner = () => {
    const navigate = useNavigate()
    const {
        scannedFolderPath,
        setScannedFolderPath,
        documentationMode,
        setDocumentationMode,
        isGenerating,
        setIsGenerating
    } = useAppStore()

    const [statusMessage, setStatusMessage] = useState("")

    const handleSelectFolder = async () => {
        if (window.electronAPI) {
            const folderPath = await window.electronAPI.openDirectory()
            if (folderPath) {
                setScannedFolderPath(folderPath)
            }
        } else {
            console.warn("Electron API not available, probably running in browser mode.")
        }
    }

    const handleGenerate = async () => {
        if (!scannedFolderPath) return

        setIsGenerating(true)
        setStatusMessage("Scanning local directory...")

        try {
            // 1. Scan directory
            const scanResult = await window.electronAPI.scanDirectory(scannedFolderPath)

            if (!scanResult.success) {
                throw new Error(scanResult.error || "Failed to scan folder")
            }

            setStatusMessage(`Found ${scanResult.files.length} valid files. Formulating AI context...`)

            // Navigate to viewer to watch stream. We pass the files via state or store.
            // For simplicity, we can pass it via router state
            navigate('/viewer', { state: { files: scanResult.files } })

        } catch (err: any) {
            alert("Error: " + err.message)
        } finally {
            setIsGenerating(false)
            setStatusMessage("")
        }
    }

    return (
        <div className="flex-1 p-8 bg-slate-950 text-slate-200 min-h-screen">
            <h2 className="text-3xl font-semibold mb-6">AI Scan & Generate</h2>

            <div className="max-w-3xl space-y-8">
                {/* Step 1: Select Folder */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
                    <h3 className="text-xl font-medium mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">1</span>
                        Target Directory
                    </h3>
                    <p className="text-slate-400 text-sm mb-6">
                        Select the local directory of your code project. The system will parse and map all valid local codebase files.
                    </p>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleSelectFolder}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-lg text-white font-medium transition-colors"
                            disabled={isGenerating}
                        >
                            <FolderOpen size={18} />
                            {scannedFolderPath ? 'Change Folder' : 'Browse Folder'}
                        </button>
                        {scannedFolderPath && (
                            <div className="px-4 py-2 bg-slate-950 border border-slate-800 rounded w-full overflow-hidden text-ellipsis whitespace-nowrap text-sm font-mono text-emerald-400">
                                {scannedFolderPath}
                            </div>
                        )}
                    </div>
                </div>

                {/* Step 2: Configure */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
                    <h3 className="text-xl font-medium mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">2</span>
                        Documentation Mode
                    </h3>
                    <p className="text-slate-400 text-sm mb-6">
                        Choose the specific type of artificial intelligence analysis you want on this codebase.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <label
                            className={`border p-4 rounded-xl cursor-pointer transition-all ${documentationMode === 'product' ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 bg-slate-950 hover:bg-slate-800'}`}
                        >
                            <input
                                type="radio"
                                name="docMode"
                                value="product"
                                checked={documentationMode === 'product'}
                                onChange={(e) => setDocumentationMode(e.target.value as 'product' | 'process')}
                                className="hidden"
                            />
                            <h4 className="font-semibold text-emerald-400 mb-1">Product-Based</h4>
                            <p className="text-xs text-slate-400">Generates user guides, features, and high-level architecture overviews.</p>
                        </label>
                        <label
                            className={`border p-4 rounded-xl cursor-pointer transition-all ${documentationMode === 'process' ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 bg-slate-950 hover:bg-slate-800'}`}
                        >
                            <input
                                type="radio"
                                name="docMode"
                                value="process"
                                checked={documentationMode === 'process'}
                                onChange={(e) => setDocumentationMode(e.target.value as 'product' | 'process')}
                                className="hidden"
                            />
                            <h4 className="font-semibold text-emerald-400 mb-1">Process-Based</h4>
                            <p className="text-xs text-slate-400">Generates setup instructions, CI/CD procedures, code structure, and contribution guides.</p>
                        </label>
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-end items-center gap-4">
                    {statusMessage && (
                        <p className="text-emerald-400 text-sm animate-pulse">{statusMessage}</p>
                    )}
                    <button
                        disabled={!scannedFolderPath || isGenerating}
                        onClick={handleGenerate}
                        className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all ${!scannedFolderPath || isGenerating
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                            }`}
                    >
                        {isGenerating ? (
                            <>
                                <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                                Generating...
                            </>
                        ) : (
                            <>
                                <Cpu size={24} />
                                Generate Documentation
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
