import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';

export default function AuthPage({ mode }) {
  const isSignup = mode === 'signup';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth(); const navigate = useNavigate(); const location = useLocation();
  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (isSignup && !form.name.trim()) nextErrors.name = 'Enter your name.';
    if (!form.email.trim()) nextErrors.email = 'Enter your email address.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.';
    if (!form.password) nextErrors.password = 'Enter your password.';
    else if (isSignup && form.password.length < 8) nextErrors.password = 'Use at least 8 characters.';
    setFieldErrors(nextErrors); setError('');
    if (Object.keys(nextErrors).length) return;
    setLoading(true);
    try {
      const payload = isSignup ? form : { email: form.email, password: form.password };
      const response = await api.post(`/auth/${isSignup ? 'signup' : 'login'}`, payload);
      signIn(response.data.token, response.data.user);
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) { setError(err.response?.data?.error || 'Something went wrong. Please try again.'); } finally { setLoading(false); }
  }
  const inputClass = (field) => `mt-1 w-full rounded border bg-slate-900 p-2.5 text-white placeholder:text-slate-500 focus:outline-none ${fieldErrors[field] ? 'border-red-500 focus:border-red-400' : 'border-slate-600 focus:border-indigo-400'}`;
  function updateField(field, value) { setForm({ ...form, [field]: value }); setFieldErrors({ ...fieldErrors, [field]: '' }); }
  return <div className="mx-auto max-w-md rounded-lg border border-slate-700 bg-slate-800 p-5 shadow-xl sm:p-6">
    <h1 className="text-2xl font-bold">{isSignup ? 'Create your account' : 'Welcome back'}</h1><p className="mt-1 text-sm text-slate-400">{isSignup ? 'Join ToolShare to lend and borrow tools.' : 'Log in to manage your tools and requests.'}</p>
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {isSignup && <label className="block text-sm">Name<input aria-invalid={Boolean(fieldErrors.name)} value={form.name} onChange={(e) => updateField('name', e.target.value)} className={inputClass('name')} />{fieldErrors.name && <span className="mt-1 block text-xs text-red-300">{fieldErrors.name}</span>}</label>}
      <label className="block text-sm">Email<input aria-invalid={Boolean(fieldErrors.email)} type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} className={inputClass('email')} />{fieldErrors.email && <span className="mt-1 block text-xs text-red-300">{fieldErrors.email}</span>}</label>
      <label className="block text-sm">Password<input aria-invalid={Boolean(fieldErrors.password)} type="password" value={form.password} onChange={(e) => updateField('password', e.target.value)} className={inputClass('password')} />{fieldErrors.password && <span className="mt-1 block text-xs text-red-300">{fieldErrors.password}</span>}</label>
      {error && <p className="rounded border border-red-900 bg-red-950 p-3 text-sm text-red-300">{error}</p>}<button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded bg-indigo-600 px-4 py-2.5 font-medium hover:bg-indigo-500 disabled:opacity-50">{loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-white" />}{loading ? 'Please wait...' : isSignup ? 'Sign up' : 'Log in'}</button>
    </form>
    <p className="mt-5 text-sm text-slate-400">{isSignup ? 'Already have an account?' : 'New to ToolShare?'} <Link className="text-indigo-300 hover:text-indigo-200" to={isSignup ? '/login' : '/signup'}>{isSignup ? 'Log in' : 'Sign up'}</Link></p>
  </div>;
}
