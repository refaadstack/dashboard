// src/component/AdminProtectedRoute.jsx
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Jika sudah selesai loading dan user tidak terautentikasi
    if (!isLoading && !isAuthenticated) {
      Swal.fire({
        title: 'Akses Ditolak',
        text: 'Anda harus login terlebih dahulu untuk mengakses halaman ini.',
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6',
      });
    }
    
    // Jika user authenticated tapi bukan admin
    if (!isLoading && isAuthenticated && user && user.roles !== 'admin') {
      Swal.fire({
        title: 'Akses Ditolak',
        text: 'Anda tidak memiliki akses untuk mengakses halaman admin.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#d33',
      });
    }
  }, [isAuthenticated, user, isLoading]);

  // Tampilkan loading jika masih checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Jika tidak terautentikasi, redirect ke login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Jika bukan admin, redirect ke dashboard
  if (user && user.roles !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Jika admin, tampilkan component yang diminta
  return children;
};

export default AdminProtectedRoute;