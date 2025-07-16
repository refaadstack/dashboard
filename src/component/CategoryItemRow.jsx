import React from "react";
import ActionButton from "./ActionButton.jsx";

const CategoryItemRow = ({
  category,
  level,
  index,
  categoryItems,
  handleAddItemToCategory,
  handleAddCategory,
  handleEditCategory,
  handleDeleteCategory,
  handleRemoveItemFromCategory,
  formatCurrency,
  renderBoqRow,
}) => {
  const getCategoryNumbering = (category, level, index) => {
    if (level === 0) return ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][index] || (index + 1);
    if (level === 1) return String.fromCharCode(65 + index) + ".";
    if (level === 2) return (index + 1) + ".";
    return (index + 1) + ".";
  };

  const numbering = getCategoryNumbering(category, level, index);
  const items = categoryItems[category.id] || [];

  return (
    <div key={category.id} className="divide-y divide-gray-200">
      {/* Category Header */}
      <div
        className={`
          flex border-b border-gray-200 min-h-10
          ${level === 0 ? "bg-gray-100 font-bold text-sm" : ""}
          ${level === 1 ? "bg-gray-50 font-bold text-xs" : ""}
          ${level >= 2 ? "bg-white font-semibold text-xs" : ""}
        `}
      >
        <div className="w-12 min-w-12 p-2 border-r border-gray-200 flex items-center justify-center">
          <span className="font-bold text-sm">{numbering}</span>
        </div>
        <div className="flex-1 min-w-96 p-2 border-r border-gray-200">
          <div className="flex justify-between items-center w-full">
            <div>
              <span className="font-bold">{category.name}</span>
              <span className="ml-2 text-xs text-gray-500">({items.length} items)</span>
            </div>
            <div className="flex gap-1">
              <ActionButton
                label="Add Item"
                variant="success"
                onClick={() => handleAddItemToCategory(category)}
                size="sm"
              />
              <ActionButton
                label="Add Sub"
                variant="info"
                onClick={() => handleAddCategory(category.id)}
                size="sm"
              />
              <ActionButton
                label="Edit"
                variant="edit"
                onClick={() => handleEditCategory(category)}
                size="sm"
              />
              <ActionButton
                label="Delete"
                variant="delete"
                onClick={() => handleDeleteCategory(category)}
                size="sm"
              />
            </div>
          </div>
        </div>
        <div className="w-20 p-2 border-r border-gray-200 flex items-center justify-center"></div>
        <div className="w-20 p-2 border-r border-gray-200 flex items-center justify-center"></div>
        <div className="w-32 p-2 border-r border-gray-200 flex items-center justify-end"></div>
        <div className="w-32 p-2 border-r border-gray-200 flex items-center justify-end"></div>
        <div className="w-20 p-2 flex items-center justify-center"></div>
      </div>

      {/* Category Items */}
      {items && items.length > 0 ? (
        items.map((item, itemIndex) => (
          <div
            key={`${category.id}-${item.id}`}
            className="flex border-b border-gray-200 min-h-10 bg-white hover:bg-gray-50"
          >
            <div className="w-12 min-w-12 p-2 border-r border-gray-200 flex items-center justify-center">
              <span className="text-sm">{itemIndex + 1}</span>
            </div>
            <div className="flex-1 min-w-96 p-2 border-r border-gray-200">
              <div className="pl-5 flex justify-between items-center w-full">
                <div>
                  <div className="font-medium text-sm mb-1">{item.name}</div>
                  {item.description && <div className="text-xs text-gray-600">{item.description}</div>}
                </div>
                <div className="flex gap-1">
                  <ActionButton
                    label="Remove"
                    variant="delete"
                    onClick={() => handleRemoveItemFromCategory(category.id, item.id)}
                    size="xs"
                  />
                </div>
              </div>
            </div>
            <div className="w-20 p-2 border-r border-gray-200 flex items-center justify-center">
              <span className="text-xs font-mono">{item.volume || 0}</span>
            </div>
            <div className="w-20 p-2 border-r border-gray-200 flex items-center justify-center">
              <span className="text-xs font-mono">{item.satuan || "-"}</span>
            </div>
            <div className="w-32 p-2 border-r border-gray-200 flex items-center justify-end">
              <span className="text-xs font-mono">{formatCurrency(item.harga_satuan || 0)}</span>
            </div>
            <div className="w-32 p-2 border-r border-gray-200 flex items-center justify-end">
              <span className="text-xs font-mono">{formatCurrency((item.volume || 0) * (item.harga_satuan || 0))}</span>
            </div>
            <div className="w-20 p-2 flex items-center justify-center"></div>
          </div>
        ))
      ) : (
        <div className="flex border-b border-gray-200 min-h-10 bg-gray-50">
          <div className="w-12 min-w-12 p-2 border-r border-gray-200"></div>
          <div className="flex-1 min-w-96 p-2 border-r border-gray-200">
            <div className="pl-5 text-xs text-gray-500 italic">No items in this category</div>
          </div>
          <div className="w-20 p-2 border-r border-gray-200"></div>
          <div className="w-20 p-2 border-r border-gray-200"></div>
          <div className="w-32 p-2 border-r border-gray-200"></div>
          <div className="w-32 p-2 border-r border-gray-200"></div>
          <div className="w-20 p-2"></div>
        </div>
      )}

      {/* Recursively render children */}
      {category.children && category.children.length > 0
        ? category.children.map((child, childIndex) => renderBoqRow(child, level + 1, childIndex))
        : null}
    </div>
  );
};

export default CategoryItemRow;
