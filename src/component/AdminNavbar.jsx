import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AdminNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeMenu = () => setIsOpen(false);

  if (!user) {
    return null; // or return a minimal navbar or redirect
  }

  return (
    <nav className="bg-gray-800 text-white px-6 py-4 flex flex-wrap items-center justify-between">
      <div className="text-xl font-bold">Admin Panel</div>

      {/* Burger icon */}
      <button
        className="sm:hidden focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Desktop menu */}
      <ul className={`${isOpen ? 'flex' : 'hidden'} flex-col space-y-2 w-full sm:flex sm:flex-row sm:space-x-4 sm:space-y-0 sm:w-auto mt-2 sm:mt-0 items-start`}>
        <li><Link to="/admin/vendor" onClick={closeMenu} className="block hover:underline">📦 Vendor</Link></li>
        <li><Link to="/admin/item" onClick={closeMenu} className="block hover:underline">📋 Items</Link></li>
        <li><Link to="/admin/project" onClick={closeMenu} className="block hover:underline">📁 Projects</Link></li>
        <li><Link to="/admin/users" onClick={closeMenu} className="block hover:underline">👤 Users</Link></li>
        <li>
          <button
            onClick={() => {
              closeMenu();
              handleLogout();
            }}
            className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 w-full sm:w-auto text-left sm:text-center"
          >
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}
