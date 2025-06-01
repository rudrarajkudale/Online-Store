import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';

export default function Header() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const [profileOpen, setProfileOpen] = useState(false);
  const [displayName, setDisplayName] = useState('User');

  const toggleProfile = () => setProfileOpen(!profileOpen);

  const logout = () => {
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  const updatePassword = () => {
    setProfileOpen(false);
    navigate('/update-password');
  };

  useEffect(() => {
    const fetchName = async () => {
      if (!user?.id) return;

      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/${user.id}`);
        const data = await res.json();

        if (data.name) {
          const firstWord = data.name.trim().split(' ')[0];
          const trimmed = firstWord.length > 10 ? firstWord.slice(0, 7) + '...' : firstWord;
          setDisplayName(trimmed);
        }
      } catch (err) {
        console.error('Error fetching user name:', err);
      }
    };

    fetchName();
  }, [user?.id]);

  return (
    <header className="flex items-center justify-between bg-white border-b-3 border-orange-500 px-6 py-4 shadow-md z-50">
      <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
        <img src={logo} alt="Logo" className="h-10 w-auto" />
      </div>

      <div className="relative flex items-center space-x-4">
        {user?.role === 'admin' && (
          <button
            onClick={() => navigate('/admin')}
            className="bg-orange-500 text-white px-3 py-2 rounded hover:bg-orange-600"
          >
            Admin Dashboard
          </button>
        )}
        {user?.role === 'store owner' && (
          <button
            onClick={() => navigate('/store-owner')}
            className="bg-orange-500 text-white px-3 py-2 rounded hover:bg-orange-600"
          >
            Store Owner Dashboard
          </button>
        )}

        <div className="relative">
          <button
            onClick={toggleProfile}
            className="border border-orange-500 text-orange-600 bg-transparent px-3 py-2 rounded-full hover:bg-orange-50"
          >
            {displayName}
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white border shadow-lg z-50 border-orange-400 rounded">
              <button
                onClick={updatePassword}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Update Password
              </button>
              <button
                onClick={logout}
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
