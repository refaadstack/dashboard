import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import AdminNavbar from "../component/AdminNavbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import Swal from "sweetalert2";

// API Configuration
const API_CONFIG = {
  PROJECTS: "http://localhost:3004/api/projects",
  BOQ: "http://localhost:3005/api/boq",
  ITEMS: "http://localhost:3003/api/items",
  CATEGORIES: "http://localhost:3005/api/categories",
};

// Loading states enum
const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success'
};

export default function AdminBoq() {
  const { token } = useAuth();

  // State management
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [itemsByCategory, setItemsByCategory] = useState({});
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Form states
  const [newCategoryName, setNewCategoryName] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState(null);
  
  // Loading states
  const [loadingStates, setLoadingStates] = useState({
    projects: LOADING_STATES.IDLE,
    boq: LOADING_STATES.IDLE,
    items: LOADING_STATES.IDLE,
    addingCategory: false,
    addingItem: false,
  });

  // Error states
  const [errors, setErrors] = useState({});

  // Common axios config
  const axiosConfig = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  }), [token]);

  // Error handler
  const handleError = useCallback((error, context) => {
    console.error(`Error in ${context}:`, error);
    const message = error.response?.data?.message || error.message || 'Terjadi kesalahan';
    setErrors(prev => ({ ...prev, [context]: message }));
    Swal.fire("Error", message, "error");
  }, []);

  // Set loading state helper
  const setLoadingState = useCallback((key, state) => {
    setLoadingStates(prev => ({ ...prev, [key]: state }));
  }, []);

  // Clear error helper
  const clearError = useCallback((key) => {
    setErrors(prev => ({ ...prev, [key]: null }));
  }, []);

  // Fetch functions with loading states
  const fetchProjects = useCallback(async () => {
    setLoadingState('projects', LOADING_STATES.LOADING);
    clearError('projects');
    
    try {
      const res = await axios.get(API_CONFIG.PROJECTS, axiosConfig);
      const data = res.data?.data?.projects || [];
      
      setProjects(data);
      
      // Auto-select first project if none selected
      if (data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(data[0].id);
      }
      
      setLoadingState('projects', LOADING_STATES.SUCCESS);
    } catch (err) {
      setLoadingState('projects', LOADING_STATES.ERROR);
      handleError(err, 'projects');
    }
  }, [token, selectedProjectId, axiosConfig, setLoadingState, clearError, handleError]);

  const fetchBoqData = useCallback(async (projectId) => {
    if (!projectId) return;
    
    setLoadingState('boq', LOADING_STATES.LOADING);
    clearError('boq');
    
    try {
      const res = await axios.get(`${API_CONFIG.BOQ}/projects/${projectId}`, axiosConfig);
      const data = res.data?.data;
      
      setCategories(data?.categories || []);
      setItemsByCategory(data?.items || {});
      setLoadingState('boq', LOADING_STATES.SUCCESS);
    } catch (err) {
      setLoadingState('boq', LOADING_STATES.ERROR);
      handleError(err, 'boq');
    }
  }, [axiosConfig, setLoadingState, clearError, handleError]);

  const fetchItems = useCallback(async () => {
    setLoadingState('items', LOADING_STATES.LOADING);
    clearError('items');
    
    try {
      const res = await axios.get(API_CONFIG.ITEMS, axiosConfig);
      setItems(res.data?.data?.items || []);
      setLoadingState('items', LOADING_STATES.SUCCESS);
    } catch (err) {
      setLoadingState('items', LOADING_STATES.ERROR);
      handleError(err, 'items');
    }
  }, [axiosConfig, setLoadingState, clearError, handleError]);

  // Effects
  useEffect(() => {
    fetchProjects();
    fetchItems();
  }, [fetchProjects, fetchItems]);

  useEffect(() => {
    if (selectedProjectId) {
      fetchBoqData(selectedProjectId);
    }
  }, [selectedProjectId, fetchBoqData]);

  // Event handlers
  const handleProjectChange = useCallback((e) => {
    const projectId = Number(e.target.value);
    setSelectedProjectId(projectId);
  }, []);

  const handleItemChange = useCallback((e) => {
    const itemId = parseInt(e.target.value);
    const item = items.find((i) => i.id === itemId);
    setSelectedItem(item);
  }, [items]);

  const handleAddCategory = useCallback(async (e) => {
    e.preventDefault();
    
    if (!newCategoryName.trim()) {
      Swal.fire("Peringatan", "Nama kategori tidak boleh kosong", "warning");
      return;
    }

    setLoadingStates(prev => ({ ...prev, addingCategory: true }));
    
    try {
      await axios.post(
        API_CONFIG.CATEGORIES,
        {
          name: newCategoryName.trim(),
          parent_id: parentCategoryId || null,
          project_id: selectedProjectId,
        },
        axiosConfig
      );
      
      Swal.fire("Sukses", "Kategori berhasil ditambahkan", "success");
      setNewCategoryName("");
      setParentCategoryId(null);
      await fetchBoqData(selectedProjectId);
    } catch (err) {
      handleError(err, 'addCategory');
    } finally {
      setLoadingStates(prev => ({ ...prev, addingCategory: false }));
    }
  }, [newCategoryName, parentCategoryId, selectedProjectId, axiosConfig, fetchBoqData, handleError]);

  const handleAddItem = useCallback(async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
      item_id: parseInt(formData.get('item_id')),
      volume: parseFloat(formData.get('volume')),
      unit_price: parseFloat(formData.get('unit_price')),
      notes: formData.get('notes') || '',
      category_id: parseInt(formData.get('category_id')),
    };

    // Validation
    if (!data.item_id || !data.category_id || !data.volume || !data.unit_price) {
      Swal.fire("Peringatan", "Mohon lengkapi semua field yang diperlukan", "warning");
      return;
    }

    if (data.volume <= 0 || data.unit_price <= 0) {
      Swal.fire("Peringatan", "Volume dan harga satuan harus lebih dari 0", "warning");
      return;
    }

    setLoadingStates(prev => ({ ...prev, addingItem: true }));
    
    try {
      await axios.post(`${API_CONFIG.BOQ}/projects/${selectedProjectId}/items`, data, axiosConfig);
      
      Swal.fire("Sukses", "Item berhasil ditambahkan", "success");
      e.target.reset();
      setSelectedItem(null);
      await fetchBoqData(selectedProjectId);
    } catch (err) {
      handleError(err, 'addItem');
    } finally {
      setLoadingStates(prev => ({ ...prev, addingItem: false }));
    }
  }, [selectedProjectId, axiosConfig, fetchBoqData, handleError]);

  // Utility functions
  const getCategoryOptions = useCallback((cats, level = 0) =>
    cats.flatMap((cat) => [
      <option key={cat.id} value={cat.id}>
        {`${"\u2014".repeat(level)} ${cat.name}`}
      </option>,
      ...(cat.children ? getCategoryOptions(cat.children, level + 1) : []),
    ]), []);

  const getItemName = useCallback((id) => 
    items.find((i) => i.id === id)?.name || `Item #${id}`, [items]);

  const formatCurrency = useCallback((value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value), []);

  // Calculate totals
  const projectTotals = useMemo(() => {
    let totalItems = 0;
    let totalValue = 0;
    
    Object.values(itemsByCategory).forEach(items => {
      items.forEach(item => {
        totalItems++;
        totalValue += item.unit_price * item.volume;
      });
    });
    
    return { totalItems, totalValue };
  }, [itemsByCategory]);

  const renderCategoryTree = useCallback((cat, level = 0) => {
    const catItems = itemsByCategory[cat.id] || [];
    const hasChildren = cat.children?.length > 0;
    const hasItems = catItems.length > 0;

    if (!hasItems && !hasChildren) return null;

    return (
      <div key={cat.id} className="border-t">
        {/* Category Header */}
        {(hasItems || hasChildren) && (
          <div className={`bg-gray-${Math.min(200 + level * 50, 300)} font-semibold px-6 py-3 text-gray-800`}>
            {cat.name}
          </div>
        )}

        {/* Table Header - only show if this category has items */}
        {hasItems && (
          <div className="grid grid-cols-[60px_1fr_120px_80px_140px_160px] gap-4 bg-gray-100 text-sm font-semibold px-6 py-2 border-t">
            <div>No</div>
            <div>Uraian</div>
            <div className="text-center">Vol</div>
            <div className="text-center">Sat</div>
            <div className="text-right">Harga Satuan</div>
            <div className="text-right">Jumlah</div>
          </div>
        )}

        {/* Category Items */}
        {catItems.map((item, idx) => (
          <div key={`${item.id}-${idx}`} className="grid grid-cols-[60px_1fr_120px_80px_140px_160px] gap-4 items-center text-sm border-t px-6 py-3 bg-white hover:bg-gray-50">
            <div className="text-gray-600">{idx + 1}</div>
            <div className="font-medium text-left">{getItemName(item.item_id)}</div>
            <div className="text-center">{item.volume.toLocaleString()}</div>
            <div className="text-center text-gray-600">{item.satuan || "unit"}</div>
            <div className="text-right font-medium">{formatCurrency(item.unit_price)}</div>
            <div className="text-right font-bold text-blue-600">
              {formatCurrency(item.unit_price * item.volume)}
            </div>
          </div>
        ))}

        {/* Child Categories */}
        {hasChildren && cat.children.map((child) => renderCategoryTree(child, level + 1))}
      </div>
    );
  }, [itemsByCategory, getItemName, formatCurrency]);

  // Loading component
  const LoadingSpinner = ({ size = "sm" }) => (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${
      size === "sm" ? "h-4 w-4" : "h-8 w-8"
    }`}></div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Manajemen BOQ</h1>
          {loadingStates.projects === LOADING_STATES.LOADING && <LoadingSpinner />}
        </div>

        {/* Project Selection */}
        <div className="bg-white p-4 rounded-lg shadow">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pilih Proyek
          </label>
          <select
            className="w-full max-w-md p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedProjectId || ""}
            onChange={handleProjectChange}
            disabled={loadingStates.projects === LOADING_STATES.LOADING}
          >
            <option value="">Pilih Proyek</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {errors.projects && (
            <p className="mt-1 text-sm text-red-600">{errors.projects}</p>
          )}
        </div>

        {selectedProjectId && (
          <>
            {/* Summary Card */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">Ringkasan Proyek</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm opacity-90">Total Item</p>
                  <p className="text-2xl font-bold">{projectTotals.totalItems}</p>
                </div>
                <div>
                  <p className="text-sm opacity-90">Total Nilai</p>
                  <p className="text-2xl font-bold">{formatCurrency(projectTotals.totalValue)}</p>
                </div>
              </div>
            </div>

            {/* Add Category Form */}
            <form onSubmit={handleAddCategory} className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Tambah Kategori</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Kategori *
                  </label>
                  <input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    type="text"
                    placeholder="Masukkan nama kategori"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={loadingStates.addingCategory}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori Induk
                  </label>
                  <select
                    value={parentCategoryId || ""}
                    onChange={(e) => setParentCategoryId(e.target.value || null)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loadingStates.addingCategory}
                  >
                    <option value="">Tanpa Induk</option>
                    {getCategoryOptions(categories)}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={loadingStates.addingCategory || !newCategoryName.trim()}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                {loadingStates.addingCategory && <LoadingSpinner />}
                {loadingStates.addingCategory ? 'Menambahkan...' : 'Tambah Kategori'}
              </button>
            </form>

            {/* Add Item Form */}
            <form onSubmit={handleAddItem} className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Tambah Item ke Proyek</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pilih Item *
                  </label>
                  <select
                    name="item_id"
                    required
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={handleItemChange}
                    disabled={loadingStates.addingItem}
                  >
                    <option value="">Pilih Item</option>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori *
                  </label>
                  <select
                    name="category_id"
                    required
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loadingStates.addingItem}
                  >
                    <option value="">Pilih Kategori</option>
                    {getCategoryOptions(categories)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Volume *
                  </label>
                  <input
                    name="volume"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loadingStates.addingItem}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Harga Satuan *
                  </label>
                  <input
                    name="unit_price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={selectedItem?.harga_satuan || ""}
                    readOnly
                    className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catatan
                </label>
                <input
                  name="notes"
                  type="text"
                  placeholder="Catatan tambahan (opsional)"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loadingStates.addingItem}
                />
              </div>
              <button
                type="submit"
                disabled={loadingStates.addingItem}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                {loadingStates.addingItem && <LoadingSpinner />}
                {loadingStates.addingItem ? 'Menambahkan...' : 'Tambah Item'}
              </button>
            </form>
          </>
        )}

        {/* BOQ Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-xl font-bold text-gray-900">
              BOQ - {projects.find((p) => p.id === selectedProjectId)?.name || ""}
            </h2>
          </div>
          
          {loadingStates.boq === LOADING_STATES.LOADING ? (
            <div className="p-8 text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-2 text-gray-600">Memuat data BOQ...</p>
            </div>
          ) : (
            <>

              
              <div className="max-h-96 overflow-y-auto">
                {categories.length > 0 ? (
                  categories.map((cat) => renderCategoryTree(cat, 0))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <p>Belum ada data kategori untuk proyek ini.</p>
                    <p className="text-sm mt-1">Mulai dengan menambahkan kategori terlebih dahulu.</p>
                  </div>
                )}
              </div>
              
              {/* Total Footer */}
              {projectTotals.totalItems > 0 && (
                <div className="border-t bg-gray-50">
                  <div className="grid grid-cols-[60px_1fr_120px_80px_140px_160px] gap-4 items-center px-6 py-4 font-bold text-lg">
                    <div></div>
                    <div>Total ({projectTotals.totalItems} item)</div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div className="text-right text-blue-600">{formatCurrency(projectTotals.totalValue)}</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}