import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode }  from "jwt-decode";


export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    roles: "user",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const navigate = useNavigate();

    const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        });

        const data = await res.json();
        if (res.ok) {
        // Login langsung setelah register (optional)
        const loginRes = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: form.email, password: form.password }),
        });

        const loginData = await loginRes.json();
        localStorage.setItem("token", loginData.token);
        const decoded = jwtDecode(loginData.token);

        if (decoded.roles === "admin") {
            navigate("/admin");
        } else {
            navigate("/dashboard");
        }
        } else {
        alert(data.message || "Register failed");
        }
    } catch (err) {
        alert("Error: " + err.message);
    }
    };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-96 space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center">Register</h2>
        <input
          name="name"
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          className="w-full border rounded-lg px-4 py-2"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border rounded-lg px-4 py-2"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full border rounded-lg px-4 py-2"
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
        >
          Register
        </button>
      </form>
    </div>
  );
}
