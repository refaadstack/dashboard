import { Link } from "react-router-dom";
import {
  TbFolder,
  TbClipboardList,
  TbLayersIntersect,
  TbPackages,
  TbSend,
  TbChecks,
  TbFileDownload,
  TbLock,
  TbUsers,
  TbBuildingStore,
} from "react-icons/tb";
import AdminNavbar from "../component/AdminNavbar.jsx";
import Navbar from "../component/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const STEPS = [
  {
    icon: TbFolder,
    title: "1. Buat Project",
    to: "/admin/project",
    body: "Buka menu Projects, klik Add Project, isi nama, deskripsi, dan budget. Satu project boleh memiliki banyak BOQ (misal BOQ Struktur dan BOQ Arsitektur), boleh juga belum punya BOQ sama sekali.",
  },
  {
    icon: TbClipboardList,
    title: "2. Buat BOQ",
    to: "/admin/boq",
    body: "Buka menu BOQ, pilih project, isi nama BOQ lalu klik Tambah BOQ. Pilih BOQ yang baru dibuat dari daftar untuk mengelolanya.",
  },
  {
    icon: TbLayersIntersect,
    title: "3. Tambah Section",
    to: "/admin/boq",
    body: "Section adalah pengelompok item, contoh: Pekerjaan Beton, Pekerjaan Besi. Isi nama section lalu klik Tambah. Section yang dihapus membuat itemnya menjadi tanpa section, tidak ikut terhapus.",
  },
  {
    icon: TbPackages,
    title: "4. Tambah Item",
    to: "/admin/boq",
    body: "Pilih section, lalu isi nama item, satuan, volume, dan harga satuan. Bisa pilih dari master item agar nama, satuan, dan harga terisi otomatis. Jumlah baris dan Grand Total dihitung otomatis (volume x harga satuan). Item bisa diubah dan dihapus selama BOQ masih Draft atau Ditolak.",
  },
  {
    icon: TbSend,
    title: "5. Ajukan Persetujuan",
    to: "/admin/boq",
    body: "Klik Ajukan bila BOQ sudah lengkap. Sistem menyimpan snapshot versi (versi 1, 2, dst) berisi seluruh section, item, dan total saat itu. BOQ yang sudah diajukan terkunci dan tidak bisa diubah.",
  },
  {
    icon: TbChecks,
    title: "6. Setujui atau Tolak",
    to: "/admin/boq",
    body: "Admin membuka Riwayat Versi lalu klik Setujui atau Tolak beserta catatan. Hanya versi terbaru yang berstatus Diajukan yang bisa diputuskan. BOQ yang ditolak kembali bisa diubah lalu diajukan ulang sebagai versi baru.",
  },
  {
    icon: TbFileDownload,
    title: "7. Export Excel / PDF",
    to: "/admin/boq",
    body: "Klik Excel atau PDF untuk membuka dialog export. Excel selalu diunduh lengkap; untuk PDF bisa pilih blok yang tampil: kop, info proyek, ID, section, rincian item, dan total." ,
  },
];

const STATUS = [
  ["Draft", "BOQ baru atau hasil revisi. Bebas tambah, ubah, hapus section dan item."],
  ["Diajukan", "Menunggu keputusan admin. Seluruh form terkunci."],
  ["Disetujui", "Versi final yang disetujui admin. Terkunci dan tidak bisa diubah lagi."],
  ["Ditolak", "Ditolak admin beserta catatan. Kembali bisa diubah dan diajukan ulang."],
];

const MASTERS = [
  { icon: TbBuildingStore, title: "Vendor", to: "/admin/vendor", body: "Daftar rekanan: nama, alamat, telepon. Data referensi untuk pengadaan." },
  { icon: TbPackages, title: "Items", to: "/admin/item", body: "Master material: nama, satuan, harga, stok volume. Dipakai untuk isi otomatis saat tambah item BOQ." },
  { icon: TbUsers, title: "Users", to: "/admin/users", body: "Kelola akun. Role admin bisa membuka semua menu admin dan menyetujui BOQ. Role user hanya melihat Dashboard." },
];

export default function Panduan() {
  const { user } = useAuth();
  const isAdmin = user?.roles === "admin";

  return (
    <div className="min-h-screen bg-gray-50">
      {isAdmin ? <AdminNavbar /> : <Navbar />}
      <div className="mx-auto max-w-4xl p-4 sm:p-6">
        <h1 className="text-2xl font-bold text-gray-900">Panduan Penggunaan</h1>
        <p className="mt-1 text-gray-600">
          Alur lengkap memakai Sistem BOQ, dari buat project sampai export. Anda login sebagai{" "}
          <b>{user?.name || "-"}</b> ({user?.roles || "user"}).
        </p>

        <h2 className="mt-8 text-lg font-bold text-gray-900">Alur kerja BOQ</h2>
        <div className="mt-3 space-y-3">
          {STEPS.map((s) => (
            <div key={s.title} className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="h-fit rounded-lg bg-blue-600 p-2 text-white">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900">
                  {s.title}{" "}
                  {isAdmin && (
                    <Link to={s.to} className="ml-1 text-sm font-medium text-blue-600 hover:underline">
                      Buka
                    </Link>
                  )}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="mt-8 text-lg font-bold text-gray-900">Arti status BOQ</h2>
        <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Artinya</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {STATUS.map(([name, desc]) => (
                <tr key={name}>
                  <td className="whitespace-nowrap p-3 font-bold text-gray-900">{name}</td>
                  <td className="p-3 text-gray-600">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 flex items-start gap-2 text-sm text-gray-600">
          <TbLock className="mt-0.5 h-4 w-4 shrink-0" />
          Aturan kunci: form section dan item hanya aktif saat status Draft atau Ditolak.
        </p>

        {isAdmin && (
          <>
            <h2 className="mt-8 text-lg font-bold text-gray-900">Data master</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {MASTERS.map((m) => (
                <Link key={m.title} to={m.to} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-blue-600 p-2 text-white">
                      <m.icon className="h-4 w-4" />
                    </div>
                    <p className="font-bold text-gray-900">{m.title}</p>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{m.body}</p>
                </Link>
              ))}
            </div>
          </>
        )}

        <h2 className="mt-8 text-lg font-bold text-gray-900">Tanya jawab</h2>
        <div className="mt-3 space-y-3 text-sm">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="font-bold text-gray-900">Kenapa tombol Tambah Item tidak ada?</p>
            <p className="mt-1 text-gray-600">BOQ berstatus Diajukan atau Disetujui sehingga terkunci. Lihat badge status di kartu ringkasan.</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="font-bold text-gray-900">Siapa yang bisa menyetujui BOQ?</p>
            <p className="mt-1 text-gray-600">Hanya akun berole admin, lewat tombol Setujui di Riwayat Versi.</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="font-bold text-gray-900">Apakah satu project bisa punya dua BOQ?</p>
            <p className="mt-1 text-gray-600">Bisa. Pilih project, tambah BOQ baru, lalu kelola lewat daftar Pilih BOQ.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
