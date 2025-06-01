import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function AddEditUser({ user = null, onClose }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'user',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
        address: user.address || '',
        role: user.role || 'user',
      });
    } else {
      setForm({
        name: '',
        email: '',
        password: '',
        address: '',
        role: 'user',
      });
    }
  }, [user]);

  const validateEmail = (email) => {
    return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
  };

  const validate = () => {
    const name = form.name.trim();
    const email = form.email.trim();
    const address = form.address.trim();
    const password = form.password;

    if (!name || name.length < 20 || name.length > 60) {
      toast.error('Name must be between 20 and 60 characters');
      return false;
    }

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (!user) {
      if (!password || password.length < 7 || password.length > 30) {
        toast.error('Password must be between 6 and 30 characters');
        return false;
      }
    } else if (password && (password.length < 6 || password.length > 30)) {
      toast.error('Password must be between 6 and 30 characters');
      return false;
    }

    if (address && address.length > 400) {
      toast.error('Address cannot exceed 400 characters');
      return false;
    }

    if (!['user', 'admin', 'store owner'].includes(form.role)) {
      toast.error('Invalid role selected');
      return false;
    }

    return true;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const method = user ? 'PUT' : 'POST';
      const url = user
        ? `${import.meta.env.VITE_BACKEND_URL}/admin/users/${user.id}`
        : `${import.meta.env.VITE_BACKEND_URL}/admin/users`;

      const bodyData = { ...form };

      if (user && !form.password) {
        delete bodyData.password;
      }

      if (user?.role === 'store owner') {
        bodyData.role = 'store owner';
      } else if (bodyData.role === 'store owner' && !user) {
        bodyData.role = 'user';
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to save user');
      } else {
        toast.success(user ? 'User updated successfully' : 'User added successfully');
        onClose(true);
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow max-w-md w-full space-y-4 border-2 border-orange-400"
      >
        <h2 className="text-xl font-semibold text-orange-600">{user ? 'Edit User' : 'Add User'}</h2>

        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="border border-orange-300 p-2 w-full rounded focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-400"
          required
          minLength={20}
          maxLength={60}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="border border-orange-300 p-2 w-full rounded focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-400"
          required
        />
        <input
          type="password"
          name="password"
          placeholder={user ? 'New Password (leave blank to keep)' : 'Password'}
          value={form.password}
          onChange={handleChange}
          className="border border-orange-300 p-2 w-full rounded focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-400"
          minLength={user ? 0 : 8}
          maxLength={30}
          {...(!user && { required: true })}
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          className="border border-orange-300 p-2 w-full rounded focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-400"
          maxLength={400}
        />

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          disabled={user?.role === 'store owner'}
          className={`border border-orange-300 p-2 w-full rounded focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-400 ${
            user?.role === 'store owner' ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
          required
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
          {user?.role === 'store owner' && <option value="store owner">Store Owner</option>}
        </select>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => onClose(false)}
            className="px-4 py-2 border border-orange-400 text-orange-600 rounded hover:bg-orange-100"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
