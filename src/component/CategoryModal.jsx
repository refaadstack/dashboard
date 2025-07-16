import React from "react";
import FormModal from "./FormModal.jsx";

const CategoryModal = ({
  isOpen,
  onClose,
  mode,
  category,
  parentId,
  categoryFields,
  apiBaseUrl,
  selectedProjectId,
  onSuccess,
  onError,
}) => {
  const endpoint =
    mode === "add"
      ? `${apiBaseUrl}/projects/${selectedProjectId}/categories`
      : `${apiBaseUrl}/categories/${category?.id}`;

  const method = mode === "add" ? "post" : "put";

  const initialData =
    mode === "add"
      ? { parent_id: parentId, level: 1, order_seq: 0, is_active: true }
      : category;

  const transformData = (data) => ({
    parent_id: data.parent_id || null,
    name: data.name,
    level: Number(data.level) || 1,
    order_seq: Number(data.order_seq) || 0,
    is_active: Boolean(data.is_active),
  });

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "add" ? "Add Category" : "Edit Category"}
      fields={categoryFields}
      endpoint={endpoint}
      method={method}
      initialData={initialData}
      onSuccess={onSuccess}
      onError={onError}
      transformData={transformData}
    />
  );
};

export default CategoryModal;
