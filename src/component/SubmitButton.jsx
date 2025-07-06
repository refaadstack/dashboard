export default function SubmitButton({ loading }) {
  return (
    <button
      type="submit"
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
      disabled={loading}
    >
      {loading ? "Menyimpan..." : "Simpan"}
    </button>
  );
}