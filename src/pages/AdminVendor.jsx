// src/pages/AdminVendor.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AdminNavbar from "../component/AdminNavbar.jsx";
import SearchableTable from "../component/SearchableTable.jsx";
import ActionButton from "../component/ActionButton.jsx";
import RowActions from "../component/RowActions.jsx";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE_URL = "/api/vendors";

const CATEGORIES = ["Material", "AC", "Listrik", "Plumbing", "Bangunan", "Jasa", "Lainnya"];
const EMPTY_FORM = { name: "", category: "", contact_person: "", phone: "", email: "", address: "", status: "active" };

export default function AdminVendor() {
  const { token } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchVendors = useCallback(async () => {
    try {
      const res = await axios.get(API_BASE_URL, {
        params: { limit: 500 },
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setVendors(res.data?.data?.vendors || []);
    } catch {
      Swal.fire("Error", "Gagal mengambil data vendor.", "error");
    }
  }, [token]);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  const openAdd = () => {
    setModalMode("add");
    setSelectedVendor(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (vendor) => {
    setModalMode("edit");
    setSelectedVendor(vendor);
    setForm({
      name: vendor.name || "",
      category: vendor.category || "",
      contact_person: vendor.contact_person || "",
      phone: vendor.phone || "",
      email: vendor.email || "",
      address: vendor.address || "",
      status: vendor.status || "active",
    });
    setShowModal(true);
  };

  const handleDelete = async (vendor) => {
    const result = await Swal.fire({
      title: `Yakin hapus vendor ${vendor.name}?`,
      text: "Penugasan vendor di proyek tidak ikut terhapus otomatis dari tampilan BOQ (nama tersimpan sebagai arsip).",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`${API_BASE_URL}/${vendor.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      Swal.fire("Terhapus!", "Vendor berhasil dihapus.", "success");
      fetchVendors();
    } catch {
      Swal.fire("Error", "Gagal menghapus vendor.", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      Swal.fire("Error", "Nama vendor wajib diisi.", "error");
      return;
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      Swal.fire("Error", "Format email tidak valid.", "error");
      return;
    }
    const payload = {
      name: form.name.trim(),
      category: form.category.trim() || null,
      contact_person: form.contact_person.trim() || null,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      address: form.address.trim() || null,
      status: form.status,
    };
    try {
      const config = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };
      if (modalMode === "add") {
        await axios.post(API_BASE_URL, payload, config);
      } else {
        await axios.put(`${API_BASE_URL}/${selectedVendor.id}`, payload, config);
      }
      setShowModal(false);
      fetchVendors();
      Swal.fire("Berhasil!", modalMode === "add" ? "Vendor berhasil ditambahkan." : "Vendor berhasil diupdate.", "success");
    } catch (err) {
      const details = err.response?.data?.errors?.map((x) => x.message).join(" ");
      Swal.fire("Error", details || err.response?.data?.message || "Gagal menyimpan vendor.", "error");
    }
  };

  const inputCls = "w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  return (
    <div>
      <AdminNavbar />
      <div className="p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-2xl font-bold">Daftar Vendor</h2>
            <ActionButton label="Tambah" onClick={openAdd} variant="add" />
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Master vendor dipakai lintas proyek (mis. vendor AC, pemasok material). Tugaskan vendor ke proyek lewat halaman Proyek, lalu pilih vendornya di tiap item BOQ beserta harga belinya.
          </p>

          <SearchableTable
            data={vendors.map((vendor) => ({
              ...vendor,
              contact: [vendor.contact_person, vendor.phone].filter(Boolean).join(" • ") || "-",
              statusBadge: (
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${vendor.status === "active" ? "bg-green-200 text-green-900" : "bg-gray-200 text-gray-700"}`}>
                  {vendor.status === "active" ? "Aktif" : "Nonaktif"}
                </span>
              ),
              actions: (
                <RowActions onEdit={() => openEdit(vendor)} onDelete={() => handleDelete(vendor)} />
              ),
            }))}
            columns={[
              { key: "name", label: "Nama" },
              { key: "category", label: "Kategori" },
              { key: "contact", label: "Kontak" },
              { key: "email", label: "Email" },
              { key: "statusBadge", label: "Status" },
            ]}
          />
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{modalMode === "add" ? "Tambah Vendor" : "Edit Vendor"}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Nama vendor *</label>
                <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="cth: PT Sinar AC" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Kategori</label>
                  <input className={inputCls} list="vendor-categories" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="cth: AC" />
                  <datalist id="vendor-categories">
                    {CATEGORIES.map((c) => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm mb-1">Status</label>
                  <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Kontak person</label>
                  <input className={inputCls} value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Telepon</label>
                  <input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input className={inputCls} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm mb-1">Alamat</label>
                <input className={inputCls} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">{modalMode === "add" ? "Simpan" : "Update"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
