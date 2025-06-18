import { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "../component/AdminNavbar";

export default function AdminUser() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token"); // Ambil token dari localStorage

    axios
      .get("http://localhost:5000/api/auth/user", {
        headers: {
          Authorization: `Bearer ${token}`, // Kirim token di header
        },
      })
      .then((res) => setUsers([res.data]))
      .catch((err) => console.error("Gagal ambil user:", err));
  }, []);

  return (
    <div>
      <AdminNavbar />
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Daftar User</h2>
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1 text-left">#</th>
              <th className="border px-2 py-1 text-left">Nama</th>
              <th className="border px-2 py-1 text-left">Email</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="border px-2 py-1">{i + 1}</td>
                <td className="border px-2 py-1">{user.name}</td>
                <td className="border px-2 py-1">{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
