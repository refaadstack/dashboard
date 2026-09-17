import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AdminNavbar from "../component/AdminNavbar.jsx";
import FormModal from "../component/FormModal.jsx";
import SearchableTable from "../component/SearchableTable.jsx";
import ActionButton from "../component/ActionButton.jsx";
import RowActions from "../component/RowActions.jsx";
import ItemPicker from "../component/ItemPicker.jsx";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext.jsx";
import Modal from "../component/Modal.jsx";

const API_BASE_URL = "/api/projects";
const ITEM_API_BASE_URL = "/api/items";

export default function AdminProject() {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedProject, setSelectedProject] = useState(null);

  // Detail modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [projectDetail, setProjectDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Items management states
  const [itemsList, setItemsList] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Add item form states
  const [newItemId, setNewItemId] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newUnitPrice, setNewUnitPrice] = useState("");
  const [newNotes, setNewNotes] = useState("");

  // Edit item states
  const [editingItemId, setEditingItemId] = useState(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [editUnitPrice, setEditUnitPrice] = useState("");
  const [editNotes, setEditNotes] = useState("");

  // Project vendors (penugasan vendor ke proyek)
  const [projectVendors, setProjectVendors] = useState([]);
  const [vendorList, setVendorList] = useState([]);
  const [assignVendorId, setAssignVendorId] = useState("");
  const [assignScope, setAssignScope] = useState("");


  const fetchProjects = useCallback(async () => {
    try {
      const res = await axios.get(API_BASE_URL, {
        params: { limit: 500 },
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      const projectsData = res.data?.data?.projects || res.data || [];
      setProjects(projectsData);
    } catch {
      Swal.fire("Error", "Gagal mengambil data project.", "error");
    }
  }, [token]);

  const fetchItemsList = useCallback(async () => {
    setLoadingItems(true);
    try {
      const res = await axios.get(ITEM_API_BASE_URL, {
        params: { limit: 500 },
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      const itemsData = res.data?.data?.items || res.data || [];
      setItemsList(itemsData);
    } catch {
      Swal.fire("Error", "Gagal mengambil data item.", "error");
    } finally {
      setLoadingItems(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProjects();
    fetchItemsList();
  }, [fetchProjects, fetchItemsList]);

  const projectFields = [
    { name: "name", label: "Project Name", type: "text" },
    { name: "description", label: "Description", type: "text" },
    { name: "start_date", label: "Start Date", type: "date" },
    { name: "end_date", label: "End Date", type: "date" },
    { name: "budget", label: "Budget", type: "integer" },
  ];

  const handleAdd = () => {
    setModalMode("add");
    setSelectedProject(null);
    setShowModal(true);
  };

  const handleEdit = (project) => {
    setModalMode("edit");
    setSelectedProject(project);
    setShowModal(true);
  };

  const handleDelete = async (project) => {
    const result = await Swal.fire({
      title: `Yakin hapus project ${project.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/${project.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      Swal.fire("Terhapus!", "Project berhasil dihapus.", "success");
      fetchProjects();
    } catch {
      Swal.fire("Error", "Gagal menghapus project.", "error");
    }
  };

  const fetchProjectDetail = async (projectId) => {
    setLoadingDetail(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/${projectId}/details`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setProjectDetail(res.data.data);
    } catch {
      Swal.fire("Error", "Gagal mengambil detail project.", "error");
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const fetchProjectVendors = useCallback(async (projectId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/${projectId}/vendors`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setProjectVendors(res.data?.data || []);
    } catch {
      setProjectVendors([]);
    }
  }, [token]);

  const fetchVendorList = useCallback(async () => {
    try {
      const res = await axios.get("/api/vendors", {
        params: { limit: 500, status: "active" },
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setVendorList(res.data?.data?.vendors || []);
    } catch {
      setVendorList([]);
    }
  }, [token]);

  const handleDetail = (project) => {
    setShowDetailModal(true);
    fetchProjectDetail(project.id);
    fetchProjectVendors(project.id);
    fetchVendorList();
    resetAddItemForm();
    resetEditingState();
    setAssignVendorId("");
    setAssignScope("");
  };

  const resetAddItemForm = () => {
    setNewItemId("");
    setNewQuantity("");
    setNewUnitPrice("");
    setNewNotes("");
  };

  const resetEditingState = () => {
    setEditingItemId(null);
    setEditQuantity("");
    setEditUnitPrice("");
    setEditNotes("");
  };

  const calculateTotalValue = () => {
    if (!projectDetail || !projectDetail.items) return 0;
    return projectDetail.items.reduce((sum, pi) => {
      const qty = pi.quantity || 0;
      const price = pi.unit_price || pi.item?.harga_satuan || 0;
      return sum + qty * price;
    }, 0);
  };

  const handleAddItem = async () => {
    if (!newItemId) {
      Swal.fire("Error", "Pilih item terlebih dahulu.", "error");
      return;
    }
    if (!newQuantity || isNaN(newQuantity) || newQuantity <= 0) {
      Swal.fire("Error", "Quantity harus angka lebih dari 0.", "error");
      return;
    }
    if (!newUnitPrice || isNaN(newUnitPrice) || newUnitPrice < 0) {
      Swal.fire("Error", "Harga satuan harus angka >= 0.", "error");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/${projectDetail.id}/items`, {
        item_id: newItemId,
        quantity: Number(newQuantity),
        unit_price: Number(newUnitPrice),
        notes: newNotes || null,
      }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      Swal.fire("Berhasil", "Item berhasil ditambahkan.", "success");
      fetchProjectDetail(projectDetail.id);
      resetAddItemForm();
    } catch {
      Swal.fire("Error", "Gagal menambahkan item.", "error");
    }
  };

  const startEditItem = (pi) => {
    setEditingItemId(pi.id);
    setEditQuantity(pi.quantity || "");
    setEditUnitPrice(pi.unit_price || pi.item?.harga_satuan || "");
    setEditNotes(pi.notes || "");
  };

  const cancelEditItem = () => {
    resetEditingState();
  };

  const saveEditItem = async (pi) => {
    if (!editQuantity || isNaN(editQuantity) || editQuantity <= 0) {
      Swal.fire("Error", "Quantity harus angka lebih dari 0.", "error");
      return;
    }
    if (!editUnitPrice || isNaN(editUnitPrice) || editUnitPrice < 0) {
      Swal.fire("Error", "Harga satuan harus angka >= 0.", "error");
      return;
    }

    try {
      await axios.put(`${API_BASE_URL}/${projectDetail.id}/items/${pi.item_id}`, {
        quantity: Number(editQuantity),
        unit_price: Number(editUnitPrice),
        notes: editNotes || null,
      }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      Swal.fire("Berhasil", "Item berhasil diupdate.", "success");
      fetchProjectDetail(projectDetail.id);
      resetEditingState();
    } catch {
      Swal.fire("Error", "Gagal mengupdate item.", "error");
    }
  };

  const deleteItem = async (pi) => {
    const result = await Swal.fire({
      title: `Yakin hapus item ${pi.item?.name || ""} dari project?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/${projectDetail.id}/items/${pi.item_id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      Swal.fire("Terhapus!", "Item berhasil dihapus dari project.", "success");
      fetchProjectDetail(projectDetail.id);
    } catch {
      Swal.fire("Error", "Gagal menghapus item.", "error");
    }
  };

  const handleAssignVendor = async () => {
    if (!assignVendorId) {
      Swal.fire("Error", "Pilih vendor terlebih dahulu.", "error");
      return;
    }
    const v = vendorList.find((x) => String(x.id) === String(assignVendorId));
    try {
      await axios.post(`${API_BASE_URL}/${projectDetail.id}/vendors`, {
        vendor_id: Number(assignVendorId),
        vendor_name: v?.name || "",
        scope: assignScope || null,
      }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      Swal.fire("Berhasil", "Vendor ditugaskan ke proyek.", "success");
      setAssignVendorId("");
      setAssignScope("");
      fetchProjectVendors(projectDetail.id);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Gagal menugaskan vendor.", "error");
    }
  };

  const handleRemoveVendor = async (row) => {
    const result = await Swal.fire({
      title: `Hapus ${row.vendor_name} dari proyek?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`${API_BASE_URL}/${projectDetail.id}/vendors/${row.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      Swal.fire("Terhapus!", "Vendor dihapus dari proyek.", "success");
      fetchProjectVendors(projectDetail.id);
    } catch {
      Swal.fire("Error", "Gagal menghapus penugasan vendor.", "error");
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const renderProjectInfo = () => (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Description</p>
          <p className="font-medium">{projectDetail.description || "-"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Budget</p>
          <p className="font-medium text-green-600">{formatCurrency(projectDetail.budget)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Start Date</p>
          <p className="font-medium">{formatDate(projectDetail.start_date)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">End Date</p>
          <p className="font-medium">{formatDate(projectDetail.end_date)}</p>
        </div>
      </div>
    </div>
  );

  const renderItemsTable = () => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4">Items Used</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 bg-white rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="border border-gray-300 p-3 text-left font-medium">Item Name</th>
              <th className="border border-gray-300 p-3 text-left font-medium">Volume</th>
              <th className="border border-gray-300 p-3 text-left font-medium">Unit</th>
              <th className="border border-gray-300 p-3 text-left font-medium">Unit Price</th>
              <th className="border border-gray-300 p-3 text-left font-medium">Quantity</th>
              <th className="border border-gray-300 p-3 text-left font-medium">Subtotal</th>
              <th className="border border-gray-300 p-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projectDetail.items && projectDetail.items.length > 0 ? (
              projectDetail.items.map((pi) => (
                <tr key={pi.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3">
                    <div className="font-medium">{pi.item?.name || pi.name || "N/A"}</div>
                    {pi.notes && <div className="text-sm text-gray-600">{pi.notes}</div>}
                  </td>
                  <td className="border border-gray-300 p-3">{pi.item?.volume || pi.volume || "-"}</td>
                  <td className="border border-gray-300 p-3">{pi.item?.satuan || pi.satuan || "-"}</td>
                  <td className="border border-gray-300 p-3">
                    {editingItemId === pi.id ? (
                      <input
                        type="number"
                        value={editUnitPrice}
                        onChange={(e) => setEditUnitPrice(e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Unit Price"
                      />
                    ) : (
                      formatCurrency(pi.unit_price || pi.item?.harga_satuan || 0)
                    )}
                  </td>
                  <td className="border border-gray-300 p-3">
                    {editingItemId === pi.id ? (
                      <input
                        type="number"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Quantity"
                      />
                    ) : (
                      pi.quantity || "-"
                    )}
                  </td>
                  <td className="border border-gray-300 p-3 font-medium">
                    {formatCurrency((pi.quantity || 0) * (pi.unit_price || pi.item?.harga_satuan || 0))}
                  </td>
                  <td className="border border-gray-300 p-3">
                    {editingItemId === pi.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Notes"
                        />
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => saveEditItem(pi)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditItem}
                            className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => startEditItem(pi)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteItem(pi)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="border border-gray-300 p-6 text-center text-gray-500">
                  No items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderVendorsSection = () => (
    <div className="bg-white border rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-1">Vendor Proyek</h3>
      <p className="text-sm text-gray-500 mb-4">Vendor yang ditugaskan ke proyek ini bisa dipilih di tiap item BOQ.</p>
      {projectVendors.length > 0 ? (
        <ul className="space-y-2 mb-4">
          {projectVendors.map((pv) => (
            <li key={pv.id} className="flex flex-wrap items-center justify-between gap-2 border rounded px-3 py-2 text-sm">
              <div>
                <b>{pv.vendor_name}</b>
                {pv.scope && <span className="text-gray-600"> — {pv.scope}</span>}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${pv.status === "done" ? "bg-green-200 text-green-900" : pv.status === "active" ? "bg-blue-200 text-blue-900" : "bg-gray-200 text-gray-700"}`}>
                  {pv.status === "done" ? "Selesai" : pv.status === "active" ? "Aktif" : "Ditugaskan"}
                </span>
              </div>
              <button onClick={() => handleRemoveVendor(pv)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors">
                Hapus
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 mb-4">Belum ada vendor ditugaskan.</p>
      )}
      <div className="flex flex-col md:flex-row gap-2">
        <select
          className="flex-1 border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={assignVendorId}
          onChange={(e) => setAssignVendorId(e.target.value)}
        >
          <option value="">Pilih vendor aktif...</option>
          {vendorList
            .filter((v) => !projectVendors.some((pv) => String(pv.vendor_id) === String(v.id)))
            .map((v) => (
              <option key={v.id} value={v.id}>{v.name}{v.category ? ` (${v.category})` : ""}</option>
            ))}
        </select>
        <input
          className="flex-1 border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Lingkup pekerjaan (cth: Pemasangan AC Lt.1)"
          value={assignScope}
          onChange={(e) => setAssignScope(e.target.value)}
        />
        <button onClick={handleAssignVendor} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm transition-colors">
          Tugaskan
        </button>
      </div>
      {vendorList.length === 0 && (
        <p className="text-xs text-amber-600 mt-2">Tidak ada vendor aktif. Tambahkan dulu di halaman Vendor.</p>
      )}
    </div>
  );

  const renderAddItemForm = () => (
    <div className="bg-white border rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Add New Item</h3>
      {loadingItems ? (
        <div className="text-center text-gray-500">Loading items...</div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cari Item
              </label>
              <ItemPicker
                items={itemsList}
                value={newItemId}
                placeholder="Ketik nama item..."
                onSelect={(item) => {
                  setNewItemId(item ? item.id : "");
                  setNewUnitPrice(item && item.harga_satuan != null ? String(item.harga_satuan) : "");
                }}
              />
              <p className="mt-1 text-xs text-gray-500">Harga terisi otomatis dari database, bisa diubah manual.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                placeholder="Enter quantity"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Price
              </label>
              <input
                type="number"
                placeholder="Enter unit price"
                value={newUnitPrice}
                onChange={(e) => setNewUnitPrice(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="Enter notes"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button
            onClick={handleAddItem}
            className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded font-medium transition-colors"
          >
            Add Item
          </button>
        </div>
      )}
    </div>
  );

  const renderTotalValue = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold text-blue-900">Total Project Value:</span>
        <span className="text-2xl font-bold text-blue-600">
          {formatCurrency(calculateTotalValue())}
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />

      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Project Management</h2>
                <ActionButton 
                  label="Add Project" 
                  onClick={handleAdd} 
                  variant="add"
                  className="w-full sm:w-auto"
                />
              </div>

              {/* Project Form Modal */}
              <FormModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={modalMode === "add" ? "Add New Project" : "Edit Project"}
                fields={projectFields}
                endpoint={
                  modalMode === "add"
                    ? API_BASE_URL
                    : `${API_BASE_URL}/${selectedProject?.id}`
                }
                method={modalMode === "add" ? "post" : "put"}
                initialData={selectedProject}
                onSuccess={() => {
                  fetchProjects();
                  setShowModal(false);
                  Swal.fire(
                    "Success!",
                    modalMode === "add"
                      ? "Project berhasil ditambahkan."
                      : "Project berhasil diupdate.",
                    "success"
                  );
                }}
                onError={(errorData) => {
                  Swal.fire(
                    "Error",
                    errorData?.message || "Terjadi kesalahan saat menyimpan data.",
                    "error"
                  );
                }}
                transformData={(data) => {
                  if (!data.name || data.name.trim() === "") {
                    Swal.fire("Error", "Project name is required.", "error");
                    throw new Error("Validation failed: name empty.");
                  }

                  const budgetNum = Number(data.budget);
                  if (
                    isNaN(budgetNum) ||
                    !Number.isInteger(budgetNum) ||
                    budgetNum < 0
                  ) {
                    Swal.fire("Error", "Budget must be an integer >= 0.", "error");
                    throw new Error("Validation failed: budget invalid.");
                  }

                  return {
                    name: data.name,
                    description: data.description || null,
                    start_date: data.start_date || null,
                    end_date: data.end_date || null,
                    budget: budgetNum,
                  };
                }}
              />

              {/* Projects Table */}
              <div className="overflow-x-auto">
                <SearchableTable
                  data={projects.map((project) => ({
                    ...project,
                    budget: formatCurrency(project.budget),
                    start_date: formatDate(project.start_date),
                    end_date: formatDate(project.end_date),
                    actions: (
                      <RowActions
                        onDetail={() => handleDetail(project)}
                        onEdit={() => handleEdit(project)}
                        onDelete={() => handleDelete(project)}
                        detailTitle="Detail"
                        editTitle="Edit"
                        deleteTitle="Delete"
                      />
                    ),
                  }))}
                  columns={[
                    { key: "name", label: "Project Name" },
                    { key: "description", label: "Description" },
                    { key: "start_date", label: "Start Date" },
                    { key: "end_date", label: "End Date" },
                    { key: "budget", label: "Budget", align: "right", numeric: true }
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Project Detail Modal */}
          <Modal
            isOpen={showDetailModal}
            onClose={() => setShowDetailModal(false)}
            title={`Project Detail: ${projectDetail?.name || ""}`}
            size="xl"
          >
            <div className="space-y-3">
              {loadingDetail ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading project details...</p>
                </div>
              ) : projectDetail ? (
                <>
                  {renderProjectInfo()}
                  {renderVendorsSection()}
                  {renderItemsTable()}
                  {renderAddItemForm()}
                  {renderTotalValue()}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No data available.
                </div>
              )}
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
}