import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AdminNavbar from "../component/AdminNavbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import Swal from "sweetalert2";

const API_PROJECTS_URL = "http://localhost:3004/api/projects";
const API_BOQ_URL = "http://localhost:3005/api/boq";
const API_ITEMS_URL = "http://localhost:3003/api/items";

export default function AdminBoq() {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [itemsByCategory, setItemsByCategory] = useState({});
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await axios.get(API_PROJECTS_URL, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      const dataProjects = res.data?.data?.projects || res.data || [];
      setProjects(dataProjects);
      if (dataProjects.length > 0 && !selectedProjectId) {
        setSelectedProjectId(dataProjects[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setError("Gagal mengambil data proyek");
    }
  }, [token, selectedProjectId]);

  const fetchBoqData = useCallback(async (projectId) => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BOQ_URL}/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      const dataCategories = res.data?.data?.categories || [];
      const dataItems = res.data?.data?.items || {};
      setCategories(dataCategories);
      setItemsByCategory(dataItems);
    } catch (err) {
      console.error("Failed to fetch BOQ data:", err);
      setError("Gagal mengambil data BOQ");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchItems = useCallback(async () => {
    try {
      const res = await axios.get(API_ITEMS_URL, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      const dataItems = res.data?.data?.items || res.data || [];
      setItems(dataItems);
    } catch (err) {
      console.error("Failed to fetch items:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchProjects();
    fetchItems();
  }, [fetchProjects, fetchItems]);

  useEffect(() => {
    if (selectedProjectId) {
      fetchBoqData(selectedProjectId);
    }
  }, [selectedProjectId, fetchBoqData]);

  const handleProjectChange = (e) => {
    setSelectedProjectId(Number(e.target.value));
  };

  const handleItemChange = (e) => {
    const item = items.find((i) => i.id === parseInt(e.target.value));
    setSelectedItem(item);
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);

  const getCategoryNumbering = (level, index) => {
    if (level === 0) return ["I", "II", "III", "IV", "V"][index] || (index + 1);
    if (level === 1) return String.fromCharCode(65 + index) + ".";
    return (index + 1) + ".";
  };

  const getItemName = (id) => {
    const found = items.find((i) => i.id === id);
    return found ? found.name : `Item Tidak Ditemukan (#${id})`;
  };

  const getCategoryOptions = (categories, level = 0) => {
    return categories.flatMap((cat) => {
      const indent = "-".repeat(level);
      const option = [<option key={cat.id} value={cat.id}>{indent} {cat.name}</option>];
      if (cat.children?.length > 0) {
        option.push(...getCategoryOptions(cat.children, level + 1));
      }
      return option;
    });
  };

  const renderBoqRow = (category, level = 0, index = 0) => {
    const numbering = getCategoryNumbering(level, index);
    const categoryItems = itemsByCategory[category.id] || [];

    if (categoryItems.length === 0 && (!category.children || category.children.length === 0)) {
      return null;
    }

    return (
      <div key={category.id} className="divide-y divide-gray-200">
        {categoryItems.length > 0 && (
          <>
            <div className="flex bg-gray-100 font-bold">
              <div className="w-12 p-2 border">{numbering}</div>
              <div className="flex-1 p-2 border">{category.name}</div>
              <div className="w-20 p-2 border"></div>
              <div className="w-20 p-2 border"></div>
              <div className="w-32 p-2 border"></div>
              <div className="w-32 p-2 border"></div>
            </div>

            {categoryItems.map((item, idx) => (
              <div key={item.id} className="flex bg-white hover:bg-gray-50">
                <div className="w-12 p-2 border">{idx + 1}</div>
                <div className="flex-1 p-2 border">{getItemName(item.item_id)}</div>
                <div className="w-20 p-2 border">{item.volume}</div>
                <div className="w-20 p-2 border">{item.satuan || "unit"}</div>
                <div className="w-32 p-2 border text-right">{formatCurrency(item.unit_price)}</div>
                <div className="w-32 p-2 border text-right">{formatCurrency(item.volume * item.unit_price)}</div>
              </div>
            ))}
          </>
        )}

        {category.children?.map((child, idx) => renderBoqRow(child, level + 1, idx))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <div className="p-4 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">BOQ Management</h2>

        <select className="mb-6 border p-2 rounded" value={selectedProjectId || ""} onChange={handleProjectChange}>
          <option value="">Select Project</option>
          {projects.map((proj) => (
            <option key={proj.id} value={proj.id}>{proj.name}</option>
          ))}
        </select>

        {selectedProjectId && (
          <form
            className="bg-white p-4 rounded shadow mb-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = {
                item_id: parseInt(e.target.item_id.value),
                volume: parseFloat(e.target.volume.value),
                unit_price: parseFloat(e.target.unit_price.value),
                notes: e.target.notes.value,
                category_id: parseInt(e.target.category_id.value),
              };
              try {
                await axios.post(`${API_BOQ_URL}/projects/${selectedProjectId}/items`, formData, {
                  headers: { Authorization: `Bearer ${token}` },
                  withCredentials: true,
                });
                Swal.fire("Sukses", "Item ditambahkan", "success");
                fetchBoqData(selectedProjectId);
                e.target.reset();
              } catch (err) {
                Swal.fire("Error", "Gagal menambahkan item", "error");
              }
            }}
          >
            <h3 className="font-semibold mb-2">Tambah Item ke Project</h3>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <select name="item_id" required className="border p-2 rounded" onChange={handleItemChange}>
                <option value="">Pilih Item</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
              <select name="category_id" required className="border p-2 rounded">
                <option value="">Pilih Kategori</option>
                {getCategoryOptions(categories)}
              </select>
              <input name="volume" type="number" step="0.01" placeholder="Volume" required className="border p-2 rounded" />
              <input name="unit_price" type="number" step="0.01" placeholder="Harga Satuan" required className="border p-2 rounded" value={selectedItem?.harga_satuan || ""} readOnly />
            </div>
            <input name="notes" type="text" placeholder="Catatan (opsional)" className="border p-2 rounded w-full mb-2" />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Tambah Item</button>
          </form>
        )}

        <div className="bg-white rounded shadow overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <div className="font-semibold">BOQ - {projects.find((p) => p.id === selectedProjectId)?.name || "No Project Selected"}</div>
          </div>
          <div className="flex font-bold text-sm bg-gray-100 border-b">
            <div className="w-12 p-2 border">No.</div>
            <div className="flex-1 p-2 border">Uraian Pekerjaan</div>
            <div className="w-20 p-2 border">Vol</div>
            <div className="w-20 p-2 border">Sat</div>
            <div className="w-32 p-2 border text-center">Harga Satuan</div>
            <div className="w-32 p-2 border text-center">Jumlah</div>
          </div>

          {categories.length > 0 ? (
            categories.map((cat, idx) => renderBoqRow(cat, 0, idx))
          ) : (
            <div className="p-4 text-center text-gray-500">No categories available for this project</div>
          )}
        </div>
      </div>
    </div>
  );
}
