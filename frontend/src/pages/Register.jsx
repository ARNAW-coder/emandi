import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Register() {
  const [form, setForm] = useState({ name: "", phone: "", password: "", email: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/register", { ...form, role: "FARMER" });
      const { user, token } = res.data.data;
      login(token, user);
      showToast("Account created — welcome to e-Mandi!");
      navigate("/farmer/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1 text-green-700">Create Account</h1>
        <p className="text-gray-500 mb-6">Register as a farmer</p>

        {["name", "phone", "password"].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium mb-1 capitalize">{field}</label>
            <input
              name={field}
              type={field === "password" ? "password" : "text"}
              value={form[field]}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        ))}

        <label className="block text-sm font-medium mb-1">Email (optional)</label>
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <button
          disabled={loading}
          className="w-full bg-green-600 text-white rounded py-2 font-medium hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Already have an account? <Link to="/login" className="text-green-600 font-medium">Sign In</Link>
        </p>
      </form>
    </div>
  );
}