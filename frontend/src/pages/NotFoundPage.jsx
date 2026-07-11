import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return <div className="mx-auto max-w-lg rounded-lg border border-slate-700 bg-slate-800 p-8 text-center shadow-xl">
    <p className="text-sm font-medium uppercase tracking-widest text-indigo-300">404</p>
    <h1 className="mt-2 text-3xl font-bold">Page not found</h1>
    <p className="mt-3 text-slate-400">That page does not exist or may have moved.</p>
    <Link to="/" className="mt-6 inline-block rounded bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500">Back to browse</Link>
  </div>;
}
