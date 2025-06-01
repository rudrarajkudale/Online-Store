import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Signup from './components/User/Signup';
import Login from './components/User/Login';
import AdminDashboard from './components/Admin/AdminDashboard';
import Users from './components/Admin/Users';
import Store from './components/Admin/Store';
import Stores from './components/Store/Store';
import StoreDetails from './components/Store/StoreDetails';
import StoreOwnerDashboard from './components/ShopOwner/StoreOwnerDashboard';
import UpdatePassword from './components/User/UpdatePassword';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Header from './components/Includes/Header';
import Footer from './components/Includes/Footer';
import './App.css';
import './index.css';

function Layout({ children }) {
  const location = useLocation();
  const hideLayout = location.pathname === '/login' || location.pathname === '/signup';
  if (hideLayout) return children;
  return (
    <div className="min-h-screen pb-16">
      <Header />
      <div className="p-4">{children}</div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><Stores /></ProtectedRoute>} />
          <Route path="/stores" element={<ProtectedRoute><Stores /></ProtectedRoute>} />
          <Route path="/store/:id" element={<ProtectedRoute><StoreDetails /></ProtectedRoute>} />
          <Route path="/store-owner" element={<ProtectedRoute allowedRoles={['store owner']}><StoreOwnerDashboard /></ProtectedRoute>} />
          <Route path="/update-password" element={<ProtectedRoute><UpdatePassword /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} >
            <Route path="users" element={<Users />} />
            <Route path="store" element={<Store />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

export default App;
