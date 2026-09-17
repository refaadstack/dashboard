import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { TbSearch, TbChevronLeft, TbChevronRight } from "react-icons/tb";

const PAGE_SIZES = [10, 25, 50];

const alignClass = (col) =>
  col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left";

function pageWindow(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, 2, current - 1, current, current + 1, total - 1, total]);
  const nums = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < nums.length; i++) {
    out.push(nums[i]);
    if (i < nums.length - 1 && nums[i + 1] - nums[i] > 1) out.push("…");
  }
  return out;
}

export default function SearchableTable({ columns, data }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

  const filtered = useMemo(
    () =>
      data.filter((item) =>
        columns.some((col) =>
          (item[col.key] ?? "").toString().toLowerCase().includes(search.toLowerCase())
        )
      ),
    [data, columns, search]
  );

  useEffect(() => {
    setPage(1);
  }, [search, data.length, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, filtered.length);
  const rows = filtered.slice(start - 1, end);

  const navBtn =
    "rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <TbSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          Baris:
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 ${alignClass(col)}`}
                >
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {rows.map((row, i) => (
              <tr key={row.id ?? i} className="transition-colors hover:bg-gray-50">
                {columns.map((col, j) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-gray-900 ${alignClass(col)} ${col.numeric ? "tabular-nums" : ""} ${j === 0 ? "font-medium" : ""}`}
                  >
                    {row[col.key]}
                  </td>
                ))}
                <td className="px-4 py-3">{row.actions}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-10 text-center">
                  <p className="font-medium text-gray-900">
                    {search ? "Tidak ada data yang cocok" : "Belum ada data"}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {search ? `Tidak ditemukan hasil untuk "${search}".` : "Data akan muncul di sini setelah ditambahkan."}
                  </p>
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="mt-3 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
                    >
                      Reset pencarian
                    </button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm tabular-nums text-gray-500">
          Menampilkan {start}–{end} dari {filtered.length} data
        </p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Halaman sebelumnya"
            disabled={safePage <= 1}
            onClick={() => setPage(safePage - 1)}
            className={navBtn}
          >
            <TbChevronLeft className="h-4 w-4" />
          </button>
          {pageWindow(safePage, totalPages).map((n, i) =>
            n === "…" ? (
              <span key={`gap-${i}`} className="px-1 text-sm text-gray-400">
                …
              </span>
            ) : (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                aria-label={`Halaman ${n}`}
                aria-current={n === safePage ? "page" : undefined}
                className={`rounded-lg px-2.5 py-1.5 text-sm font-medium tabular-nums transition-colors active:translate-y-[1px] ${
                  n === safePage
                    ? "bg-blue-600 text-white"
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {n}
              </button>
            )
          )}
          <button
            type="button"
            aria-label="Halaman berikutnya"
            disabled={safePage >= totalPages}
            onClick={() => setPage(safePage + 1)}
            className={navBtn}
          >
            <TbChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

SearchableTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      align: PropTypes.oneOf(["left", "center", "right"]),
      numeric: PropTypes.bool,
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
};
