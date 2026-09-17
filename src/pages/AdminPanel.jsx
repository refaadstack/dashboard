import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  TbFolder,
  TbBuildingStore,
  TbPackages,
  TbUsers,
  TbClipboardList,
} from "react-icons/tb";
import AdminNavbar from "../component/AdminNavbar.jsx";
import DashboardCard from "../component/DashboardCard.jsx";
import BoqCharts from "../component/BoqCharts.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const pick = (body, keys) => {
  for (const k of keys) {
    const v = body?.[k] ?? body?.data?.[k];
    if (typeof v === "number") return v;
  }
  return 0;
};

export default function Admin() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ projects: null, vendors: null, items: null, users: null });
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const fetchStats = useCallback(async () => {
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
    const get = async (url, keys) => {
      const res = await fetch(url, { headers, credentials: "include" });
      if (!res.ok) throw new Error(`${url}: ${res.status}`);
      return pick(await res.json(), keys);
    };
    try {
      const [projects, vendors, items, users] = await Promise.all([
        get("/api/projects/stats/summary", ["totalProjects"]),
        get("/api/vendors/stats/summary", ["totalVendors"]),
        get("/api/items/stats/summary", ["totalItems"]),
        get("/api/auth/stats", ["totalUsers"]),
      ]);
      setCounts({ projects, vendors, items, users });
    } catch {
      setFailed(true);
      setCounts({ projects: 0, vendors: 0, items: 0, users: 0 });
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchStats();
  }, [token, fetchStats]);

  if (!token) return null;

  const cards = [
    { title: "Projects", count: counts.projects, loading: counts.projects === null, icon: <TbFolder className="h-5 w-5" />, description: "Total proyek terdaftar", to: "/admin/project" },
    { title: "Vendor", count: counts.vendors, loading: counts.vendors === null, icon: <TbBuildingStore className="h-5 w-5" />, description: "Vendor terdaftar", to: "/admin/vendor" },
    { title: "Items", count: counts.items, loading: counts.items === null, icon: <TbPackages className="h-5 w-5" />, description: "Item di inventaris", to: "/admin/item" },
    { title: "Users", count: counts.users, loading: counts.users === null, icon: <TbUsers className="h-5 w-5" />, description: "Pengguna sistem", to: "/admin/users" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="mx-auto max-w-7xl p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="mt-1 text-gray-600">
            Selamat datang{user?.name ? `, ${user.name}` : ""}. Kelola proyek, BOQ, vendor, item, dan pengguna dari sini.
          </p>
        </div>

        {failed && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Sebagian statistik gagal dimuat. Data yang tampil bisa tidak akurat, coba muat ulang halaman.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <DashboardCard key={c.title} {...c} />
          ))}
        </div>

        <div className="mt-4">
          <DashboardCard
            title="BOQ"
            icon={<TbClipboardList className="h-5 w-5" />}
            description="Kelola BOQ per proyek: section, item, versi, approval, export"
            to="/admin/boq"
          />
        </div>

        <div className="mt-6">
          <h2 className="mb-3 text-lg font-bold text-gray-900">Grafik BOQ</h2>
          <BoqCharts token={token} />
        </div>
      </div>
    </div>
  );
}
