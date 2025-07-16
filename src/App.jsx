// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './component/ProtectedRoute';
import AdminProtectedRoute from './component/AdminProtectedRoute';

// Import pages
import Login from './pages/Login';
import AdminVendor from './pages/AdminVendor';
import AdminItem from './pages/AdminItem';
import AdminProject from './pages/AdminProject';
import AdminPanel from './pages/AdminPanel';
import AdminBoq from './pages/AdminBoq';
import AdminUser from './pages/AdminUser';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes for Regular Users */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />

            {/* Admin Protected Routes */}
            <Route 
              path="/admin" 
              element={
                <AdminProtectedRoute>
                  <AdminPanel />
                </AdminProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/vendor" 
              element={
                <AdminProtectedRoute>
                  <AdminVendor />
                </AdminProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/item" 
              element={
                <AdminProtectedRoute>
                  <AdminItem />
                </AdminProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/project" 
              element={
                <AdminProtectedRoute>
                  <AdminProject />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/boq" 
              element={
                <AdminProtectedRoute>
                  <AdminBoq />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <AdminProtectedRoute>
                  <AdminUser />
                </AdminProtectedRoute>
              } 
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Catch all route - redirect to login instead of dashboard */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;