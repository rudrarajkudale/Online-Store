import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    try {
      const res = await fetch(`${backendUrl}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();

      if (!res.ok) {
        if (
          result.error &&
          (result.error.toLowerCase().includes('invalid') ||
            result.error.toLowerCase().includes('credentials'))
        ) {
          toast.error('Invalid credentials');
        } else {
          toast.error(result.error || 'Login failed');
        }
        return;
      }

      const { id, role } = result;
      sessionStorage.setItem('user', JSON.stringify({ id, role }));

      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      toast.error('Server error occurred. Try again later.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-200 to-orange-400 p-6">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8">
        <h2 className="text-3xl font-bold text-orange-600 mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="border border-orange-400 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="border border-orange-400 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
            required
          />
          <button
            type="submit"
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-md p-3 w-full transition"
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-orange-700">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold hover:underline text-orange-900">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
