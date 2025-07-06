// src/pages/AdminProject.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AdminNavbar from "../component/AdminNavbar.jsx";
import FormModal from "../component/FormModal.jsx";
import SearchableTable from "../component/SearchableTable.jsx";
import ActionButton from "../component/ActionButton.jsx";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE_URL = "http://localhost:3004/api/projects";

export default function AdminProject() {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [selectedProject, setSelectedProject] = useState(null);

  // Debug: cek token
  console.log("AdminProject - Current token:", token);

  const fetchProjects = useCallback(async () => {
    try {
      console.log("Fetching projects with token:", token); // Debug
      const res = await axios.get(API_BASE_URL, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      const projectsData = res.data?.data?.projects || res.data || [];
      console.log("Projects fetched:", projectsData); // Debug
      setProjects(projectsData);
    } catch (err) {
      console.error("Error fetching projects:", err.response || err); // Debug
      Swal.fire("Error", "Gagal mengambil data project.", "error");
    }
  }, [token]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const projectFields = [
    { name: "name", label: "Project Name", type: "text" },
    { name: "description", label: "Description", type: "text" },
    { name: "start_date", label: "Start Date", type: "date" },
    { name: "end_date", label: "End Date", type: "date" },
    { name: "budget", label: "Budget", type: "integer" },
  ];

  const handleAdd = () => {
    console.log("Opening add modal with token:", token); // Debug
    setModalMode("add");
    setSelectedProject(null);
    setShowModal(true);
  };

  const handleEdit = (project) => {
    console.log("Opening edit modal with token:", token); // Debug
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
      console.log("Deleting project with token:", token); // Debug
      await axios.delete(`${API_BASE_URL}/${project.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      Swal.fire("Terhapus!", "Project berhasil dihapus.", "success");
      fetchProjects();
    } catch (err) {
      console.error("Error deleting project:", err.response || err); // Debug
      Swal.fire("Error", "Gagal menghapus project.", "error");
    }
  };

  return (
    <div>
      <AdminNavbar />

      <div className="p-6">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Project List</h2>
            <ActionButton label="Tambah" onClick={handleAdd} variant="add" />
          </div>

          <FormModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title={modalMode === "add" ? "Add Project" : "Edit Project"}
            fields={projectFields}
            endpoint={
              modalMode === "add"
                ? API_BASE_URL
                : `${API_BASE_URL}/${selectedProject?.id}`
            }
            method={modalMode === "add" ? "post" : "put"}
            initialData={selectedProject}
            // token akan diambil dari AuthContext di FormModal
            onSuccess={() => {
              fetchProjects();
              setShowModal(false);
              Swal.fire(
                "Berhasil!",
                modalMode === "add"
                  ? "Project berhasil ditambahkan."
                  : "Project berhasil diupdate.",
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

          <SearchableTable
            data={projects.map((project) => ({
              ...project,
              actions: (
                <div className="flex gap-2 justify-center">
                  <ActionButton
                    label="Edit"
                    onClick={() => handleEdit(project)}
                    variant="edit"
                  />
                  <ActionButton
                    label="Delete"
                    onClick={() => handleDelete(project)}
                    variant="delete"
                  />
                </div>
              ),
            }))}
            columns={[
              { key: "name", label: "Name" },
              { key: "description", label: "Description" },
              { key: "start_date", label: "Start Date" },
              { key: "end_date", label: "End Date" },
              { key: "budget", label: "Budget" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}