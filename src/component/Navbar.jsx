import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="bg-gray-800 text-white p-4 flex flex-wrap items-center justify-between">
      <div className="flex items-center">
        <Link to="/" className="mr-4 font-bold text-lg">Dashboard</Link>
        <button
          className="block md:hidden focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6 fill-current"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M18.364 5.636a1 1 0 00-1.414-1.414L12 9.172 7.05 4.222a1 1 0 10-1.414 1.414L10.828 12l-5.192 5.192a1 1 0 101.414 1.414L12 14.828l4.95 4.95a1 1 0 001.414-1.414L13.172 12l5.192-5.192z"
              />
            ) : (
              <path
                fillRule="evenodd"
                d="M4 5h16v2H4V5zm0 6h16v2H4v-2zm0 6h16v2H4v-2z"
              />
            )}
          </svg>
        </button>
      </div>

      <div className={`w-full md:flex md:items-center md:w-auto ${menuOpen ? 'block' : 'hidden'}`}>
        <div className="flex flex-col md:flex-row md:space-x-4">
          {user?.roles === 'admin' && (
            <Link to="/admin" className="block mt-2 md:mt-0 hover:underline">
              Admin Panel
            </Link>
          )}
          {user ? (
            <button
              onClick={logout}
              className="bg-red-500 px-3 py-1 rounded mt-2 md:mt-0"
            >
              Logout
            </button>
          ) : (
            <Link to="/login" className="block mt-2 md:mt-0 hover:underline">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
