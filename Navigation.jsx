import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Map, PlusCircle, Search, DollarSign, Package, Share2, User, BookOpen, BarChart2, LogOut, Compass, ClipboardList } from 'lucide-react';
import { useApp } from '../context/AppContext';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/trips', icon: Map, label: 'My Trips' },
  { to: '/create-trip', icon: PlusCircle, label: 'New Trip' },
  { to: '/city-search', icon: Compass, label: 'Cities' },
  { to: '/activity-search', icon: Search, label: 'Activities' },
  { to: '/budget', icon: DollarSign, label: 'Budget' },
  { to: '/packing', icon: Package, label: 'Packing' },
  { to: '/notes', icon: BookOpen, label: 'Notes' },
  { to: '/shared', icon: Share2, label: 'Share' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Navigation() {
  const { state, dispatch, addToast } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    addToast('Logged out successfully');
    navigate('/login');
  };

  return (
    <>
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-56 min-h-screen bg-white border-r border-gray-100 shadow-sm fixed left-0 top-0 z-30">
        <div className="px-5 py-5 border-b border-gray-100">
          <span className="text-2xl font-bold text-amber-500">Travel</span>
          <span className="text-2xl font-bold text-teal-600">oop</span>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors rounded-r-full mr-3 mb-0.5
                ${isActive ? 'bg-amber-50 text-amber-600 border-l-4 border-amber-500' : 'text-gray-600 hover:bg-gray-50 hover:text-teal-600'}`
              }>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
          {state.currentUser?.isAdmin && (
            <NavLink to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors rounded-r-full mr-3 mb-0.5
                ${isActive ? 'bg-amber-50 text-amber-600 border-l-4 border-amber-500' : 'text-gray-600 hover:bg-gray-50 hover:text-teal-600'}`
              }>
              <BarChart2 size={18} />
              Admin
            </NavLink>
          )}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">
              {state.currentUser?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{state.currentUser?.name}</p>
              <p className="text-xs text-gray-400 truncate">{state.currentUser?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors w-full">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Bottom nav — mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 flex justify-around py-2">
        {navItems.slice(0, 5).map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 text-xs font-medium transition-colors
              ${isActive ? 'text-amber-500' : 'text-gray-500'}`
            }>
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
