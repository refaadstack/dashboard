// src/pages/AdminUser.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AdminNavbar from "../component/AdminNavbar.jsx";
import FormModal from "../component/FormModal.jsx";
import SearchableTable from "../component/SearchableTable.jsx";
import ActionButton from "../component/ActionButton.jsx";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE_URL = "http://localhost:5000/api/auth/users";

export default function AdminUser() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [selectedUser, setSelectedUser] = useState(null);

  // Debug: cek token
  console.log("AdminUser - Current token:", token);

  const fetchUsers = useCallback(async () => {
    try {
      console.log("Fetching users with token:", token); // Debug
      const res = await axios.get(API_BASE_URL, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      const usersData = res.data?.data?.users || res.data || [];
      console.log("Users fetched:", usersData); // Debug
      setUsers(Array.isArray(usersData) ? usersData : [usersData]);
    } catch (err) {
      console.error("Error fetching users:", err.response || err); // Debug
      Swal.fire("Error", "Gagal mengambil data user.", "error");
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const userFields = [
    { name: "name", label: "Full Name", type: "text" },
    { name: "email", label: "Email", type: "email" },
    { name: "password", label: "Password", type: "password" },
    { name: "roles", label: "Role", type: "select", options: [
      { value: "user", label: "User" },
      { value: "admin", label: "Admin" }
    ]},
  ];

  const handleAdd = () => {
    console.log("Opening add modal with token:", token); // Debug
    setModalMode("add");
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEdit = (user) => {
    console.log("Opening edit modal with token:", token); // Debug
    setModalMode("edit");
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDelete = async (user) => {
    const result = await Swal.fire({
      title: `Yakin hapus user ${user.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      console.log("Deleting user with token:", token); // Debug
      await axios.delete(`${API_BASE_URL}/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      Swal.fire("Terhapus!", "User berhasil dihapus.", "success");
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err.response || err); // Debug
      Swal.fire("Error", "Gagal menghapus user.", "error");
    }
  };

  return (
    <div>
      <AdminNavbar />

      <div className="p-6">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">User List</h2>
            <ActionButton label="Tambah" onClick={handleAdd} variant="add" />
          </div>

          <FormModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title={modalMode === "add" ? "Add User" : "Edit User"}
            fields={userFields}
            endpoint={
              modalMode === "add"
                ? API_BASE_URL
                : `${API_BASE_URL}/${selectedUser?.id}`
            }
            method={modalMode === "add" ? "post" : "put"}
            initialData={selectedUser}
            // token akan diambil dari AuthContext di FormModal
            onSuccess={() => {
              fetchUsers();
              setShowModal(false);
              Swal.fire(
                "Berhasil!",
                modalMode === "add"
                  ? "User berhasil ditambahkan."
                  : "User berhasil diupdate.",
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
                Swal.fire("Error", "User name is required.", "error");
                throw new Error("Validation failed: name empty.");
              }

              if (!data.email || data.email.trim() === "") {
                Swal.fire("Error", "Email is required.", "error");
                throw new Error("Validation failed: email empty.");
              }

              // Validation for password (only required for new users)
              if (modalMode === "add" && (!data.password || data.password.trim() === "")) {
                Swal.fire("Error", "Password is required for new users.", "error");
                throw new Error("Validation failed: password empty.");
              }

              const transformedData = {
                name: data.name,
                email: data.email,
                roles: data.roles || "user",
              };

              // Only include password if it's provided (for edit mode, password is optional)
              if (data.password && data.password.trim() !== "") {
                transformedData.password = data.password;
              }

              return transformedData;
            }}
          />

          <SearchableTable
            data={users.map((user) => ({
              ...user,
              role_badge: (
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.roles === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {user.roles || "user"}
                </span>
              ),
              status_badge: (
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              ),
              actions: (
                <div className="flex gap-2 justify-center">
                  <ActionButton
                    label="Edit"
                    onClick={() => handleEdit(user)}
                    variant="edit"
                  />
                  <ActionButton
                    label="Delete"
                    onClick={() => handleDelete(user)}
                    variant="delete"
                  />
                </div>
              ),
            }))}
            columns={[
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "role_badge", label: "Role" },
              { key: "status_badge", label: "Status" },
            ]}
          />

          {/* Stats */}
          {users.length > 0 && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Total Users: {users.length}</span>
                <span>Admin: {users.filter(u => u.roles === 'admin').length}</span>
                <span>Regular Users: {users.filter(u => u.roles !== 'admin').length}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}