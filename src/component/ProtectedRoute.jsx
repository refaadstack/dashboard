// src/component/ProtectedRoute.jsx
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Jika sudah selesai loading dan user tidak terautentikasi
    if (!loading && !isAuthenticated) {
      // Tampilkan SweetAlert
      Swal.fire({
        title: 'Akses Ditolak',
        text: 'Anda harus login terlebih dahulu untuk mengakses halaman ini.',
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6',
      });
    }
  }, [isAuthenticated, loading]);

  // Tampilkan loading jika masih checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Jika tidak terautentikasi, redirect ke login dengan state
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Jika terautentikasi, tampilkan component yang diminta
  return children;
};

export default ProtectedRoute;