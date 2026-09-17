// src/pages/AdminRole.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import AdminNavbar from "../component/AdminNavbar.jsx";
import ActionButton from "../component/ActionButton.jsx";
import RowActions from "../component/RowActions.jsx";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext.jsx";

const API = { ROLES: "/api/auth/roles", PERMS: "/api/auth/permissions", USERS: "/api/auth/users" };
const EMPTY = { name: "", label: "", permissions: [] };

export default function AdminRole() {
  const { token } = useAuth();
  const cfg = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` }, withCredentials: true }), [token]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [assignUser, setAssignUser] = useState(null);
  const [assignRoles, setAssignRoles] = useState([]);

  const fetchAll = useCallback(async () => {
    try {
      const [r, p, u] = await Promise.all([
        axios.get(API.ROLES, cfg),
        axios.get(API.PERMS, cfg),
        axios.get(API.USERS, cfg),
      ]);
      setRoles(r.data || []);
      setPermissions(p.data || []);
      setUsers(Array.isArray(u.data) ? u.data : []);
    } catch {
      Swal.fire("Error", "Gagal memuat data peran.", "error");
    }
  }, [cfg]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const groups = useMemo(() => {
    const m = {};
    for (const p of permissions) (m[p.group || "Lainnya"] = m[p.group || "Lainnya"] || []).push(p);
    return m;
  }, [permissions]);

  const togglePerm = (key) => setForm((f) => ({
    ...f,
    permissions: f.permissions.includes(key) ? f.permissions.filter((k) => k !== key) : [...f.permissions, key],
  }));

  const openAdd = () => { setModalMode("add"); setSelected(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (role) => {
    setModalMode("edit"); setSelected(role);
    setForm({ name: role.name, label: role.label || "", permissions: role.permissions || [] });
    setShowModal(true);
  };

  const handleDelete = async (role) => {
    if (role.is_system) { Swal.fire("Error", "Peran sistem tidak dapat dihapus.", "error"); return; }
    const c = await Swal.fire({ title: `Hapus peran ${role.label}?`, icon: "warning", showCancelButton: true, confirmButtonText: "Ya, hapus!", cancelButtonText: "Batal" });
    if (!c.isConfirmed) return;
    try {
      await axios.delete(`${API.ROLES}/${role.id}`, cfg);
      Swal.fire("Terhapus!", "Peran dihapus.", "success");
      fetchAll();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Gagal menghapus peran.", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (modalMode === "add" && !/^[a-z0-9_-]{2,64}$/.test(form.name.trim().toLowerCase())) {
      Swal.fire("Error", "Nama 2-64 karakter: huruf kecil, angka, - atau _.", "error");
      return;
    }
    if (!form.label.trim()) { Swal.fire("Error", "Label wajib diisi.", "error"); return; }
    try {
      if (modalMode === "add") {
        await axios.post(API.ROLES, { name: form.name.trim().toLowerCase(), label: form.label.trim(), permissions: form.permissions }, cfg);
      } else {
        await axios.put(`${API.ROLES}/${selected.id}`, { label: form.label.trim(), permissions: form.permissions }, cfg);
      }
      setShowModal(false);
      fetchAll();
      Swal.fire("Berhasil!", "Peran disimpan.", "success");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Gagal menyimpan peran.", "error");
    }
  };

  const openAssign = async (user) => {
    try {
      const res = await axios.get(`${API.USERS}/${user.id}/roles`, cfg);
      setAssignUser(user);
      setAssignRoles(res.data?.roles || []);
    } catch {
      Swal.fire("Error", "Gagal memuat peran user.", "error");
    }
  };

  const saveAssign = async () => {
    if (assignRoles.length === 0) { Swal.fire("Error", "Pilih minimal satu peran.", "error"); return; }
    try {
      await axios.put(`${API.USERS}/${assignUser.id}/roles`, { roles: assignRoles }, cfg);
      setAssignUser(null);
      fetchAll();
      Swal.fire("Berhasil!", "Peran user diperbarui. Berlaku segera tanpa login ulang.", "success");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Gagal menyimpan peran user.", "error");
    }
  };

  const inputCls = "w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  const isAdminRole = (modalMode === "edit" && selected?.name === "admin");

  return (
    <div>
      <AdminNavbar />
      <div className="p-6 space-y-6">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-2xl font-bold">Peran & Izin</h2>
            <ActionButton label="Tambah Peran" onClick={openAdd} variant="add" />
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Peran sistem (admin, user) tidak bisa dihapus. Peran admin selalu memegang semua izin.
            Perubahan izin berlaku segera tanpa login ulang.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Nama</th>
                  <th className="text-left p-3">Label</th>
                  <th className="text-left p-3">Izin</th>
                  <th className="p-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((r) => (
                  <tr key={r.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-mono">{r.name}{r.is_system && <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">sistem</span>}</td>
                    <td className="p-3 font-medium">{r.label}</td>
                    <td className="p-3 text-gray-600">{r.name === "admin" ? "Semua izin" : `${(r.permissions || []).length} izin`}</td>
                    <td className="p-3 whitespace-nowrap text-center">
                      <RowActions onEdit={() => openEdit(r)} onDelete={() => handleDelete(r)} />
                    </td>
                  </tr>
                ))}
                {roles.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-gray-500">Belum ada peran.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-1">Peran Pengguna</h2>
          <p className="text-sm text-gray-500 mb-4">Satu user boleh memegang beberapa peran. Kolom Akses ikut peran admin.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-50">
                <tr><th className="text-left p-3">Nama</th><th className="text-left p-3">Email</th><th className="p-3">Aksi</th></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{u.name}</td>
                    <td className="p-3 text-gray-600">{u.email}</td>
                    <td className="p-3 text-center">
                      <button onClick={() => openAssign(u)} className="text-blue-600 hover:underline">Atur Peran</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{modalMode === "add" ? "Tambah Peran" : `Ubah Peran ${selected?.name}`}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              {modalMode === "add" && (
                <div>
                  <label className="block text-sm mb-1">Nama (unik, huruf kecil) *</label>
                  <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="cth: estimator" />
                </div>
              )}
              <div>
                <label className="block text-sm mb-1">Label *</label>
                <input className={inputCls} value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="cth: Estimator" disabled={isAdminRole} />
              </div>
              {isAdminRole && <p className="text-xs text-amber-600">Peran admin sistem selalu memegang semua izin.</p>}
              {!isAdminRole && Object.entries(groups).map(([g, list]) => (
                <div key={g} className="border rounded-lg p-3">
                  <p className="text-sm font-semibold mb-2">{g}</p>
                  <div className="space-y-1">
                    {list.map((p) => (
                      <label key={p.key} className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" className="accent-blue-600" checked={form.permissions.includes(p.key)} onChange={() => togglePerm(p.key)} />
                        {p.label} <span className="text-xs text-gray-400 font-mono">{p.key}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {assignUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setAssignUser(null)}>
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-1">Peran: {assignUser.name}</h3>
            <p className="text-sm text-gray-500 mb-3">{assignUser.email}</p>
            <div className="space-y-2">
              {roles.map((r) => (
                <label key={r.id} className="flex items-center gap-2 text-sm text-gray-700 border rounded px-3 py-2">
                  <input
                    type="checkbox"
                    className="accent-blue-600"
                    checked={assignRoles.includes(r.name)}
                    onChange={() => setAssignRoles((a) => a.includes(r.name) ? a.filter((x) => x !== r.name) : [...a, r.name])}
                  />
                  <span className="font-medium">{r.label}</span>
                  <span className="text-xs text-gray-400 font-mono">{r.name}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button onClick={() => setAssignUser(null)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm">Batal</button>
              <button onClick={saveAssign} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
