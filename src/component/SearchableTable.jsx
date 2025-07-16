// src/component/SearchableTable.jsx
import React, { useState } from "react";

export default function SearchableTable({ columns, data }) {
  const [search, setSearch] = useState("");

  const filtered = data.filter((item) =>
    columns.some((col) =>
      (item[col.key] || "").toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="overflow-x-auto">
      <input
        type="text"
        placeholder="Cari..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-3 px-3 py-2 border rounded w-full"
      />
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="border px-2 py-1 text-left">
                {col.label}
              </th>
            ))}
            <th className="border px-2 py-1">Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((row, i) => (
            <tr key={row.id || i} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.key} className="border px-2 py-1">
                  {row[col.key]}
                </td>
              ))}
              <td className="border px-2 py-1 text-center">{row.actions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
