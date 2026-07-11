import { useState, useEffect } from 'react';
import api from './api';

function App() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchListings();
  }, [search]);

  async function fetchListings() {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search) params.search = search;
      const res = await api.get('/listings', { params });
      setListings(res.data);
    } catch (err) {
      setError('Could not load listings. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Browse tools</h1>

      <input
        type="text"
        placeholder="Search listings..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md p-2 rounded bg-slate-800 border border-slate-600 mb-6 text-white"
      />

      {loading && <p className="text-slate-400">Loading...</p>}
      {error && <p className="text-red-400">{error}</p>}
      {!loading && !error && listings.length === 0 && (
        <p className="text-slate-400">No listings yet — create one!</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {listings.map((item) => (
          <div key={item.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <p className="text-slate-400 text-sm mt-1">{item.description}</p>
            <div className="flex gap-2 mt-3 text-xs">
              <span className="bg-slate-700 px-2 py-1 rounded">{item.category}</span>
              <span className="bg-slate-700 px-2 py-1 rounded">{item.condition}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
