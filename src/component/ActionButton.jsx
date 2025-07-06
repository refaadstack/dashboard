// src/component/ActionButton.jsx
export default function ActionButton({ label, onClick, variant = "default" }) {
  const baseClass = "px-3 py-1 rounded text-sm text-white";
  const variantClass = {
    default: "bg-gray-500 hover:bg-gray-600",
    edit: "bg-yellow-500 hover:bg-yellow-600",
    delete: "bg-red-500 hover:bg-red-600",
    detail: "bg-green-500 hover:bg-green-600",
    add : "bg-blue-500 hover:bg-blue-600"
  };

  const classes = `${baseClass} ${variantClass[variant] || variantClass.default}`;

  return (
    <button onClick={onClick} className={classes}>
      {label}
    </button>
  );
}
