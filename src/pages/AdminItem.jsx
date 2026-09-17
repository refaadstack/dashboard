// src/pages/AdminItem.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AdminNavbar from "../component/AdminNavbar.jsx";
import FormModal from "../component/FormModal.jsx";
import SearchableTable from "../component/SearchableTable.jsx";
import ActionButton from "../component/ActionButton.jsx";
import RowActions from "../component/RowActions.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import Swal from "sweetalert2";

const API_BASE_URL = "/api/items";

export default function AdminItem() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedItem, setSelectedItem] = useState(null);

  // Debug: cek token

  const fetchItems = useCallback(async () => {
    try {
      const res = await axios.get(API_BASE_URL, {
        params: { limit: 500 },
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      const itemsData = res.data?.data?.items || [];
      setItems(itemsData);
    } catch (err) {
      console.error("Error fetching items:", err.response || err); // Debug
      Swal.fire("Error", "Gagal mengambil data item.", "error");
    }
  }, [token]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const itemFields = [
    { name: "name", label: "Nama Item", type: "text" },
    { name: "volume", label: "Volume", type: "number" },
    {
      name: "satuan",
      label: "Satuan",
      type: "select",
      options: [
        { value: "pcs", label: "pcs" },
        { value: "kg", label: "kg" },
        { value: "m", label: "m" },
        { value: "m2", label: "m2" },
        { value: "m3", label: "m3" },
        { value: "unit", label: "unit" },
        { value: "set", label: "set" },
        { value: "box", label: "box" },
        { value: "roll", label: "roll" },
      ],
      required: true,
    },
    { name: "harga_satuan", label: "Harga Satuan", type: "integer" },
  ];

  const handleAdd = () => {
    setModalMode("add");
    setSelectedItem(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setModalMode("edit");
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: `Yakin hapus item ${item.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/${item.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      Swal.fire("Terhapus!", "Item berhasil dihapus.", "success");
      fetchItems();
    } catch (err) {
      console.error("Error deleting item:", err.response || err); // Debug
      Swal.fire("Error", "Gagal menghapus item.", "error");
    }
  };

  return (
    <div>
      <AdminNavbar />

      <div className="p-6">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Daftar Item</h2>
            <ActionButton label="Tambah" onClick={handleAdd} variant="add" />
          </div>

          <FormModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title={modalMode === "add" ? "Tambah Item" : "Edit Item"}
            fields={itemFields}
            endpoint={
              modalMode === "add"
                ? API_BASE_URL
                : `${API_BASE_URL}/${selectedItem?.id}`
            }
            method={modalMode === "add" ? "post" : "put"}
            initialData={selectedItem}
            // token akan diambil dari AuthContext di FormModal
            onSuccess={() => {
              fetchItems();
              setShowModal(false);
              Swal.fire(
                "Berhasil!",
                modalMode === "add"
                  ? "Item berhasil ditambahkan."
                  : "Item berhasil diupdate.",
                "success"
              );
            }}
            onError={(errorData) => {
              console.error("FormModal error:", errorData); // Debug
              Swal.fire(
                "Error",
                errorData?.message || "Terjadi kesalahan saat menyimpan data.",
                "error"
              );
            }}
            transformData={(data) => {
              if (!data.name || data.name.trim() === "") {
                Swal.fire("Error", "Nama wajib diisi.", "error");
                throw new Error("Validasi gagal: Nama kosong.");
              }
              if (!data.satuan || data.satuan.trim() === "") {
                Swal.fire("Error", "Satuan wajib diisi.", "error");
                throw new Error("Validasi gagal: Satuan kosong.");
              }

              const volumeNum = Number(data.volume);
              if (isNaN(volumeNum) || volumeNum < 0) {
                Swal.fire("Error", "Volume harus berupa angka >= 0.", "error");
                throw new Error("Validasi gagal: Volume tidak valid.");
              }

              const hargaNum = Number(data.harga_satuan);
              if (
                isNaN(hargaNum) ||
                !Number.isInteger(hargaNum) ||
                hargaNum < 0
              ) {
                Swal.fire(
                  "Error",
                  "Harga satuan harus berupa bilangan bulat >= 0.",
                  "error"
                );
                throw new Error("Validasi gagal: Harga satuan tidak valid.");
              }

              return {
                name: data.name,
                satuan: data.satuan,
                volume: volumeNum,
                harga_satuan: hargaNum,
              };
            }}
          />

          <SearchableTable
            data={items.map((item) => ({
              ...item,
              actions: (
                <RowActions onEdit={() => handleEdit(item)} onDelete={() => handleDelete(item)} />
              ),
            }))}
            columns={[
              { key: "name", label: "Nama" },
              { key: "volume", label: "Volume", align: "right", numeric: true },
              { key: "satuan", label: "Satuan" },
              { key: "harga_satuan", label: "Harga Satuan", align: "right", numeric: true },
            ]}
          />
        </div>
      </div>
    </div>
  );
}