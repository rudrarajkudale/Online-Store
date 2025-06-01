import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, stores: 0, reviews: 0 });
  const [error, setError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/stats`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch stats');
        return res.json();
      })
      .then((data) => {
        setStats(data);
        setError(null);
      })
      .catch(() => {
        setError('Unable to load statistics');
      });
  }, []);

  useEffect(() => {
    if (location.pathname === '/admin') {
      navigate('users');
    }
  }, [location.pathname, navigate]);

  return (
    <div className="space-y-8 px-6 py-8 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-2xl shadow-lg p-8 text-center text-white">
          <h2 className="text-xl font-semibold mb-3 tracking-wide">Total Users</h2>
          <p className="text-4xl font-extrabold">{stats.users}</p>
        </div>
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-2xl shadow-lg p-8 text-center text-white">
          <h2 className="text-xl font-semibold mb-3 tracking-wide">Total Stores</h2>
          <p className="text-4xl font-extrabold">{stats.stores}</p>
        </div>
        <div className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 rounded-2xl shadow-lg p-8 text-center text-white">
          <h2 className="text-xl font-semibold mb-3 tracking-wide">Total Reviews</h2>
          <p className="text-4xl font-extrabold">{stats.reviews}</p>
        </div>
      </div>

      {error && (
        <div className="text-center text-red-600 font-semibold">{error}</div>
      )}

      <nav
        className="flex space-x-6 border-b border-gray-300 pb-3"
        role="tablist"
        aria-label="Admin section navigation"
      >
        <NavLink
          to="users"
          className={({ isActive }) =>
            `px-6 py-3 rounded-t-lg font-semibold transition-colors duration-200 ${
              isActive ? 'bg-orange-600 text-white shadow-lg' : 'bg-gray-200 text-gray-900 hover:bg-orange-400 hover:text-white'
            }`
          }
          role="tab"
          aria-selected={location.pathname.endsWith('/users')}
          tabIndex={location.pathname.endsWith('/users') ? 0 : -1}
        >
          Users
        </NavLink>
        <NavLink
          to="store"
          className={({ isActive }) =>
            `px-6 py-3 rounded-t-lg font-semibold transition-colors duration-200 ${
              isActive ? 'bg-orange-600 text-white shadow-lg' : 'bg-gray-200 text-gray-900 hover:bg-orange-400 hover:text-white'
            }`
          }
          role="tab"
          aria-selected={location.pathname.endsWith('/store')}
          tabIndex={location.pathname.endsWith('/store') ? 0 : -1}
        >
          Stores
        </NavLink>
      </nav>

      <Outlet />
    </div>
  );
}
