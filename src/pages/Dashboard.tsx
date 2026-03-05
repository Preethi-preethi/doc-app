export const Dashboard = () => {
    return (
        <div className="flex-1 p-8 bg-slate-950 text-slate-200 min-h-screen">
            <h2 className="text-3xl font-semibold mb-6">Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                    <h3 className="text-slate-400 font-medium text-sm mb-2">Total Docs Generated</h3>
                    <p className="text-4xl font-light text-emerald-400">0</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                    <h3 className="text-slate-400 font-medium text-sm mb-2">Projects Scanned</h3>
                    <p className="text-4xl font-light text-blue-400">0</p>
                </div>
            </div>

            <div className="mt-8 bg-slate-900 border border-slate-800 rounded-xl p-6 h-96">
                <h3 className="text-lg font-medium text-slate-300 mb-4">Recent Documents</h3>
                <div className="text-center text-slate-500 mt-20">
                    <p>No documents generated yet.</p>
                </div>
            </div>
        </div>
    )
}
