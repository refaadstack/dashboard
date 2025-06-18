import AdminNavbar from "../component/AdminNavbar";

export default function AdminVendor() {
  return (
    <div>
      <AdminNavbar />
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Daftar Vendor</h2>
        {/* Di sini nanti fetch vendor dari API */}
        <p className="text-gray-600">Belum ada data vendor.</p>
      </div>
    </div>
  );
}
