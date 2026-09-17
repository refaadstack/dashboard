import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { TbMenu2, TbX, TbLogout, TbBook2 } from "react-icons/tb";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="text-base font-bold text-gray-900">
          BOQ Dashboard
        </Link>
        <button
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <TbX className="h-5 w-5" /> : <TbMenu2 className="h-5 w-5" />}
        </button>
        <div className="hidden items-center gap-3 md:flex">
          <Link to="/panduan" className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">
            <TbBook2 className="h-4 w-4" />
            Panduan
          </Link>
          {user?.roles === "admin" && (
            <Link to="/admin" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">
              Admin Panel
            </Link>
          )}
          {user ? (
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 active:translate-y-[1px]"
            >
              <TbLogout className="h-4 w-4" />
              Logout
            </button>
          ) : (
            <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">
              Login
            </Link>
          )}
        </div>
      </div>
      {menuOpen && (
        <div className="space-y-1 border-t border-gray-200 px-4 py-3 md:hidden">
          <Link to="/panduan" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">
            <TbBook2 className="h-4 w-4" />
            Panduan
          </Link>
          {user?.roles === "admin" && (
            <Link to="/admin" className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">
              Admin Panel
            </Link>
          )}
          {user ? (
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white"
            >
              <TbLogout className="h-4 w-4" />
              Logout
            </button>
          ) : (
            <Link to="/login" className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
