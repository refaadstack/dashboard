import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  TbBook2,
  TbLayoutDashboard,
  TbBuildingStore,
  TbPackages,
  TbFolder,
  TbUsers,
  TbClipboardList,
  TbSettings,
  TbMenu2,
  TbX,
  TbLogout,
} from "react-icons/tb";
import { useAuth } from "../context/AuthContext";

const LINKS = [
  { to: "/admin", label: "Dashboard", icon: TbLayoutDashboard, end: true },
  { to: "/admin/vendor", label: "Vendor", icon: TbBuildingStore },
  { to: "/admin/item", label: "Items", icon: TbPackages },
  { to: "/admin/project", label: "Projects", icon: TbFolder },
  { to: "/admin/users", label: "Users", icon: TbUsers },
  { to: "/admin/boq", label: "BOQ", icon: TbClipboardList },
  { to: "/admin/pengaturan", label: "Pengaturan", icon: TbSettings },
  { to: "/panduan", label: "Panduan", icon: TbBook2 },
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors active:translate-y-[1px] ${
    isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
  }`;

export default function AdminNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <span className="text-base font-bold text-gray-900">BOQ Admin</span>
        <button
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 sm:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <TbX className="h-5 w-5" /> : <TbMenu2 className="h-5 w-5" />}
        </button>
        <ul className="hidden items-center gap-1 sm:flex">
          {LINKS.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.end} className={linkClass}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="hidden items-center gap-3 sm:flex">
          <span className="max-w-40 truncate text-sm text-gray-500">{user.email}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 active:translate-y-[1px]"
          >
            <TbLogout className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
      {isOpen && (
        <ul className="space-y-1 border-t border-gray-200 px-4 py-3 sm:hidden">
          {LINKS.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.end} onClick={() => setIsOpen(false)} className={linkClass}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            </li>
          ))}
          <li>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white"
            >
              <TbLogout className="h-4 w-4" />
              Logout ({user.email})
            </button>
          </li>
        </ul>
      )}
    </nav>
  );
}
