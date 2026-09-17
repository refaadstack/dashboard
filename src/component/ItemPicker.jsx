import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { TbSearch, TbX } from "react-icons/tb";

const fmt = (v) => `Rp${Number(v ?? 0).toLocaleString("id-ID")}`;

export default function ItemPicker({ items, value, onSelect, placeholder = "Ketik untuk cari item...", disabled = false }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const selected = useMemo(
    () => items.find((i) => String(i.id) === String(value)),
    [items, value]
  );

  useEffect(() => {
    if (!value) setQuery("");
  }, [value]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? items.filter((i) => (i.name || "").toLowerCase().includes(q)) : items;
    return list.slice(0, 50);
  }, [items, query]);

  const pick = (item) => {
    onSelect(item);
    setOpen(false);
  };

  return (
    <div
      className="relative"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <div className="relative">
        <TbSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={open ? query : selected ? selected.name : ""}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (e.target.value === "") onSelect(null);
          }}
          onFocus={() => {
            setQuery("");
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
        {selected && !open && (
          <button
            type="button"
            aria-label="Hapus pilihan item"
            onClick={() => onSelect(null)}
            disabled={disabled}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <TbX className="h-4 w-4" />
          </button>
        )}
      </div>
      {open && !disabled && (
        <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {results.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-500">Tidak ada item yang cocok.</li>
          ) : (
            results.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(item)}
                  className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-blue-50 ${
                    selected && String(selected.id) === String(item.id) ? "bg-blue-50" : ""
                  }`}
                >
                  <span>
                    <span className="block font-medium text-gray-900">{item.name}</span>
                    <span className="block text-xs text-gray-500">
                      {item.satuan || "unit"} • {fmt(item.harga_satuan)}
                    </span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

ItemPicker.propTypes = {
  items: PropTypes.array.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSelect: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
};
