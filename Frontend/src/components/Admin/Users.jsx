import { useEffect, useState } from 'react';
import AddEditUser from './AddEditUser';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/users`);
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to fetch users');
        return;
      }
      const data = await res.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch {
      toast.error('Network error while fetching users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.address?.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter ? user.role === roleFilter : true;
      return matchesSearch && matchesRole;
    });

    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key === 'id') {
          valA = Number(valA);
          valB = Number(valB);
          if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
          if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }

        valA = valA?.toLowerCase?.() || '';
        valB = valB?.toLowerCase?.() || '';
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredUsers(filtered);
  }, [search, roleFilter, users, sortConfig]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/users/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete user');
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success('User deleted successfully');
    } catch {
      toast.error('Network error');
    }
  };

  const handleFormClose = (updated) => {
    setShowForm(false);
    setEditUser(null);
    if (updated) fetchUsers();
  };

  const setSort = (key, direction) => {
    setSortConfig({ key, direction });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <button
          onClick={() => setShowForm(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-md shadow-md transition flex items-center"
        >
          <FaPlus className="mr-2" />
          Add User
        </button>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by Name, Email or Address"
            className="border border-orange-400 focus:border-orange-600 rounded-md p-2 w-full sm:w-72 transition"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-orange-400 focus:border-orange-600 rounded-md p-2 w-full sm:w-48 transition"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="store owner">Store Owner</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto border-2 border-orange-400 rounded-lg shadow-lg">
        <table className="w-full border-collapse border border-orange-400">
          <thead className="bg-orange-200 text-orange-900 font-semibold">
            <tr>
              <th style={{ width: '8%' }} className="border border-orange-400 p-3 text-left">
                <div className="flex items-center space-x-1 select-none">
                  <span>ID</span>
                  <button onClick={() => setSort('id', 'asc')} className="text-sm hover:text-orange-700">▲</button>
                  <button onClick={() => setSort('id', 'desc')} className="text-sm hover:text-orange-700">▼</button>
                </div>
              </th>
              <th style={{ width: '17%' }} className="border border-orange-400 p-3 text-left">
                <div className="flex items-center space-x-1 select-none">
                  <span>Name</span>
                  <button onClick={() => setSort('name', 'asc')} className="text-sm hover:text-orange-700">▲</button>
                  <button onClick={() => setSort('name', 'desc')} className="text-sm hover:text-orange-700">▼</button>
                </div>
              </th>
              <th style={{ width: '20%' }} className="border border-orange-400 p-3 text-left">
                <div className="flex items-center space-x-1 select-none">
                  <span>Email</span>
                  <button onClick={() => setSort('email', 'asc')} className="text-sm hover:text-orange-700">▲</button>
                  <button onClick={() => setSort('email', 'desc')} className="text-sm hover:text-orange-700">▼</button>
                </div>
              </th>
              <th style={{ width: '20%' }} className="border border-orange-400 p-3 text-left">Address</th>
              <th style={{ width: '10%' }} className="border border-orange-400 p-3 text-left">Role</th>
              <th style={{ width: '15%' }} className="border border-orange-400 p-3 text-left whitespace-pre-line">Rating</th>
              <th style={{ width: '10%' }} className="border border-orange-400 p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-6 text-orange-600 font-semibold">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-orange-50 transition">
                  <td className="border border-orange-400 p-3">{user.id}</td>
                  <td className="border border-orange-400 p-3">{user.name}</td>
                  <td className="border border-orange-400 p-3">{user.email}</td>
                  <td className="border border-orange-400 p-3">{user.address || '-'}</td>
                  <td className="border border-orange-400 p-3">{user.role}</td>
                  <td className="border border-orange-400 p-3 whitespace-pre-line text-sm">
                    {user.role === 'store owner' ? (
                      <>
                        {user.rating ?? '-'}
                        {user.stores && user.stores.length > 0 && (
                          <>
                            {'\n'}
                            {user.stores.map((store) => (
                              <div key={store.id || store.name}>
                                <strong>{store.name}:</strong> {store.average_rating ?? '-'}
                              </div>
                            ))}
                          </>
                        )}
                      </>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="border border-orange-400 p-3 text-center">
                    <div className="inline-flex space-x-5 justify-center text-xl text-orange-600">
                      <button
                        onClick={() => {
                          setEditUser(user);
                          setShowForm(true);
                        }}
                        aria-label="Edit User"
                        className="hover:text-orange-800 transition"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        aria-label="Delete User"
                        className="hover:text-red-700 text-red-600 transition"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && <AddEditUser user={editUser} onClose={handleFormClose} />}
    </div>
  );
}
