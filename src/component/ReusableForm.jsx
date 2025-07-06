import { useState } from "react";
import axios from "axios";
import SubmitButton from "./SubmitButton";

export default function ReusableForm({ fields, endpoint, onSuccess, initialData = {} }) {
  const [form, setForm] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(endpoint, form, { withCredentials: true });
      onSuccess?.();
    } catch (err) {
      console.error("Gagal submit:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {fields.map((field) => (
        <div key={field.name}>
          <label className="block mb-1 font-medium">{field.label}</label>
          <input
            name={field.name}
            value={form[field.name] || ""}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
      ))}
      <SubmitButton loading={loading} />
    </form>
  );
}