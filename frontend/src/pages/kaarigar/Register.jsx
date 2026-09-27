import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    craftType: "",
    description: "",
    photos: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // API call logic goes here
      // e.g., await registerKaarigar(formData);

      // Navigate to login or dashboard on success
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans text-[#2B2118]">
      {/* Navigation Header */}
      <header className="flex items-center justify-between border-b border-[#E8E1D5] bg-white px-8 py-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#B4532D] text-white">
            <span className="text-lg font-bold">🍁</span>
          </div>
          <span className="text-xl font-serif font-bold text-[#2B2118]">
            Kaarigar Expo
          </span>
        </div>

        <nav className="flex items-center gap-8">
          <Link
            to="/"
            className="text-sm font-medium text-gray-700 hover:text-[#B4532D]"
          >
            Home
          </Link>
          <Link
            to="/events"
            className="text-sm font-medium text-gray-700 hover:text-[#B4532D]"
          >
            Events
          </Link>
          <Link
            to="/about"
            className="text-sm font-medium text-gray-700 hover:text-[#B4532D]"
          >
            About
          </Link>

          <div className="ml-4 flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-lg border border-[#B4532D] px-5 py-2 text-sm font-medium text-[#B4532D] hover:bg-[#FAF7F2]"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-[#B4532D] px-5 py-2 text-sm font-medium text-white hover:bg-[#963F22]"
            >
              Register
            </Link>
          </div>
        </nav>
      </header>

      {/* Registration Card */}
      <main className="mx-auto my-10 max-w-5xl rounded-2xl border border-[#E2D8CB] bg-white p-8 shadow-sm">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          {/* Left Column: Hero Graphic */}
          <div className="relative flex min-h-[440px] flex-col justify-end overflow-hidden rounded-xl md:col-span-4">
            <img
              src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=1000&auto=format&fit=crop"
              alt="Artisan at work"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="relative z-10 p-6">
              <h2 className="font-serif text-3xl font-bold leading-tight text-white">
                Showcase <br /> Your Craft to <br /> the World
              </h2>
            </div>
          </div>

          {/* Right Column: Registration Form */}
          <div className="flex flex-col justify-center px-2 md:col-span-8">
            <h1 className="mb-6 text-2xl font-bold text-[#2B2118]">
              Register as a Kaarigar
            </h1>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Inputs Column 1 */}
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#B4532D] focus:outline-none focus:ring-1 focus:ring-[#B4532D]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#B4532D] focus:outline-none focus:ring-1 focus:ring-[#B4532D]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#B4532D] focus:outline-none focus:ring-1 focus:ring-[#B4532D]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Craft Type
                    </label>
                    <select
                      name="craftType"
                      value={formData.craftType}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-[#B4532D] focus:outline-none focus:ring-1 focus:ring-[#B4532D]"
                    >
                      <option value="" disabled>
                        Select craft type
                      </option>
                      <option value="POTTERY">Pottery & Ceramics</option>
                      <option value="TEXTILE">Textiles & Weaving</option>
                      <option value="WOODWORK">Woodwork & Carving</option>
                      <option value="METALCRAFT">Metal Crafting</option>
                      <option value="JEWELRY">Handcrafted Jewelry</option>
                    </select>
                  </div>
                </div>

                {/* Inputs Column 2 */}
                <div className="flex flex-col justify-between space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Tell us about your craft and experience..."
                      className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-[#B4532D] focus:outline-none focus:ring-1 focus:ring-[#B4532D]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Upload Photos
                    </label>
                    <input
                      type="file"
                      name="photos"
                      multiple
                      onChange={handleChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border file:border-gray-300 file:bg-gray-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-100"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-[#B4532D] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#963F22] disabled:opacity-60"
                  >
                    {loading ? "Registering..." : "Register"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}