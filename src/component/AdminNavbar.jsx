import { Link, useNavigate } from "react-router-dom";

export default function AdminNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between">
      <div className="text-xl font-bold">Admin Panel</div>
      <ul className="flex space-x-4">
        <li>
          <Link to="/admin/vendor" className="hover:underline">
            📦 Vendor
          </Link>
        </li>
        <li>
          <Link to="/admin/users" className="hover:underline">
            👤 Users
          </Link>
        </li>
        <li>
          <button
            onClick={handleLogout}
            className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}
