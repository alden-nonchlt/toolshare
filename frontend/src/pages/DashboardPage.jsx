import { useEffect, useState } from 'react';
import api from '../api';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';

const tabs = ['My Listings', 'My Requests', 'Incoming Requests'];
const inputClass = 'w-full rounded border border-slate-600 bg-slate-900 p-2 text-white';

function Status({ value }) { return <span className="rounded bg-slate-700 px-2 py-1 text-xs capitalize text-slate-200">{value}</span>; }

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [data, setData] = useState({ listings: [], mine: [], incoming: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [busyId, setBusyId] = useState(null);

  async function loadDashboard() {
    setLoading(true); setError('');
    try {
      const [listings, mine, incoming] = await Promise.all([api.get('/listings/mine'), api.get('/requests/mine'), api.get('/requests/incoming')]);
      setData({ listings: listings.data, mine: mine.data, incoming: incoming.data });
    } catch (err) { setError(err.response?.data?.error || 'Could not load your dashboard.'); } finally { setLoading(false); }
  }
  useEffect(() => { loadDashboard(); }, []);

  async function deleteListing(id) {
    if (!window.confirm('Delete this listing?')) return;
    setBusyId(id); setError('');
    try { await api.delete(`/listings/${id}`); await loadDashboard(); } catch (err) { setError(err.response?.data?.error || 'Could not delete listing.'); } finally { setBusyId(null); }
  }
  async function saveListing(event) {
    event.preventDefault(); setBusyId(editing.id); setError('');
    try { await api.put(`/listings/${editing.id}`, editing); setEditing(null); await loadDashboard(); } catch (err) { setError(err.response?.data?.error || 'Could not update listing.'); } finally { setBusyId(null); }
  }
  async function updateRequest(id, action) {
    setBusyId(id); setError('');
    try { await api.put(`/requests/${id}/${action}`); await loadDashboard(); } catch (err) { setError(err.response?.data?.error || 'Could not update request.'); } finally { setBusyId(null); }
  }

  function listingContent() {
    if (!data.listings.length) return <EmptyState>You have not created any listings yet.</EmptyState>;
    return <div className="space-y-3">{data.listings.map((item) => <div key={item.id} className="rounded-lg border border-slate-700 bg-slate-800 p-4">
      {editing?.id === item.id ? <form onSubmit={saveListing} className="grid gap-3 md:grid-cols-2">
        <input required className={inputClass} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
        <input className={inputClass} placeholder="Category" value={editing.category || ''} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
        <textarea className={`${inputClass} md:col-span-2`} placeholder="Description" value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
        <div className="flex gap-2"><button disabled={busyId === item.id} className="rounded bg-indigo-600 px-3 py-2 text-sm disabled:opacity-50">Save</button><button type="button" onClick={() => setEditing(null)} className="rounded bg-slate-700 px-3 py-2 text-sm">Cancel</button></div>
      </form> : <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold">{item.title}</h2><p className="mt-1 text-sm text-slate-400">{item.description || 'No description'}</p><div className="mt-2 flex gap-2"><Status value={item.status} /><Status value={item.is_available ? 'available' : 'on loan'} /></div></div><div className="flex gap-2"><button onClick={() => setEditing(item)} className="rounded bg-slate-700 px-3 py-2 text-sm hover:bg-slate-600">Edit</button><button disabled={busyId === item.id} onClick={() => deleteListing(item.id)} className="rounded bg-red-900 px-3 py-2 text-sm text-red-100 hover:bg-red-800 disabled:opacity-50">Delete</button></div></div>}
    </div>)}</div>;
  }
  function requestsContent(requests, incoming) {
    if (!requests.length) return <EmptyState>{incoming ? 'No one has requested one of your listings.' : 'You have not made any borrowing requests.'}</EmptyState>;
    return <div className="space-y-3">{requests.map((request) => <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-700 bg-slate-800 p-4"><div><h2 className="font-semibold">{request.title}</h2>{incoming && <p className="mt-1 text-sm text-slate-400">Requested by {request.requester_name || `user #${request.requester_id}`}</p>}<p className="mt-1 text-sm text-slate-400">Status: <Status value={request.status} /></p></div>{incoming && <div className="flex gap-2">{request.status === 'pending' && <><button disabled={busyId === request.id} onClick={() => updateRequest(request.id, 'approve')} className="rounded bg-emerald-700 px-3 py-2 text-sm disabled:opacity-50">Approve</button><button disabled={busyId === request.id} onClick={() => updateRequest(request.id, 'reject')} className="rounded bg-red-900 px-3 py-2 text-sm disabled:opacity-50">Reject</button></>}{request.status === 'approved' && <button disabled={busyId === request.id} onClick={() => updateRequest(request.id, 'return')} className="rounded bg-indigo-600 px-3 py-2 text-sm disabled:opacity-50">Mark returned</button>}</div>}</div>)}</div>;
  }
  return <div><h1 className="text-3xl font-bold">Dashboard</h1><p className="mt-1 text-sm text-slate-400">Manage your listings and lending activity.</p><div className="mt-6 -mx-4 overflow-x-auto border-b border-slate-700 px-4 sm:mx-0 sm:px-0"><div className="flex min-w-max gap-2">{tabs.map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-3 text-sm ${activeTab === tab ? 'border-b-2 border-indigo-400 text-white' : 'text-slate-400 hover:text-white'}`}>{tab}</button>)}</div></div>{error && <p className="mt-5 rounded border border-red-900 bg-red-950 p-3 text-sm text-red-300">{error}</p>}<section className="mt-5">{loading ? <LoadingState label="Loading dashboard..." /> : activeTab === 'My Listings' ? listingContent() : activeTab === 'My Requests' ? requestsContent(data.mine, false) : requestsContent(data.incoming, true)}</section></div>;
}
