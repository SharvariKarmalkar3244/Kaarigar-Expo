import { useState } from "react";
import { loginUser } from "../../api/authApi";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { X, Loader2, AlertCircle } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = await loginUser(form);

      login(data);

      if (data.role === "ADMIN") {
        navigate("/admin");
      } else if (data.role === "KAARIGAR") {
        navigate("/kaarigar");
      } else {
        navigate("/visitor");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#FDFBF7] px-4 py-12 text-[#2B2118]">
      {/* Background Decorative Accent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#EFE8DC]/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#EFE8DC]/40 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        {/* Close Button */}
        <Link
          to="/"
          className="absolute top-5 right-5 text-gray-400 transition-colors hover:text-gray-600"
          aria-label="Close"
        >
          <X size={20} />
        </Link>

        {/* Branding & Header */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 font-serif text-xl font-bold text-[#6B4226]"
          >
            <span className="text-[#B4532D]">🌸</span> Kaarigar Expo
          </Link>

          <h1 className="mt-4 font-serif text-3xl font-bold text-[#2B2118]">
            Welcome Back
          </h1>

          <p className="mt-1.5 text-xs text-gray-500">
            Login to your Kaarigar Expo account
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
            <AlertCircle size={16} className="shrink-0 text-red-600" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-200 bg-[#FDFBF7] p-3 text-sm text-[#2B2118] transition-colors focus:border-[#8B3A1B] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-200 bg-[#FDFBF7] p-3 text-sm text-[#2B2118] transition-colors focus:border-[#8B3A1B] focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#8B3A1B] py-3 text-sm font-semibold text-white transition hover:bg-[#722F15] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Register Prompt */}
        <p className="mt-6 text-center text-xs text-gray-500">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            className="font-semibold text-[#8B3A1B] hover:underline"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}