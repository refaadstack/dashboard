import { Link } from "react-router-dom";
import ItemPicker from "../component/ItemPicker.jsx";
import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import AdminNavbar from "../component/AdminNavbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import Swal from "sweetalert2";

const API = {
  PROJECTS: "/api/projects",
  BOQS: "/api/boqs",
  ITEMS: "/api/items",
  VENDORS: "/api/vendors",
};

const STATUS_LABEL = { draft: "Draft", submitted: "Diajukan", approved: "Disetujui", rejected: "Ditolak" };
const STATUS_COLOR = {
  draft: "bg-gray-200 text-gray-800",
  submitted: "bg-yellow-200 text-yellow-900",
  approved: "bg-green-200 text-green-900",
  rejected: "bg-red-200 text-red-900",
};

const LoadingSpinner = ({ size = "sm" }) => (
  <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${size === "sm" ? "h-4 w-4" : "h-8 w-8"}`}></div>
);

export default function AdminBoq() {
  const { token, user: me } = useAuth();
  const axiosConfig = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  }), [token]);

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [boqs, setBoqs] = useState([]);
  const [selectedBoqId, setSelectedBoqId] = useState("");
  const [detail, setDetail] = useState(null);
  const [versions, setVersions] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [masterItems, setMasterItems] = useState([]);
  const [loading, setLoading] = useState({ projects: false, boqs: false, detail: false, busy: false });

  const [newBoq, setNewBoq] = useState({ name: "", description: "" });
  const [newSection, setNewSection] = useState("");
  const [itemForm, setItemForm] = useState({ section_id: "", item_id: "", name: "", unit: "unit", volume: "", unit_price: "", buy_price: "", vendor_id: "", description: "" });
  const [projectVendors, setProjectVendors] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("pdf");
  const [exportOpts, setExportOpts] = useState({ company: true, project: true, ids: true, sections: true, items: true, total: true, cost: false });

  const handleError = useCallback((err, fallback = "Terjadi kesalahan") => {
    const message = err.response?.data?.message || err.message || fallback;
    Swal.fire("Error", message, "error");
  }, []);

  const fetchProjects = useCallback(async () => {
    setLoading((p) => ({ ...p, projects: true }));
    try {
      const res = await axios.get(API.PROJECTS, axiosConfig);
      setProjects(res.data?.data?.projects || []);
    } catch (err) { handleError(err); }
    finally { setLoading((p) => ({ ...p, projects: false })); }
  }, [axiosConfig, handleError]);

  const fetchBoqs = useCallback(async (projectId) => {
    if (!projectId) { setBoqs([]); return; }
    setLoading((p) => ({ ...p, boqs: true }));
    try {
      const res = await axios.get(`${API.BOQS}?project_id=${projectId}`, axiosConfig);
      const list = res.data?.data || [];
      setBoqs(list);
      setSelectedBoqId((prev) => {
        if (list.length === 0) return "";
        if (prev && list.some((b) => String(b.id) === String(prev))) return prev;
        return String(list[0].id);
      });
      if (list.length === 0) setDetail(null);
    } catch (err) { handleError(err); }
    finally { setLoading((p) => ({ ...p, boqs: false })); }
  }, [axiosConfig, handleError]);

  const fetchDetail = useCallback(async (boqId) => {
    if (!boqId) { setDetail(null); return; }
    setLoading((p) => ({ ...p, detail: true }));
    try {
      const [d, v, a] = await Promise.all([
        axios.get(`${API.BOQS}/${boqId}`, axiosConfig),
        axios.get(`${API.BOQS}/${boqId}/versions`, axiosConfig),
        axios.get(`${API.BOQS}/${boqId}/approvals`, axiosConfig),
      ]);
      setDetail(d.data?.data || null);
      setVersions(v.data?.data || []);
      setApprovals(a.data?.data || []);
    } catch (err) { handleError(err); }
    finally { setLoading((p) => ({ ...p, detail: false })); }
  }, [axiosConfig, handleError]);

  const fetchMasterItems = useCallback(async () => {
    try {
      const res = await axios.get(API.ITEMS, { ...axiosConfig, params: { limit: 500 } });
      setMasterItems(res.data?.data?.items || []);
    } catch { /* master item opsional */ }
  }, [axiosConfig]);

  const fetchAllVendors = useCallback(async () => {
    try {
      const res = await axios.get(API.VENDORS, { ...axiosConfig, params: { limit: 500, status: "active" } });
      setAllVendors(res.data?.data?.vendors || []);
    } catch { /* vendor opsional */ }
  }, [axiosConfig]);

  const fetchProjectVendors = useCallback(async (projectId) => {
    if (!projectId) { setProjectVendors([]); return; }
    try {
      const res = await axios.get(`${API.PROJECTS}/${projectId}/vendors`, axiosConfig);
      setProjectVendors(res.data?.data || []);
    } catch { setProjectVendors([]); /* vendor service/proyek boleh gagal, BOQ tetap jalan */ }
  }, [axiosConfig]);

  useEffect(() => { fetchProjects(); fetchMasterItems(); fetchAllVendors(); }, [fetchProjects, fetchMasterItems, fetchAllVendors]);
  useEffect(() => {
    setSelectedBoqId("");
    setDetail(null);
    fetchBoqs(selectedProjectId);
    fetchProjectVendors(selectedProjectId);
  }, [selectedProjectId, fetchBoqs, fetchProjectVendors]);
  useEffect(() => { fetchDetail(selectedBoqId); }, [selectedBoqId, fetchDetail]);

  const refreshAll = useCallback(async () => {
    await fetchBoqs(selectedProjectId);
    await fetchDetail(selectedBoqId);
  }, [fetchBoqs, fetchDetail, selectedProjectId, selectedBoqId]);

  const locked = detail && !["draft", "rejected"].includes(detail.boq.status);

  const formatCurrency = (v) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(v) || 0);

  const sectionName = useCallback((id) => {
    if (!id) return "-";
    return detail?.sections?.find((s) => s.id === id)?.name || "-";
  }, [detail]);

  // Opsi vendor: utamakan vendor yang ditugaskan ke proyek; fallback ke semua vendor aktif.
  const vendorOptions = useMemo(() => {
    if (projectVendors.length > 0) {
      return projectVendors.map((pv) => ({ id: pv.vendor_id, name: pv.vendor_name, scope: pv.scope }));
    }
    return allVendors.map((v) => ({ id: v.id, name: v.name, scope: v.category }));
  }, [projectVendors, allVendors]);

  const vendorNameOf = useCallback((formVendorId, fallback) => {
    if (!formVendorId) return fallback ?? null;
    const hit = vendorOptions.find((v) => String(v.id) === String(formVendorId));
    return hit?.name || fallback || null;
  }, [vendorOptions]);

  const vendorLabel = useCallback((it) => {
    if (it?.vendor_name) return it.vendor_name;
    const hit = vendorOptions.find((v) => String(v.id) === String(it?.vendor_id));
    return hit?.name || "-";
  }, [vendorOptions]);

  // ---- BOQ ----
  const handleCreateBoq = async (e) => {
    e.preventDefault();
    if (!newBoq.name.trim() || !selectedProjectId) return;
    setLoading((p) => ({ ...p, busy: true }));
    try {
      const res = await axios.post(API.BOQS, { project_id: Number(selectedProjectId), name: newBoq.name.trim(), description: newBoq.description || null }, axiosConfig);
      setNewBoq({ name: "", description: "" });
      await fetchBoqs(selectedProjectId);
      setSelectedBoqId(String(res.data?.data?.id || ""));
      Swal.fire("Sukses", "BOQ berhasil dibuat", "success");
    } catch (err) { handleError(err); }
    finally { setLoading((p) => ({ ...p, busy: false })); }
  };

  const handleDeleteBoq = async () => {
    const confirm = await Swal.fire({ title: "Hapus BOQ?", text: "Seluruh section, item, versi ikut terhapus.", icon: "warning", showCancelButton: true, confirmButtonText: "Hapus", cancelButtonText: "Batal" });
    if (!confirm.isConfirmed) return;
    try {
      await axios.delete(`${API.BOQS}/${selectedBoqId}`, axiosConfig);
      setSelectedBoqId("");
      setDetail(null);
      await fetchBoqs(selectedProjectId);
      Swal.fire("Sukses", "BOQ dihapus", "success");
    } catch (err) { handleError(err); }
  };

  // ---- Section ----
  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!newSection.trim()) return;
    try {
      await axios.post(`${API.BOQS}/${selectedBoqId}/sections`, { name: newSection.trim() }, axiosConfig);
      setNewSection("");
      await fetchDetail(selectedBoqId);
    } catch (err) { handleError(err); }
  };

  const handleDeleteSection = async (id) => {
    try {
      await axios.delete(`${API.BOQS}/sections/${id}`, axiosConfig);
      await fetchDetail(selectedBoqId);
    } catch (err) { handleError(err); }
  };

  // ---- Item ----
  const fillFromMaster = (masterId) => {
    const m = masterItems.find((i) => String(i.id) === String(masterId));
    setItemForm((f) => ({
      ...f,
      item_id: masterId,
      name: m?.name || f.name,
      unit: m?.satuan || m?.unit || f.unit,
      unit_price: m?.harga_satuan ?? m?.unit_price ?? f.unit_price,
    }));
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    const payload = {
      section_id: itemForm.section_id ? Number(itemForm.section_id) : null,
      item_id: itemForm.item_id ? Number(itemForm.item_id) : null,
      name: itemForm.name.trim(),
      unit: itemForm.unit || "unit",
      volume: Number(itemForm.volume),
      unit_price: Number(itemForm.unit_price),
      buy_price: itemForm.buy_price === "" ? null : Number(itemForm.buy_price),
      vendor_id: itemForm.vendor_id ? Number(itemForm.vendor_id) : null,
      vendor_name: vendorNameOf(itemForm.vendor_id, null),
      description: itemForm.description || null,
    };
    if (!payload.name || !(payload.volume >= 0) || !(payload.unit_price >= 0) || itemForm.volume === "" || itemForm.unit_price === "") {
      Swal.fire("Peringatan", "Nama, volume (>=0), dan harga satuan (>=0) wajib diisi", "warning");
      return;
    }
    if (itemForm.buy_price !== "" && !(payload.buy_price >= 0)) {
      Swal.fire("Peringatan", "Harga beli harus angka >= 0 atau dikosongkan", "warning");
      return;
    }
    try {
      await axios.post(`${API.BOQS}/${selectedBoqId}/items`, payload, axiosConfig);
      setItemForm({ section_id: "", item_id: "", name: "", unit: "unit", volume: "", unit_price: "", buy_price: "", vendor_id: "", description: "" });
      await fetchDetail(selectedBoqId);
      Swal.fire("Sukses", "Item ditambahkan", "success");
    } catch (err) { handleError(err); }
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      await axios.put(`${API.BOQS}/items/${editingItem.id}`, {
        name: editingItem.name,
        unit: editingItem.unit,
        volume: Number(editingItem.volume),
        unit_price: Number(editingItem.unit_price),
        buy_price: editingItem.buy_price === "" || editingItem.buy_price === null || editingItem.buy_price === undefined ? null : Number(editingItem.buy_price),
        vendor_id: editingItem.vendor_id ? Number(editingItem.vendor_id) : null,
        vendor_name: vendorNameOf(editingItem.vendor_id, editingItem.vendor_name),
        description: editingItem.description || null,
        section_id: editingItem.section_id || null,
      }, axiosConfig);
      setEditingItem(null);
      await fetchDetail(selectedBoqId);
      Swal.fire("Sukses", "Item diperbarui", "success");
    } catch (err) { handleError(err); }
  };

  const handleDeleteItem = async (id) => {
    try {
      await axios.delete(`${API.BOQS}/items/${id}`, axiosConfig);
      await fetchDetail(selectedBoqId);
    } catch (err) { handleError(err); }
  };

  // ---- Approval ----
  const askNote = async (title) => {
    const { value, isConfirmed } = await Swal.fire({ title, input: "textarea", inputPlaceholder: "Catatan (opsional)", showCancelButton: true, confirmButtonText: "Kirim", cancelButtonText: "Batal" });
    return isConfirmed ? (value || null) : undefined;
  };

  const handleSubmit = async () => {
    const note = await askNote("Ajukan BOQ untuk persetujuan?");
    if (note === undefined) return;
    try {
      await axios.post(`${API.BOQS}/${selectedBoqId}/submit`, { note }, axiosConfig);
      await refreshAll();
      Swal.fire("Sukses", "BOQ diajukan", "success");
    } catch (err) { handleError(err); }
  };

  const handleDecide = async (action, versionId) => {
    const note = await askNote(action === "approve" ? "Setujui versi ini?" : "Tolak versi ini?");
    if (note === undefined) return;
    try {
      await axios.post(`${API.BOQS}/versions/${versionId}/${action}`, { note }, axiosConfig);
      await refreshAll();
      Swal.fire("Sukses", action === "approve" ? "Versi disetujui" : "Versi ditolak", "success");
    } catch (err) { handleError(err); }
  };

  const handleExport = async () => {
    try {
      const params = { format: exportFormat };
      if (exportFormat === "pdf") {
        params.show_company = exportOpts.company ? 1 : 0;
        params.show_project = exportOpts.project ? 1 : 0;
        params.show_ids = exportOpts.ids ? 1 : 0;
        params.show_sections = exportOpts.sections ? 1 : 0;
        params.show_items = exportOpts.items ? 1 : 0;
        params.show_total = exportOpts.total ? 1 : 0;
        params.show_cost = exportOpts.cost ? 1 : 0;
      }
      const res = await axios.get(`${API.BOQS}/${selectedBoqId}/export`, { ...axiosConfig, params, responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `boq-${selectedBoqId}-v${detail?.boq?.current_version ?? 0}.${exportFormat}`;
      a.click();
      window.URL.revokeObjectURL(url);
      setExportOpen(false);
    } catch (err) { handleError(err); }
  };

  const OPT_LABELS = [
    ["company", "Kop perusahaan"],
    ["project", "Info proyek (nama + deskripsi)"],
    ["ids", "ID proyek, ID BOQ & versi"],
    ["sections", "Section / pengelompokan pekerjaan"],
    ["items", "Rincian item"],
    ["total", "Grand total"],
    ["cost", "Kolom internal: harga beli, vendor & laba (PDF)"],
  ];

  const totals = detail?.totals || { grandTotal: 0, itemCount: 0, sectionTotals: [] };

  // Opsi kolom internal hanya untuk pemegang izin (token lama tanpa klaim tetap boleh).
  const myPerms = me?.permissions;
  const canSeeCost = !Array.isArray(myPerms) || myPerms.includes("*") || myPerms.includes("boq.export.internal");

  const itemsBySection = useMemo(() => {
    const map = {};
    (detail?.items || []).forEach((it) => {
      const k = it.section_id ?? "none";
      (map[k] = map[k] || []).push(it);
    });
    return map;
  }, [detail]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Manajemen BOQ</h1>
          <Link to="/panduan" className="text-sm font-medium text-blue-600 hover:underline">
            Cara pakai BOQ?
          </Link>
        </div>

        <div className="bg-white p-4 rounded-lg shadow grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Proyek</label>
            <select className="w-full p-3 border border-gray-300 rounded-lg" value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} disabled={loading.projects}>
              <option value="">Pilih Proyek</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih BOQ {boqs.length > 0 && `(${boqs.length})`}</label>
            <select className="w-full p-3 border border-gray-300 rounded-lg" value={selectedBoqId} onChange={(e) => setSelectedBoqId(e.target.value)} disabled={!selectedProjectId || loading.boqs}>
              <option value="">{boqs.length === 0 ? "Belum ada BOQ" : "Pilih BOQ"}</option>
              {boqs.map((b) => <option key={b.id} value={b.id}>{b.name} [{STATUS_LABEL[b.status] || b.status}]</option>)}
            </select>
          </div>
        </div>

        {selectedProjectId && (
          <form onSubmit={handleCreateBoq} className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row gap-3 md:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama BOQ baru</label>
              <input className="w-full border border-gray-300 p-3 rounded-lg" placeholder="cth: BOQ Struktur Lt.1" value={newBoq.name} onChange={(e) => setNewBoq({ ...newBoq, name: e.target.value })} />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <input className="w-full border border-gray-300 p-3 rounded-lg" placeholder="Opsional" value={newBoq.description} onChange={(e) => setNewBoq({ ...newBoq, description: e.target.value })} />
            </div>
            <button type="submit" disabled={loading.busy || !newBoq.name.trim()} className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium">Tambah BOQ</button>
          </form>
        )}

        {loading.detail && <div className="flex justify-center py-8"><LoadingSpinner size="lg" /></div>}

        {detail && (
          <>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">{detail.boq.name}</h2>
                  <p className="text-sm opacity-90">{detail.boq.description || "Tanpa deskripsi"} • Versi {detail.boq.current_version}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${STATUS_COLOR[detail.boq.status]}`}>{STATUS_LABEL[detail.boq.status]}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div><p className="text-sm opacity-90">Total Item</p><p className="text-2xl font-bold">{totals.itemCount}</p></div>
                <div><p className="text-sm opacity-90">Grand Total</p><p className="text-2xl font-bold">{formatCurrency(totals.grandTotal)}</p></div>
                <div><p className="text-sm opacity-90">Sections</p><p className="text-2xl font-bold">{detail.sections.length}</p></div>
                <div className="flex flex-wrap gap-2 items-center">
                  <button onClick={() => { setExportFormat("xlsx"); setExportOpen(true); }} className="bg-white text-blue-700 px-3 py-2 rounded-lg text-sm font-semibold">Excel</button>
                  <button onClick={() => { setExportFormat("pdf"); setExportOpen(true); }} className="bg-white text-blue-700 px-3 py-2 rounded-lg text-sm font-semibold">PDF</button>
                  {!locked && totals.itemCount > 0 && <button onClick={handleSubmit} className="bg-yellow-400 text-yellow-950 px-3 py-2 rounded-lg text-sm font-semibold">Ajukan</button>}
                  <button onClick={handleDeleteBoq} className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-semibold">Hapus</button>
                </div>
              </div>
              {locked && <p className="mt-3 text-sm bg-black/20 rounded p-2">BOQ terkunci karena berstatus {STATUS_LABEL[detail.boq.status]}. Ubah data dinonaktifkan sampai ada keputusan/tolak.</p>}
            </div>

            {!locked && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form onSubmit={handleAddSection} className="bg-white p-4 rounded-lg shadow lg:col-span-1">
                  <h3 className="font-semibold mb-3">Tambah Section</h3>
                  <div className="flex gap-2">
                    <input className="flex-1 border border-gray-300 p-2 rounded-lg" placeholder="Nama section" value={newSection} onChange={(e) => setNewSection(e.target.value)} />
                    <button type="submit" className="bg-green-600 text-white px-4 rounded-lg">Tambah</button>
                  </div>
                  <ul className="mt-3 space-y-1">
                    {detail.sections.map((s) => (
                      <li key={s.id} className="flex justify-between items-center text-sm border rounded px-2 py-1">
                        <span>{s.name}</span>
                        <button type="button" onClick={() => handleDeleteSection(s.id)} className="text-red-600">Hapus</button>
                      </li>
                    ))}
                  </ul>
                </form>

                <form onSubmit={editingItem ? handleUpdateItem : handleAddItem} className="bg-white p-4 rounded-lg shadow lg:col-span-2">
                  <h3 className="font-semibold mb-3">{editingItem ? `Ubah Item #${editingItem.id}` : "Tambah Item"}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <select className="border p-2 rounded-lg" value={editingItem ? (editingItem.section_id || "") : itemForm.section_id} onChange={(e) => editingItem ? setEditingItem({ ...editingItem, section_id: e.target.value ? Number(e.target.value) : null }) : setItemForm({ ...itemForm, section_id: e.target.value })}>
                      <option value="">Tanpa section</option>
                      {detail.sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    {!editingItem && (
                      <div>
                        <ItemPicker
                          items={masterItems}
                          value={itemForm.item_id}
                          placeholder="Cari item master (opsional)..."
                          onSelect={(m) => fillFromMaster(m ? m.id : "")}
                        />
                        <p className="mt-1 text-xs text-gray-500">Pilih master untuk isi nama, satuan, dan harga otomatis.</p>
                      </div>
                    )}
                    <input className="border p-2 rounded-lg" placeholder="Nama item *" required value={editingItem ? editingItem.name : itemForm.name} onChange={(e) => editingItem ? setEditingItem({ ...editingItem, name: e.target.value }) : setItemForm({ ...itemForm, name: e.target.value })} />
                    <input className="border p-2 rounded-lg" placeholder="Satuan" value={editingItem ? editingItem.unit : itemForm.unit} onChange={(e) => editingItem ? setEditingItem({ ...editingItem, unit: e.target.value }) : setItemForm({ ...itemForm, unit: e.target.value })} />
                    <input className="border p-2 rounded-lg" type="number" step="0.0001" min="0" placeholder="Volume *" required value={editingItem ? editingItem.volume : itemForm.volume} onChange={(e) => editingItem ? setEditingItem({ ...editingItem, volume: e.target.value }) : setItemForm({ ...itemForm, volume: e.target.value })} />
                    <input className="border p-2 rounded-lg" type="number" step="0.01" min="0" placeholder="Harga satuan *" required value={editingItem ? editingItem.unit_price : itemForm.unit_price} onChange={(e) => editingItem ? setEditingItem({ ...editingItem, unit_price: e.target.value }) : setItemForm({ ...itemForm, unit_price: e.target.value })} />
                    <input className="border p-2 rounded-lg" type="number" step="0.01" min="0" placeholder="Harga beli (opsional)" title="Harga beli satuan. Kosongkan bila belum tahu." value={editingItem ? (editingItem.buy_price ?? "") : itemForm.buy_price} onChange={(e) => editingItem ? setEditingItem({ ...editingItem, buy_price: e.target.value }) : setItemForm({ ...itemForm, buy_price: e.target.value })} />
                    <select className="border p-2 rounded-lg text-gray-700" title="Vendor item ini" value={editingItem ? (editingItem.vendor_id || "") : itemForm.vendor_id} onChange={(e) => editingItem ? setEditingItem({ ...editingItem, vendor_id: e.target.value ? Number(e.target.value) : null }) : setItemForm({ ...itemForm, vendor_id: e.target.value })}>
                      <option value="">Tanpa vendor</option>
                      {vendorOptions.map((v) => <option key={v.id} value={v.id}>{v.name}{v.scope ? ` — ${v.scope}` : ""}</option>)}
                    </select>
                  </div>
                  {projectVendors.length === 0 && (
                    <p className="mt-1 text-xs text-gray-500">Belum ada vendor ditugaskan ke proyek ini — daftar di atas memakai semua vendor aktif. Tugaskan vendor lewat halaman Proyek.</p>
                  )}
                  <input className="border p-2 rounded-lg w-full mt-3" placeholder="Deskripsi (opsional)" value={editingItem ? (editingItem.description || "") : itemForm.description} onChange={(e) => editingItem ? setEditingItem({ ...editingItem, description: e.target.value }) : setItemForm({ ...itemForm, description: e.target.value })} />
                  <div className="mt-3 flex gap-2">
                    <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg">{editingItem ? "Simpan" : "Tambah Item"}</button>
                    {editingItem && <button type="button" onClick={() => setEditingItem(null)} className="bg-gray-300 px-5 py-2 rounded-lg">Batal</button>}
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b font-bold">Rincian BOQ — {detail.boq.name}</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr><th className="text-left p-3">Section</th><th className="text-left p-3">Uraian</th><th className="text-right p-3">Vol</th><th className="text-center p-3">Sat</th><th className="text-right p-3">Harga Jual</th><th className="text-right p-3">Jumlah</th><th className="text-right p-3">Harga Beli</th><th className="text-left p-3">Vendor</th>{!locked && <th className="p-3">Aksi</th>}</tr>
                  </thead>
                  <tbody>
                    {(detail.items || []).map((it) => (
                      <tr key={it.id} className="border-t hover:bg-gray-50">
                        <td className="p-3 text-gray-600">{sectionName(it.section_id)}</td>
                        <td className="p-3 font-medium">{it.name}</td>
                        <td className="p-3 text-right">{Number(it.volume).toLocaleString("id-ID")}</td>
                        <td className="p-3 text-center">{it.unit}</td>
                        <td className="p-3 text-right">{formatCurrency(it.unit_price)}</td>
                        <td className="p-3 text-right font-bold text-blue-700">{formatCurrency(it.line_total)}</td>
                        <td className="p-3 text-right text-gray-600">{it.buy_price === null || it.buy_price === undefined || it.buy_price === "" ? "-" : formatCurrency(it.buy_price)}</td>
                        <td className="p-3 text-gray-600">{vendorLabel(it)}</td>
                        {!locked && (
                          <td className="p-3 whitespace-nowrap">
                            <button onClick={() => setEditingItem({ ...it })} className="text-blue-600 mr-3">Ubah</button>
                            <button onClick={() => handleDeleteItem(it.id)} className="text-red-600">Hapus</button>
                          </td>
                        )}
                      </tr>
                    ))}
                    {(!detail.items || detail.items.length === 0) && <tr><td colSpan={locked ? 8 : 9} className="p-6 text-center text-gray-500">Belum ada item.</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-gray-50 text-right font-bold text-lg">Grand Total: <span className="text-blue-700">{formatCurrency(totals.grandTotal)}</span></div>
              <div className="px-4 pb-4 bg-gray-50 text-right text-sm">
                {(totals.unknownCostCount ?? 0) > 0 ? (
                  <p className="text-amber-700">Total biaya belum lengkap — {totals.unknownCostCount} item tanpa harga beli. Laba & margin ditampilkan setelah semua harga beli diisi.</p>
                ) : totals.itemCount > 0 ? (
                  <p className="space-x-4">
                    <span>Total Biaya: <b>{formatCurrency(totals.totalCost)}</b></span>
                    <span>Laba Kotor: <b className="text-green-700">{formatCurrency(totals.profit)}</b></span>
                    <span>Margin: <b className="text-green-700">{totals.profitMargin}%</b></span>
                  </p>
                ) : null}
              </div>
              {totals.sectionTotals?.length > 0 && (
                <div className="p-4 border-t grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  {totals.sectionTotals.map((s) => (
                    <div key={s.section_id} className="border rounded p-2 flex justify-between"><span>{s.name} ({s.itemCount})</span><b>{formatCurrency(s.subtotal)}</b></div>
                  ))}
                  {itemsBySection.none?.length > 0 && <div className="border rounded p-2 flex justify-between"><span>Tanpa section ({itemsBySection.none.length})</span><b>{formatCurrency(itemsBySection.none.reduce((a, it) => a + Number(it.line_total || 0), 0))}</b></div>}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-bold mb-3">Riwayat Versi</h3>
                {versions.length === 0 && <p className="text-sm text-gray-500">Belum ada versi. Ajukan BOQ untuk membuat snapshot versi.</p>}
                <ul className="space-y-2">
                  {versions.map((v) => (
                    <li key={v.id} className="border rounded p-3 text-sm">
                      <div className="flex justify-between items-center">
                        <b>Versi {v.version_no}</b>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLOR[v.status]}`}>{STATUS_LABEL[v.status]}</span>
                      </div>
                      <p className="text-gray-600 mt-1">Total snapshot: {formatCurrency(v.snapshot?.totals?.grandTotal ?? 0)} • {v.snapshot?.totals?.itemCount ?? 0} item</p>
                      {v.note && <p className="text-gray-600 italic">“{v.note}”</p>}
                      {v.status === "submitted" && (
                        <div className="mt-2 flex gap-2">
                          <button onClick={() => handleDecide("approve", v.id)} className="bg-green-600 text-white px-3 py-1 rounded text-xs">Setujui (admin)</button>
                          <button onClick={() => handleDecide("reject", v.id)} className="bg-red-500 text-white px-3 py-1 rounded text-xs">Tolak (admin)</button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-bold mb-3">Riwayat Approval</h3>
                {approvals.length === 0 && <p className="text-sm text-gray-500">Belum ada aktivitas.</p>}
                <ul className="space-y-2 text-sm">
                  {approvals.map((a) => (
                    <li key={a.id} className="border rounded p-2">
                      <b className="capitalize">{a.action}</b> • versi #{versions.find((v) => v.id === a.version_id)?.version_no ?? "-"} • {a.actor_role || "user"} #{a.actor_id ?? "-"}
                      {a.note && <span className="italic text-gray-600"> — “{a.note}”</span>}
                      <div className="text-xs text-gray-500">{new Date(a.created_at || a.createdAt).toLocaleString("id-ID")}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {exportOpen && (
              <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4" onClick={() => setExportOpen(false)}>
                <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-lg" onClick={(e) => e.stopPropagation()}>
                  <h3 className="font-bold text-gray-900">Export BOQ</h3>
                  <div className="mt-3 flex gap-4 text-sm">
                    {["pdf", "xlsx"].map((f) => (
                      <label key={f} className="flex items-center gap-2 font-medium text-gray-700">
                        <input
                          type="radio"
                          name="export-format"
                          checked={exportFormat === f}
                          onChange={() => setExportFormat(f)}
                          className="accent-blue-600"
                        />
                        {f.toUpperCase()}
                      </label>
                    ))}
                  </div>
                  <p className="mt-4 text-sm font-medium text-gray-700">Blok yang ditampilkan {exportFormat === "pdf" ? "(PDF)" : "(Excel selalu lengkap)"}:</p>
                  <div className="mt-2 space-y-2">
                    {OPT_LABELS.filter(([key]) => key !== "cost" || canSeeCost).map(([key, label]) => (
                      <label key={key} className={`flex items-center gap-2 text-sm ${exportFormat === "pdf" ? "text-gray-700" : "text-gray-400"}`}>
                        <input
                          type="checkbox"
                          checked={exportFormat === "pdf" ? exportOpts[key] : true}
                          disabled={exportFormat !== "pdf"}
                          onChange={(e) => setExportOpts({ ...exportOpts, [key]: e.target.checked })}
                          className="accent-blue-600"
                        />
                        {label}
                      </label>
                    ))}
                    {!canSeeCost && (
                      <p className="text-xs text-gray-400">Opsi kolom internal disembunyikan karena akun ini tidak punya izin boq.export.internal.</p>
                    )}
                  </div>
                  <div className="mt-5 flex justify-end gap-2">
                    <button onClick={() => setExportOpen(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">
                      Batal
                    </button>
                    <button onClick={handleExport} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 active:translate-y-[1px]">
                      Unduh {exportFormat.toUpperCase()}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
