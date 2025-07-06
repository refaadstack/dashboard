// src/pages/AdminVendor.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AdminNavbar from "../component/AdminNavbar.jsx";
import FormModal from "../component/FormModal.jsx";
import SearchableTable from "../component/SearchableTable.jsx";
import ActionButton from "../component/ActionButton.jsx";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext.jsx";

// Constants
const API_BASE_URL = "http://localhost:3002/api/vendors";

export default function AdminVendor() {
  const { token } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [selectedVendor, setSelectedVendor] = useState(null);

  // Debug: cek token
  console.log("AdminVendor - Current token:", token);

  const fetchVendors = useCallback(async () => {
    try {
      console.log("Fetching vendors with token:", token); // Debug
      const res = await axios.get(API_BASE_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      const vendorsData = res.data?.data?.vendors || res.data || [];
      console.log("Vendors fetched:", vendorsData); // Debug
      setVendors(vendorsData);
    } catch (err) {
      console.error("Error fetching vendors:", err.response || err); // Debug
      Swal.fire("Error", "Gagal mengambil data vendor.", "error");
    }
  }, [token]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const vendorFields = [
    { name: "name", label: "Nama Vendor", type: "text" },
    { name: "address", label: "Alamat", type: "text" },
    { name: "phone", label: "Telepon", type: "text" },
  ];

  const handleAdd = () => {
    console.log("Opening add modal with token:", token); // Debug
    setModalMode("add");
    setSelectedVendor(null);
    setShowModal(true);
  };

  const handleEdit = (vendor) => {
    console.log("Opening edit modal with token:", token); // Debug
    setModalMode("edit");
    setSelectedVendor(vendor);
    setShowModal(true);
  };

  const handleDelete = async (vendor) => {
    const result = await Swal.fire({
      title: `Yakin hapus vendor ${vendor.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      console.log("Deleting vendor with token:", token); // Debug
      await axios.delete(`${API_BASE_URL}/${vendor.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      Swal.fire("Terhapus!", "Vendor berhasil dihapus.", "success");
      fetchVendors();
    } catch (err) {
      console.error("Error deleting vendor:", err.response || err); // Debug
      Swal.fire("Error", "Gagal menghapus vendor.", "error");
    }
  };

  return (
    <div>
      <AdminNavbar />

      <div className="p-6">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6">

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Daftar Vendor</h2>
            <ActionButton label="Tambah" onClick={handleAdd} variant="add" />
          </div>

          <FormModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title={modalMode === "add" ? "Tambah Vendor" : "Edit Vendor"}
            fields={vendorFields}
            endpoint={
              modalMode === "add"
                ? API_BASE_URL
                : `${API_BASE_URL}/${selectedVendor?.id}`
            }
            method={modalMode === "add" ? "post" : "put"}
            initialData={selectedVendor}
            // token akan diambil dari AuthContext di FormModal
            onSuccess={() => {
              fetchVendors();
              setShowModal(false);
              Swal.fire(
                "Berhasil!",
                modalMode === "add"
                  ? "Vendor berhasil ditambahkan."
                  : "Vendor berhasil diupdate.",
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
                Swal.fire("Error", "Nama Vendor wajib diisi.", "error");
                throw new Error("Validasi gagal: Nama kosong.");
              }
              if (!data.address || data.address.trim() === "") {
                Swal.fire("Error", "Alamat wajib diisi.", "error");
                throw new Error("Validasi gagal: Alamat kosong.");
              }
              if (!data.phone || data.phone.trim() === "") {
                Swal.fire("Error", "Telepon wajib diisi.", "error");
                throw new Error("Validasi gagal: Telepon kosong.");
              }

              return {
                name: data.name,
                address: data.address,
                phone: data.phone,
              };
            }}
          />

          <SearchableTable
            data={vendors.map((vendor) => ({
              ...vendor,
              actions: (
                <div className="flex gap-2 justify-center">
                  <ActionButton
                    label="Edit"
                    onClick={() => handleEdit(vendor)}
                    variant="edit"
                  />
                  <ActionButton
                    label="Hapus"
                    onClick={() => handleDelete(vendor)}
                    variant="delete"
                  />
                </div>
              ),
            }))}
            columns={[
              { key: "name", label: "Nama" },
              { key: "address", label: "Alamat" },
              { key: "phone", label: "Telepon" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}