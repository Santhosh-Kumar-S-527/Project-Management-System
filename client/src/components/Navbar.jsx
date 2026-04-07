import { Menu, Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/projects?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header className="h-16 flex items-center gap-4 px-6 border-b border-white/5 bg-dark-950/50 backdrop-blur-xl flex-shrink-0">
      {/* Menu toggle */}
      <button
        onClick={onMenuClick}
        id="sidebar-toggle"
        className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects, tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all"
          />
        </div>
      </form>

      <div className="flex items-center gap-3 ml-auto">
        {/* Notifications bell */}
        <button className="relative text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse-slow" />
        </button>

        {/* Avatar */}
        <div
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm ring-2 ring-transparent group-hover:ring-primary-500/50 transition-all">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white leading-tight">{user?.name}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
