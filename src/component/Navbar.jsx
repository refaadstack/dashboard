// src/components/Navbar.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between">
      <div>
        <Link to="/" className="mr-4">Dashboard</Link>
        {user?.roles === 'admin' && (
          <Link to="/admin" className="mr-4">Admin Panel</Link>
        )}
      </div>
      <div>
        {user ? (
          <button onClick={logout} className="bg-red-500 px-3 py-1 rounded">Logout</button>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
