import { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, Link } from 'react-router-dom';

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    country: '',
    state: '',
    city: '',
    role: 'user',
  });

  const navigate = useNavigate();

  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  const validate = () => {
    if (formData.name.length < 20 || formData.name.length > 60) {
      toast.error('Name must be between 20 and 60 characters');
      return false;
    }
    if (!emailRegex.test(formData.email)) {
      toast.error('Invalid email format');
      return false;
    }
    if (!formData.country) {
      toast.error('Please select a country');
      return false;
    }
    if (!formData.state.trim()) {
      toast.error('State is required');
      return false;
    }
    if (!formData.city.trim()) {
      toast.error('City is required');
      return false;
    }
    if (!formData.address.trim()) {
      toast.error('Address is required');
      return false;
    }
    if (!formData.password.trim() || formData.password.length < 7) {
      toast.error('Password must be at least 7 characters');
      return false;
    }

    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    try {
      const res = await fetch(`${backendUrl}/user/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        toast.error('Signup failed: ' + errorText);
        return;
      }

      const result = await res.json();

      const { id, role } = result;
      sessionStorage.setItem('user', JSON.stringify({ id, role }));

      toast.success('Signup successful!');
      navigate('/');
    } catch (error) {
      toast.error('Server error occurred. Try again later.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-200 to-orange-400 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-3xl font-bold text-orange-600 mb-5 text-center">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          <input
            type="text"
            name="name"
            onChange={handleChange}
            placeholder="Name (20-60 chars)"
            className="border border-orange-400 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition text-sm"
            required
          />
          <input
            type="email"
            name="email"
            onChange={handleChange}
            placeholder="Email"
            className="border border-orange-400 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition text-sm"
            required
          />
          <select
            name="country"
            onChange={handleChange}
            className="border border-orange-400 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition text-sm"
            required
            value={formData.country}
          >
            <option value="">Select Country</option>
            <option value="India">India</option>
            <option value="USA">USA</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="text"
            name="state"
            onChange={handleChange}
            placeholder="State"
            className="border border-orange-400 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition text-sm"
            required
          />
          <input
            type="text"
            name="city"
            onChange={handleChange}
            placeholder="City"
            className="border border-orange-400 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition text-sm"
            required
          />
          <textarea
            name="address"
            onChange={handleChange}
            placeholder="Address"
            className="border border-orange-400 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition resize-none text-sm"
            rows={2}
            required
          />
          <input
            type="password"
            name="password"
            onChange={handleChange}
            placeholder="Password"
            className="border border-orange-400 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition text-sm"
            required
          />
          <button
            type="submit"
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-md p-2 w-full text-sm transition"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-orange-700">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold hover:underline text-orange-900">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
