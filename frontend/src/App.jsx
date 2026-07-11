import { useEffect, useState } from 'react';
import api from './api';
import EmptyState from './components/EmptyState';
import LoadingState from './components/LoadingState';

function App() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchListings(); }, [search]);

  async function fetchListings() {
    setLoading(true); setError(null);
    try {
      const res = await api.get('/listings', { params: search ? { search } : {} });
      setListings(res.data);
    } catch {
      setError('Could not load listings. Is the backend running?');
    } finally { setLoading(false); }
  }

  return <div>
    <div className="mb-6"><h1 className="text-3xl font-bold">Browse tools</h1><p className="mt-1 text-sm text-slate-400">Find useful tools shared by your community.</p></div>
    <input type="text" placeholder="Search listings..." value={search} onChange={(e) => setSearch(e.target.value)} className="mb-6 w-full max-w-md rounded border border-slate-600 bg-slate-800 p-2.5 text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none" />
    {loading && <div className="grid grid-cols-1 gap-4 md:grid-cols-3"><LoadingState label="Loading listings..." /><div className="hidden h-32 animate-pulse rounded-lg bg-slate-800 md:block" /><div className="hidden h-32 animate-pulse rounded-lg bg-slate-800 md:block" /></div>}
    {error && <p className="rounded-lg border border-red-900 bg-red-950 p-4 text-sm text-red-300">{error}</p>}
    {!loading && !error && listings.length === 0 && <EmptyState>{search ? `No listings match “${search}”. Try another search.` : 'No listings are available yet. Check back soon!'}</EmptyState>}
    {!loading && !error && listings.length > 0 && <div className="grid grid-cols-1 gap-4 md:grid-cols-3">{listings.map((item) => <div key={item.id} className="rounded-lg border border-slate-700 bg-slate-800 p-4 shadow-sm"><h2 className="text-xl font-semibold">{item.title}</h2><p className="mt-1 text-sm text-slate-400">{item.description}</p><div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="rounded bg-slate-700 px-2 py-1">{item.category}</span><span className="rounded bg-slate-700 px-2 py-1">{item.condition}</span></div></div>)}</div>}
  </div>;
}

export default App;
