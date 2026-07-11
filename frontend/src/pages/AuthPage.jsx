import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';

export default function AuthPage({ mode }) {
  const isSignup = mode === 'signup';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth(); const navigate = useNavigate(); const location = useLocation();
  async function handleSubmit(event) {
    event.preventDefault(); setLoading(true); setError('');
    try {
      const payload = isSignup ? form : { email: form.email, password: form.password };
      const response = await api.post(`/auth/${isSignup ? 'signup' : 'login'}`, payload);
      signIn(response.data.token, response.data.user);
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) { setError(err.response?.data?.error || 'Something went wrong. Please try again.'); } finally { setLoading(false); }
  }
  const inputClass = 'mt-1 w-full rounded border border-slate-600 bg-slate-900 p-2 text-white';
  return <div className="mx-auto max-w-md rounded-lg border border-slate-700 bg-slate-800 p-6 shadow-xl">
    <h1 className="text-2xl font-bold">{isSignup ? 'Create your account' : 'Welcome back'}</h1><p className="mt-1 text-sm text-slate-400">{isSignup ? 'Join ToolShare to lend and borrow tools.' : 'Log in to manage your tools and requests.'}</p>
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {isSignup && <label className="block text-sm">Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} /></label>}
      <label className="block text-sm">Email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} /></label>
      <label className="block text-sm">Password<input required type="password" minLength="8" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} /></label>
      {error && <p className="rounded bg-red-950 p-3 text-sm text-red-300">{error}</p>}<button disabled={loading} className="w-full rounded bg-indigo-600 px-4 py-2 font-medium hover:bg-indigo-500 disabled:opacity-50">{loading ? 'Please wait...' : isSignup ? 'Sign up' : 'Log in'}</button>
    </form>
    <p className="mt-5 text-sm text-slate-400">{isSignup ? 'Already have an account?' : 'New to ToolShare?'} <Link className="text-indigo-300 hover:text-indigo-200" to={isSignup ? '/login' : '/signup'}>{isSignup ? 'Log in' : 'Sign up'}</Link></p>
  </div>;
}
