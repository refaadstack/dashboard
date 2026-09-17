import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import Navbar from "../component/Navbar.jsx";
import BoqCharts from "../component/BoqCharts.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const formatCurrency = (v) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(v) || 0);

export default function Dashboard() {
  const { token, user } = useAuth();
  const axiosConfig = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` }, withCredentials: true }),
    [token]
  );
  const [projects, setProjects] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await axios.get("/api/projects", { ...axiosConfig, params: { limit: 500 } });
      setProjects(res.data?.data?.projects || []);
    } catch {
      setLoadFailed(true);
      setProjects([]);
    }
  }, [axiosConfig]);

  useEffect(() => {
    if (token) fetchProjects();
  }, [token, fetchProjects]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-7xl p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Selamat datang{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="mt-1 text-gray-600">Ringkasan kinerja proyek, anggaran, dan laba BOQ.</p>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-medium text-gray-600">Akun</h2>
            <p className="mt-2 text-lg font-bold text-gray-900">{user?.name || "-"}</p>
            <p className="text-sm text-gray-500">{user?.email || "-"}</p>
            <span className="mt-3 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {user?.roles || "user"}
            </span>
          </div>
        </div>

        <BoqCharts token={token} />

        <div className="mt-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-4">
            <h2 className="font-bold text-gray-900">Daftar Proyek</h2>
          </div>
          {projects === null ? (
            <div className="space-y-2 p-4" aria-label="Memuat">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="p-8 text-center">
              <p className="font-medium text-gray-900">Belum ada proyek</p>
              <p className="mt-1 text-sm text-gray-500">
                {loadFailed
                  ? "Gagal memuat daftar proyek. Coba muat ulang halaman."
                  : "Proyek akan muncul di sini setelah admin menambahkannya."}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {projects.map((pr) => (
                <li key={pr.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                  <div>
                    <p className="font-medium text-gray-900">{pr.name}</p>
                    {pr.description && <p className="text-sm text-gray-500">{pr.description}</p>}
                  </div>
                  <p className="font-bold tabular-nums text-gray-900">{formatCurrency(pr.budget)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
