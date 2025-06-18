import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/AdminPanel";
import AdminVendor from "./pages/AdminVendor";
import AdminUser from "./pages/AdminUser";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/vendor" element={<AdminVendor/>}/>
        <Route path="/admin/users" element={<AdminUser/>}/>
      </Routes>
    </Router>
  );
}
