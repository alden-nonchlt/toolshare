import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const navClass = ({ isActive }) => `text-sm ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`;

export default function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  function handleSignOut() { signOut(); navigate('/'); }
  return <div className="min-h-screen bg-slate-900 text-white">
    <header className="border-b border-slate-800 bg-slate-900/95"><nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
      <Link to="/" className="text-xl font-bold">ToolShare</Link>
      <div className="flex items-center gap-5"><NavLink to="/" end className={navClass}>Browse</NavLink>
        {user ? <><NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>{user.role === 'admin' && <NavLink to="/admin" className={navClass}>Admin</NavLink>}<span className="hidden text-sm text-slate-500 sm:inline">{user.name}</span><button onClick={handleSignOut} className="text-sm text-slate-400 hover:text-white">Sign out</button></> : <><NavLink to="/login" className={navClass}>Log in</NavLink><Link to="/signup" className="rounded bg-indigo-600 px-3 py-2 text-sm font-medium hover:bg-indigo-500">Sign up</Link></>}
      </div>
    </nav></header>
    <main className="mx-auto max-w-6xl px-6 py-8"><Outlet /></main>
  </div>;
}
