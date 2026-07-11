import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from './api';
import { useAuth } from './AuthContext';
import EmptyState from './components/EmptyState';
import LoadingState from './components/LoadingState';

function App() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');
  const [requestingId, setRequestingId] = useState(null);
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  useEffect(() => { fetchListings(); }, [search]);
  async function fetchListings() {
    setLoading(true); setError(null);
    try { const res = await api.get('/listings', { params: search ? { search } : {} }); setListings(res.data); } catch { setError('Could not load listings. Is the backend running?'); } finally { setLoading(false); }
  }
  async function requestListing(id) {
    setRequestingId(id); setNotice('');
    try { await api.post('/requests', { listing_id: id }); setNotice('Request sent. You can track it on your dashboard.'); } catch (err) { setNotice(err.response?.data?.error || 'Could not send your request.'); } finally { setRequestingId(null); }
  }

  return <div>
    <div className="mb-6"><h1 className="text-3xl font-bold">Browse tools</h1><p className="mt-1 text-sm text-slate-400">Find useful tools shared by your community.</p></div>
    <input type="text" placeholder="Search listings..." value={search} onChange={(e) => setSearch(e.target.value)} className="mb-6 w-full max-w-md rounded border border-slate-600 bg-slate-800 p-2.5 text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none" />
    {notice && <p className="mb-5 rounded border border-slate-700 bg-slate-800 p-3 text-sm text-slate-300">{notice}</p>}
    {loading && <div className="grid grid-cols-1 gap-4 md:grid-cols-3"><LoadingState label="Loading listings..." /><div className="hidden h-32 animate-pulse rounded-lg bg-slate-800 md:block" /><div className="hidden h-32 animate-pulse rounded-lg bg-slate-800 md:block" /></div>}
    {error && <p className="rounded-lg border border-red-900 bg-red-950 p-4 text-sm text-red-300">{error}</p>}
    {!loading && !error && listings.length === 0 && <EmptyState>{search ? `No listings match “${search}”. Try another search.` : 'No listings are available yet. Check back soon!'}</EmptyState>}
    {!loading && !error && listings.length > 0 && <div className="grid grid-cols-1 gap-4 md:grid-cols-3">{listings.map((item) => <div key={item.id} className="flex flex-col rounded-lg border border-slate-700 bg-slate-800 p-4 shadow-sm"><h2 className="text-xl font-semibold">{item.title}</h2><p className="mt-1 text-sm text-slate-400">{item.description}</p><div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="rounded bg-slate-700 px-2 py-1">{item.category}</span><span className="rounded bg-slate-700 px-2 py-1">{item.condition}</span></div><div className="mt-4">{!user ? <Link to="/login" className="text-sm text-indigo-300 hover:text-indigo-200">Log in to request</Link> : item.owner_id === user.id ? <span className="text-sm text-slate-500">Your listing</span> : !item.is_available ? <span className="text-sm text-slate-500">Currently on loan</span> : <button disabled={requestingId === item.id} onClick={() => requestListing(item.id)} className="rounded bg-indigo-600 px-3 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-50">{requestingId === item.id ? 'Sending...' : 'Request to borrow'}</button>}</div></div>)}</div>}
  </div>;
}

export default App;
