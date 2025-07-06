// src/component/FormModal.jsx
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import axios from "axios";
import SubmitButton from "./SubmitButton";
import { useAuth } from "../context/AuthContext"; // Import useAuth

export default function FormModal({
  isOpen,
  onClose,
  title,
  fields,
  endpoint,
  method = "post",
  initialData = {},
  onSuccess,
  onError, // added onError prop
  transformData, // ← Tambahan agar bisa override data sebelum submit
  token, // Tetap terima token prop untuk backward compatibility
}) {
  const { token: authToken } = useAuth(); // Ambil token dari AuthContext
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  // Gunakan token dari AuthContext sebagai fallback jika tidak ada token prop
  const finalToken = token || authToken;

  console.log("FormModal - Using token:", finalToken); // Debug

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || {});
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: null }));
  };

  const validateField = (name, value, type) => {
    if (type === "text") {
      if (!value || value.trim() === "") {
        return `${name} wajib diisi.`;
      }
    } else if (type === "number") {
      const num = Number(value);
      if (isNaN(num) || num < 0) {
        return `${name} harus berupa angka >= 0.`;
      }
    } else if (type === "integer") {
      const num = Number(value);
      if (isNaN(num) || !Number.isInteger(num) || num < 0) {
        return `${name} harus berupa bilangan bulat >= 0.`;
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};
    fields.forEach((field) => {
      const error = validateField(field.label, formData[field.name], field.type || "text");
      if (error) {
        newErrors[field.name] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    let dataToSubmit = formData;
    if (typeof transformData === "function") {
      try {
        dataToSubmit = transformData(formData);
      } catch (err) {
        console.warn("TransformData error:", err.message);
        return;
      }
    }

    try {
      console.log("FormModal - Submitting with token:", finalToken); // Debug
      console.log("FormModal - Endpoint:", endpoint); // Debug
      console.log("FormModal - Method:", method); // Debug
      console.log("FormModal - Data:", dataToSubmit); // Debug

      const config = {
        headers: {
          'Authorization': `Bearer ${finalToken}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      };

      if (method === "put") {
        await axios.put(endpoint, dataToSubmit, config);
      } else {
        await axios.post(endpoint, dataToSubmit, config);
      }
      
      console.log("FormModal - Success!"); // Debug
      onSuccess?.();
    } catch (err) {
      console.error("FormModal - Error:", err.response || err); // Debug
      console.log("FormModal - Error detail:", err.response?.data);
      onError?.(err.response?.data); // call onError with error data
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-full p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md bg-white rounded-xl shadow-xl p-6">
                <Dialog.Title className="text-lg font-semibold mb-4">{title}</Dialog.Title>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {fields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm mb-1">{field.label}</label>
                      <input
                        type={field.type === "integer" ? "number" : field.type || "text"}
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        className={`w-full border rounded px-3 py-2 text-sm ${errors[field.name] ? "border-red-500" : ""}`}
                        required
                        min={field.type === "number" || field.type === "integer" ? 0 : undefined}
                        step={field.type === "number" ? "any" : field.type === "integer" ? 1 : undefined}
                      />
                      {errors[field.name] && (
                        <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
                      )}
                    </div>
                  ))}

                  <div className="flex justify-end gap-2 mt-6">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                    >
                      Batal
                    </button>
                    <SubmitButton label={method === "put" ? "Update" : "Simpan"} type="submit" />
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}