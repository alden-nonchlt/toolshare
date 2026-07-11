export default function LoadingState({ label = 'Loading...' }) {
  return <div className="flex min-h-32 items-center justify-center gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-400" role="status">
    <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-indigo-400" aria-hidden="true" />
    <span>{label}</span>
  </div>;
}
