import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react'

export const SharedDocument = () => {
    const { id } = useParams<{ id: string }>()
    const [doc, setDoc] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchDoc = async () => {
            if (!id) return
            try {
                const { data, error: sbError } = await supabase
                    .from('documents')
                    .select('*')
                    .eq('id', id)
                    .eq('is_public', true)
                    .single()

                if (sbError) throw sbError
                if (!data) throw new Error("Document not found or is not public")

                setDoc(data)
            } catch (err: any) {
                setError(err.message || 'Failed to load shared document')
            } finally {
                setLoading(false)
            }
        }

        fetchDoc()
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-emerald-400">
                <Loader2 className="animate-spin" size={40} />
            </div>
        )
    }

    if (error || !doc) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-200 p-8">
                <AlertCircle className="text-red-500 mb-4" size={48} />
                <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                <p className="text-slate-400 mb-8">{error}</p>
                <Link to="/" className="text-emerald-400 hover:text-emerald-300 flex items-center gap-2">
                    <ArrowLeft size={16} /> Return to AI Docs App
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl w-full">
                <div className="mb-8 flex flex-col gap-2">
                    <h1 className="text-3xl font-bold">{doc.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
                            {doc.mode === 'product' ? 'Product-Based' : 'Process-Based'}
                        </span>
                        <span>Generated on {new Date(doc.created_at).toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
                    <div className="prose prose-invert prose-emerald max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {doc.content}
                        </ReactMarkdown>
                    </div>
                </div>

                <div className="mt-12 text-center text-slate-500 text-sm pb-12">
                    Generated with <span className="font-semibold text-slate-300">AI Docs Generator</span>
                </div>
            </div>
        </div>
    )
}
