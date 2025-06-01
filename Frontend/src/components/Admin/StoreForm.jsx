import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const ShopForm = ({ store, onClose }) => {
  const [form, setForm] = useState({
    name: '',
    address: '',
    user_id: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (store) {
      setForm({
        name: store.name || '',
        address: store.address || '',
        user_id:
          store.user_id !== null && store.user_id !== undefined
            ? String(store.user_id)
            : '',
      });
    } else {
      setForm({
        name: '',
        address: '',
        user_id: '',
      });
    }
  }, [store]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'user_id' && value !== '') {
      if (!/^\d*$/.test(value)) return; // allow only digits
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const name = form.name.trim();
    const address = form.address.trim();
    const userId = form.user_id.trim();

    if (!name || name.length < 20 || name.length > 60) {
      toast.error('Name must be between 20 and 60 characters');
      return false;
    }

    if (address.length > 400) {
      toast.error('Address cannot exceed 400 characters');
      return false;
    }

    if (userId) {
      const userIdNum = Number(userId);
      if (isNaN(userIdNum) || userIdNum < 1) {
        toast.error('User ID must be a positive number');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const method = store ? 'PUT' : 'POST';
      const url = store
        ? `${import.meta.env.VITE_BACKEND_URL}/admin/stores/${store.id}`
        : `${import.meta.env.VITE_BACKEND_URL}/admin/stores`;

      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
        user_id: form.user_id ? Number(form.user_id) : null,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || 'Failed to save store');
      } else {
        toast.success(store ? 'Store updated successfully' : 'Store added successfully');
        onClose(true);
      }
    } catch {
      toast.error('Network error, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow max-w-md w-full space-y-4 border-2 border-orange-400"
        noValidate
      >
        <h2 className="text-xl font-semibold text-orange-600">{store ? 'Edit Store' : 'Add Store'}</h2>

        <input
          type="text"
          name="name"
          placeholder="Store Name"
          value={form.name}
          onChange={handleChange}
          required
          minLength={20}
          maxLength={60}
          className="border border-orange-300 p-2 w-full rounded focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-400"
          autoComplete="off"
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          maxLength={400}
          className="border border-orange-300 p-2 w-full rounded focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-400"
          autoComplete="off"
        />
        <input
          type="number"
          name="user_id"
          placeholder="User ID (optional)"
          value={form.user_id}
          onChange={handleChange}
          min={1}
          className="border border-orange-300 p-2 w-full rounded focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-400"
          autoComplete="off"
          step="1"
          inputMode="numeric"
          pattern="[0-9]*"
        />

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => onClose(false)}
            disabled={loading}
            className="px-4 py-2 border border-orange-400 text-orange-600 rounded hover:bg-orange-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShopForm;
