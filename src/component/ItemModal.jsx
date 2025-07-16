import React, { useState, useMemo } from "react";
import Modal from "./Modal.jsx";
import ActionButton from "./ActionButton.jsx";

const ItemModal = ({
  isOpen,
  onClose,
  title,
  availableItems,
  itemSearchTerm,
  setItemSearchTerm,
  onSelectItem,
}) => {
  const filteredItems = useMemo(() => {
    if (!itemSearchTerm) return availableItems;
    return availableItems.filter((item) =>
      item.name.toLowerCase().includes(itemSearchTerm.toLowerCase())
    );
  }, [availableItems, itemSearchTerm]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Search items..."
            className="w-full border border-gray-300 rounded p-2"
            value={itemSearchTerm}
            onChange={(e) => setItemSearchTerm(e.target.value)}
          />
        </div>
        <div className="max-h-80 overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="text-center text-gray-500">No items found.</div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-2 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                onClick={() => onSelectItem(item)}
              >
                <div>
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-xs text-gray-600">{item.description || "-"}</div>
                </div>
                <div className="text-sm text-gray-700">{item.harga_satuan?.toLocaleString("id-ID", { style: "currency", currency: "IDR" }) || "-"}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ItemModal;
