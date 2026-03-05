import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { QwenAPI } from '../services/ai'
import { useAppStore } from '../store/useAppStore'
import { storage } from '../lib/storage'
import { Save, Share2, CheckCircle2 } from 'lucide-react'

export const DocumentViewer = () => {
    const location = useLocation()
    const { documentationMode, user } = useAppStore()

    const [content, setContent] = useState("")
    const [isStreaming, setIsStreaming] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isSaved, setIsSaved] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [documentId, setDocumentId] = useState<string | null>(null)
    const hasStartedRef = useRef(false)

    useEffect(() => {
        const files = location.state?.files
        if (!files || files.length === 0) {
            return
        }

        if (hasStartedRef.current) return
        hasStartedRef.current = true

        const generate = async () => {
            setIsStreaming(true)
            setContent("")
            setError(null)

            try {
                await QwenAPI.generateDocumentation(
                    files,
                    documentationMode,
                    (token) => {
                        setContent((prev) => prev + token)
                    }
                )
            } catch (err: any) {
                setError(err.message || "Failed to generate documentation")
            } finally {
                setIsStreaming(false)
            }
        }

        generate()
    }, [location.state, documentationMode])

    const handleSaveDocument = async () => {
        if (!content || !user || isSaving) return
        setIsSaving(true)

        try {
            const docName = `Documentation (${documentationMode}) - ${new Date().toLocaleDateString()}`

            // Use local storage instead of Supabase
            const newDoc = storage.saveDocument({
                user_id: user.email, // using email as profileName
                title: docName,
                content: content,
                mode: documentationMode,
                is_public: false
            })

            setIsSaved(true)
            setDocumentId(newDoc.id)

        } catch (err: any) {
            console.error("Failed to save:", err)
            alert("Failed to save to local storage.")
        } finally {
            setIsSaving(false)
        }
    }

    const handleShare = async () => {
        if (!documentId) return
        try {
            // make public in local storage
            storage.updateDocumentVisibility(documentId, true)
            const shareUrl = `${window.location.origin}/#/share/${documentId}`
            await navigator.clipboard.writeText(shareUrl)
            alert("Link copied to clipboard! Anyone with the link on this machine can view.")
        } catch (err) {
            alert("Error sharing document.")
        }
    }

    return (
        <div className="flex-1 p-8 bg-slate-950 text-slate-200 min-h-screen flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-semibold">Document Viewer</h2>
                {content && !isStreaming && (
                    <div className="flex gap-3">
                        <button
                            onClick={handleSaveDocument}
                            disabled={isSaved || isSaving}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isSaved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 hover:bg-slate-700'
                                }`}
                        >
                            {isSaved ? <><CheckCircle2 size={16} /> Saved</> : <><Save size={16} /> Save to Cloud</>}
                        </button>

                        {isSaved && (
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors"
                            >
                                <Share2 size={16} /> Share Link
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-8 overflow-y-auto max-h-[80vh]">
                {!content && !isStreaming && !error && (
                    <p className="text-slate-500 italic text-center mt-20">Generate a document from the Scanner to view it here.</p>
                )}

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg">
                        <h4 className="font-bold">Generation Error</h4>
                        <p>{error}</p>
                    </div>
                )}

                {(content || isStreaming) && (
                    <div className="prose prose-invert prose-emerald max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content}
                        </ReactMarkdown>
                        {isStreaming && (
                            <span className="inline-block w-2 h-5 ml-1 bg-emerald-400 animate-pulse"></span>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
