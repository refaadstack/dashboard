import { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
} from "recharts";

const formatCurrency = (v) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(v) || 0);

const formatShort = (v) => {
  const n = Number(v) || 0;
  if (Math.abs(n) >= 1e9) return `Rp${(n / 1e9).toLocaleString("id-ID", { maximumFractionDigits: 1 })} M`;
  if (Math.abs(n) >= 1e6) return `Rp${(n / 1e6).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
  if (Math.abs(n) >= 1e3) return `Rp${(n / 1e3).toLocaleString("id-ID", { maximumFractionDigits: 1 })} rb`;
  return `Rp${n}`;
};

const shortName = (s, n = 14) => (s && s.length > n ? `${s.slice(0, n - 1)}…` : s || "-");

const STATUS_LABEL = { draft: "Draft", submitted: "Diajukan", approved: "Disetujui", rejected: "Ditolak" };
const STATUS_COLOR = { draft: "#9ca3af", submitted: "#fbbf24", approved: "#22c55e", rejected: "#ef4444" };

const idrTooltip = (value, name) => [formatCurrency(value), name];

// Grafik ringkas BOQ lintas proyek: anggaran vs nilai BOQ, status BOQ, laba per proyek.
// Dipakai di halaman Dashboard dan Admin Panel.
export default function BoqCharts({ token }) {
  const axiosConfig = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` }, withCredentials: true }),
    [token]
  );
  const [projects, setProjects] = useState(null);
  const [stats, setStats] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const res = await axios.get("/api/projects", { ...axiosConfig, params: { limit: 500 } });
      const list = res.data?.data?.projects || [];
      setProjects(list);
      const perProject = await Promise.all(list.map(async (p) => {
        try {
          const bq = await axios.get("/api/boqs", { ...axiosConfig, params: { project_id: p.id } });
          const boqs = bq.data?.data || [];
          const details = await Promise.all(boqs.map(async (b) => {
            try {
              const d = await axios.get(`/api/boqs/${b.id}`, axiosConfig);
              return d.data?.data || null;
            } catch { return null; }
          }));
          const ok = details.filter(Boolean);
          let sell = 0, cost = 0, unknown = 0;
          const statusCount = { draft: 0, submitted: 0, approved: 0, rejected: 0 };
          for (const d of ok) {
            const t = d.totals || {};
            sell += Number(t.grandTotal) || 0;
            cost += Number(t.totalCost) || 0;
            unknown += Number(t.unknownCostCount) || 0;
            const st = d.boq?.status;
            if (statusCount[st] !== undefined) statusCount[st] += 1;
          }
          return {
            project_id: p.id, name: p.name, budget: Number(p.budget) || 0,
            boqCount: ok.length, sell, cost, unknown,
            profit: unknown === 0 && ok.length > 0 ? sell - cost : null,
            statusCount,
          };
        } catch { return null; }
      }));
      setStats(perProject.filter(Boolean));
    } catch {
      setLoadFailed(true);
      setProjects([]);
      setStats([]);
    }
  }, [axiosConfig]);

  useEffect(() => {
    if (token) fetchAll();
  }, [token, fetchAll]);

  const summary = useMemo(() => {
    if (!stats) return null;
    const totalBudget = (projects || []).reduce((a, p) => a + (Number(p.budget) || 0), 0);
    const totalSell = stats.reduce((a, s) => a + s.sell, 0);
    const totalCost = stats.reduce((a, s) => a + s.cost, 0);
    const totalUnknown = stats.reduce((a, s) => a + s.unknown, 0);
    const withBoq = stats.filter((s) => s.boqCount > 0);
    const totalProfit = withBoq.length > 0 && withBoq.every((s) => s.unknown === 0) ? totalSell - totalCost : null;
    const statusTotal = { draft: 0, submitted: 0, approved: 0, rejected: 0 };
    for (const s of stats) for (const k of Object.keys(statusTotal)) statusTotal[k] += s.statusCount[k];
    return { totalBudget, totalSell, totalUnknown, totalProfit, statusTotal };
  }, [stats, projects]);

  const budgetVsBoq = useMemo(() => {
    if (!stats) return [];
    return [...stats]
      .sort((a, b) => b.budget - a.budget)
      .slice(0, 10)
      .map((s) => ({ name: shortName(s.name), Anggaran: s.budget, "Nilai BOQ": s.sell, full: s.name }));
  }, [stats]);

  const profitPerProject = useMemo(() => {
    if (!stats) return [];
    return stats
      .filter((s) => s.profit !== null)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10)
      .map((s) => ({ name: shortName(s.name), "Laba Kotor": s.profit, full: s.name }));
  }, [stats]);

  const statusPie = useMemo(() => {
    if (!summary) return [];
    return Object.entries(summary.statusTotal)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({ name: STATUS_LABEL[k], value: v, color: STATUS_COLOR[k] }));
  }, [summary]);

  const loading = projects === null || stats === null;

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Proyek", value: loading ? "…" : String(projects.length), sub: "proyek terdaftar" },
          { label: "Total Anggaran", value: loading ? "…" : formatCurrency(summary?.totalBudget), sub: "budget seluruh proyek" },
          { label: "Total Nilai BOQ", value: loading ? "…" : formatCurrency(summary?.totalSell), sub: "harga jual seluruh BOQ" },
          {
            label: "Total Laba Kotor",
            value: loading ? "…" : (summary?.totalProfit === null ? "Belum lengkap" : formatCurrency(summary.totalProfit)),
            sub: summary && summary.totalProfit === null
              ? `${summary.totalUnknown} item tanpa harga beli`
              : "seluruh harga beli terisi",
            accent: true,
          },
        ].map((c) => (
          <div key={c.label} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-medium text-gray-600">{c.label}</h2>
            <p className={`mt-2 text-2xl font-bold tabular-nums ${c.accent && summary?.totalProfit !== null ? "text-green-700" : "text-gray-900"}`}>{c.value}</p>
            <p className="mt-1 text-sm text-gray-500">{c.sub}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[0, 1].map((i) => <div key={i} className="h-72 animate-pulse rounded-lg bg-white shadow-sm" />)}
        </div>
      ) : loadFailed ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
          Gagal memuat data grafik. Coba muat ulang halaman.
        </div>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="font-bold text-gray-900">Anggaran vs Nilai BOQ per Proyek</h2>
              <p className="mb-2 text-sm text-gray-500">10 proyek terbesar berdasarkan anggaran.</p>
              {budgetVsBoq.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-500">Belum ada data.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={budgetVsBoq} margin={{ top: 8, right: 8, left: 8, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-20} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={formatShort} tick={{ fontSize: 11 }} width={80} />
                    <Tooltip formatter={idrTooltip} labelFormatter={(_, p) => p?.[0]?.payload?.full || ""} />
                    <Legend />
                    <Bar dataKey="Anggaran" fill="#3b82f6" />
                    <Bar dataKey="Nilai BOQ" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="font-bold text-gray-900">Status BOQ</h2>
              <p className="mb-2 text-sm text-gray-500">Distribusi status seluruh BOQ.</p>
              {statusPie.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-500">Belum ada BOQ.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={statusPie} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2} label={({ name, value }) => `${name}: ${value}`}>
                      {statusPie.map((s) => <Cell key={s.name} fill={s.color} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="font-bold text-gray-900">Laba Kotor per Proyek</h2>
            <p className="mb-2 text-sm text-gray-500">
              Hanya proyek yang seluruh harga belinya sudah terisi.
              {stats.some((s) => s.boqCount > 0 && s.unknown > 0) && " Proyek dengan harga beli belum lengkap tidak ditampilkan."}
            </p>
            {profitPerProject.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-500">Belum ada laba yang bisa dihitung — lengkapi harga beli di tiap item BOQ.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={profitPerProject} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={formatShort} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
                  <Tooltip formatter={idrTooltip} labelFormatter={(_, p) => p?.[0]?.payload?.full || ""} />
                  <Bar dataKey="Laba Kotor" fill="#16a34a" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
}

BoqCharts.propTypes = {
  token: PropTypes.string,
};
