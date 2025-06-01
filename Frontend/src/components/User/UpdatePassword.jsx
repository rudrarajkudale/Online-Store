import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function UpdatePassword() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const [form, setForm] = useState({ oldPassword: '', newPassword: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user.id) {
      return toast.error('User not logged in');
    }

    if (form.newPassword.length < 8) {
      return toast.error('New password must be at least 8 characters');
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/update-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, id: user.id }),
      });

      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (!res.ok) {
          toast.error(data.error || 'Error occurred');
        } else {
          toast.success(data.message || 'Password updated successfully');
          setForm({ oldPassword: '', newPassword: '' });
          navigate('/');
        }
      } catch {
        // fallback if response not JSON
        if (!res.ok) {
          toast.error(text);
        } else {
          toast.success(text);
          setForm({ oldPassword: '', newPassword: '' });
          navigate('/');
        }
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  return (
    <div className="flex items-center justify-center p-6 pt-20 ">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg max-w-md w-full p-8 space-y-6"
      >
        <h2 className="text-3xl font-bold text-orange-600 text-center">Update Password</h2>

        <input
          type="password"
          name="oldPassword"
          placeholder="Old Password"
          onChange={handleChange}
          value={form.oldPassword}
          className="border border-orange-400 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
          required
        />
        <input
          type="password"
          name="newPassword"
          placeholder="New Password (min 8 chars)"
          onChange={handleChange}
          value={form.newPassword}
          className="border border-orange-400 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
          required
        />
        <button
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-md p-3 w-full transition"
          type="submit"
        >
          Update
        </button>
      </form>
    </div>
  );
}
