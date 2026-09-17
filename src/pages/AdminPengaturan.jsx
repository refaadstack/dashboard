import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import AdminNavbar from "../component/AdminNavbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import Swal from "sweetalert2";

const FIELDS = [
  { key: "company_name", label: "Nama perusahaan", placeholder: "cth: PT Maju Bangun Perkasa" },
  { key: "company_tagline", label: "Tagline (opsional)", placeholder: "cth: Kontraktor Umum & Supplier Material" },
  { key: "company_address", label: "Alamat", placeholder: "cth: Jl. Raya Bekasi KM 21, Cakung, Jakarta Timur" },
  { key: "company_phone", label: "Telepon", placeholder: "cth: 021-4601234" },
  { key: "company_email", label: "Email", placeholder: "cth: info@perusahaan.co.id" },
];

export default function AdminPengaturan() {
  const { token } = useAuth();
  const axiosConfig = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` }, withCredentials: true }),
    [token]
  );
  const [form, setForm] = useState({ company_name: "", company_tagline: "", company_address: "", company_phone: "", company_email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/boqs/settings", axiosConfig);
      setForm({ company_name: "", company_tagline: "", company_address: "", company_phone: "", company_email: "", ...(res.data?.data || {}) });
    } catch {
      Swal.fire("Error", "Gagal memuat pengaturan.", "error");
    } finally {
      setLoading(false);
    }
  }, [axiosConfig]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put("/api/boqs/settings", form, axiosConfig);
      setForm({ ...form, ...(res.data?.data || {}) });
      Swal.fire("Sukses", "Pengaturan kop disimpan.", "success");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Gagal menyimpan.", "error");
    } finally {
      setSaving(false);
    }
  };

  const kopLines = [form.company_name, form.company_tagline, form.company_address,
    [form.company_phone, form.company_email].filter(Boolean).join("  •  ")].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="mx-auto max-w-4xl p-4 sm:p-6">
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Kop</h1>
        <p className="mt-1 text-gray-600">Kop ini tampil di bagian atas setiap export Excel dan PDF BOQ.</p>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <form onSubmit={handleSave} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-gray-900">Data perusahaan</h2>
            <div className="mt-3 space-y-3">
              {FIELDS.map((f) => (
                <div key={f.key}>
                  <label className="mb-1 block text-sm font-medium text-gray-700">{f.label}</label>
                  <input
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    disabled={loading || saving}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
            <button
              type="submit"
              disabled={loading || saving}
              className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400 active:translate-y-[1px]"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </form>

          <div>
            <h2 className="font-bold text-gray-900">Pratinjau kop</h2>
            <div className="mt-3 rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
              {kopLines.length === 0 ? (
                <p className="text-sm text-gray-500">Isi data perusahaan untuk melihat pratinjau kop di sini.</p>
              ) : (
                <>
                  <p className="text-xl font-bold text-gray-900">{kopLines[0]}</p>
                  {kopLines.slice(1).map((l, i) => (
                    <p key={i} className="mt-1 text-sm text-gray-600">{l}</p>
                  ))}
                  <hr className="my-3 border-t-2 border-gray-900" />
                  <p className="text-left text-sm text-gray-500">Judul BOQ, rincian item, dan total tampil di bawah garis ini pada hasil export.</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
