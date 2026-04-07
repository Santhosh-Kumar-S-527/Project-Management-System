import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, FolderKanban, CheckSquare,
  Users, User, LogOut, ChevronLeft, Zap
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/projects', icon: FolderKanban, label: 'Projects' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const adminItems = [
  { path: '/users', icon: Users, label: 'User Management' },
];

export default function Sidebar({ open, setOpen }) {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={clsx(
          'fixed lg:relative z-30 lg:z-auto h-full flex flex-col',
          'bg-dark-950/95 border-r border-white/5 backdrop-blur-xl',
          'transition-all duration-300 ease-in-out',
          open ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:w-0 lg:translate-x-0 lg:overflow-hidden'
        )}
        style={{ width: open ? '260px' : '0', minWidth: open ? '260px' : '0' }}
      >
        <div className="flex flex-col h-full p-4 overflow-hidden" style={{ minWidth: '228px' }}>
          {/* Logo */}
          <div className="flex items-center justify-between mb-8 mt-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                <Zap size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg leading-tight">ProManage</h1>
                <p className="text-slate-500 text-xs">Project Manager</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="lg:flex hidden text-slate-500 hover:text-white transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
          </div>

          {/* User Info */}
          <div className="glass-card p-3 mb-6 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
              <span className={clsx(
                'text-xs px-2 py-0.5 rounded-full font-medium',
                user?.role === 'Admin' && 'bg-purple-500/20 text-purple-300',
                user?.role === 'Manager' && 'bg-primary-500/20 text-primary-300',
                user?.role === 'User' && 'bg-green-500/20 text-green-300',
              )}>
                {user?.role}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-4 mb-2">Main Menu</p>
            {navItems.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) => clsx('nav-link', isActive && 'active')}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}

            {user?.role === 'Admin' && (
              <>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-4 mb-2 mt-4">Admin</p>
                {adminItems.map(({ path, icon: Icon, label }) => (
                  <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) => clsx('nav-link', isActive && 'active')}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </NavLink>
                ))}
              </>
            )}
          </nav>

          {/* Logout */}
          <button
            onClick={logout}
            className="nav-link text-red-400 hover:text-red-300 hover:bg-red-500/10 mt-2 w-full"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
