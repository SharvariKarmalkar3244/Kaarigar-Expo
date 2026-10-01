import { useState } from "react";
import { loginUser, registerUser } from "../../api/authApi";
import { createProfile } from "../../api/kaarigarApi";
import { uploadImage } from "../../api/mediaApi";
import { useNavigate, Link } from "react-router-dom";
import { X, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { showToast } from "../../utils/toast";
import { getGoogleOAuthUrl } from "../../api/authApi";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "VISITOR",
    craftType: "",
    description: "",
    photos: null,
    profilePhoto: null,
    phone: "",
    location: "",
  });

  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: files ? files : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setError("");
  };

  const validateForm = () => {
    const newErrors = {};

    const nameRegex = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;
    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (form.name.trim().length > 50) {
      newErrors.name = "Name must not exceed 50 characters";
    } else if (!nameRegex.test(form.name.trim())) {
      newErrors.name =
        "Name can contain only letters, spaces, apostrophes and hyphens";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(form.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(form.password)) {
      newErrors.password = "Password must contain at least one uppercase letter";
    } else if (!/[a-z]/.test(form.password)) {
      newErrors.password = "Password must contain at least one lowercase letter";
    } else if (!/[0-9]/.test(form.password)) {
      newErrors.password = "Password must contain at least one number";
    } else if (!/[@$!%*?&]/.test(form.password)) {
      newErrors.password =
        "Password must contain at least one special character";
    }

    if (!form.role) {
      newErrors.role = "Please select a role";
    }

    if (form.role === "KAARIGAR" && !form.craftType) {
      newErrors.craftType = "Please select a craft type";
    }

    if (form.role === "KAARIGAR" && !/^[0-9]{10}$/.test(form.phone)) {
      newErrors.phone = "Enter a 10-digit phone number";
    }

    if (form.role === "KAARIGAR" && !form.location.trim()) {
      newErrors.location = "Location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const registrationData = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
      };

      const data = await registerUser(registrationData);
      const session = await loginUser({ email: registrationData.email, password: form.password });
      login(session);
      showToast("Account created. Check your inbox for the email verification link.", "success");

      if (data.role === "KAARIGAR") {
        try {
          const [photoUrl, ...workImageUrls] = await Promise.all([
            form.profilePhoto ? uploadImage(form.profilePhoto, "profile") : Promise.resolve(null),
            ...Array.from(form.photos || []).slice(0, 10).map((file) => uploadImage(file, "work")),
          ]);
          await createProfile({
            name: form.name.trim(),
            email: form.email.trim().toLowerCase(),
            craft: form.craftType,
            description: form.description,
            photoUrl,
            phone: form.phone,
            location: form.location.trim(),
            workImageUrls,
          });
          navigate("/kaarigar");
        } catch (profileErr) {
          console.error("Failed to create Kaarigar profile:", profileErr);
          navigate("/kaarigar/profile");
        }
      } else if (data.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/visitor/profile");
      }
    } catch (err) {
      console.error("Registration error:", err);
      const responseData = err.response?.data;

      if (responseData?.errors) {
        setErrors(responseData.errors);
      } else {
        setError(
          responseData?.message || "Registration failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const isKaarigar = form.role === "KAARIGAR";

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#FDFBF7] px-4 py-10 text-[#2B2118]">
      {/* Background Subtle Accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#EFE8DC]/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#EFE8DC]/40 blur-3xl" />
      </div>

      <div
        className={`relative w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 sm:p-8 ${
          isKaarigar ? "max-w-4xl" : "max-w-md"
        }`}
      >
        {/* Close Button */}
        <Link
          to="/"
          className="absolute top-5 right-5 text-gray-400 transition-colors hover:text-gray-600"
          aria-label="Close"
        >
          <X size={20} />
        </Link>

        {/* Top Error Alert */}
        {error && (
          <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
            <AlertCircle size={16} className="shrink-0 text-red-600" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {isKaarigar ? (
          /* KAARIGAR (ARTISAN) LAYOUT */
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            {/* Left Graphic Banner */}
            <div className="relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-xl md:col-span-4 md:min-h-full">
              <img
                src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=1000&auto=format&fit=crop"
                alt="Artisan at work"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="relative z-10 p-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-200">
                  Craft Community
                </span>
                <h2 className="mt-1 font-serif text-2xl font-bold leading-tight text-white md:text-3xl">
                  Showcase Your Craft to the World
                </h2>
              </div>
            </div>

            {/* Form Fields Side */}
            <div className="flex flex-col justify-center md:col-span-8">
              <div className="mb-2">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 font-serif text-lg font-bold text-[#6B4226]"
                >
                  <span className="text-[#B4532D]">🌸</span> Kaarigar Expo
                </Link>
              </div>

              <h1 className="font-serif text-2xl font-bold text-[#2B2118] sm:text-3xl">
                Register as a Kaarigar
              </h1>
              <p className="mt-1 text-xs text-gray-500">
                Join our artisan community and showcase your handmade craft.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-3.5">
                    {/* Account Type */}
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">
                        Account Type
                      </label>
                      <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 bg-[#FDFBF7] p-2.5 text-xs text-[#2B2118] transition-colors focus:border-[#8B3A1B] focus:bg-white focus:outline-none"
                      >
                        <option value="VISITOR">Visitor</option>
                        <option value="KAARIGAR">Kaarigar (Artisan)</option>
                      </select>
                    </div>

                    {/* Name */}
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Full name"
                        value={form.name}
                        onChange={handleChange}
                        className={`w-full rounded-xl border bg-[#FDFBF7] p-2.5 text-xs text-[#2B2118] transition-colors focus:border-[#8B3A1B] focus:bg-white focus:outline-none ${
                          errors.name ? "border-red-500" : "border-gray-200"
                        }`}
                      />
                      {errors.name && (
                        <p className="mt-1 text-[11px] text-red-600">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="name@example.com"
                        value={form.email}
                        onChange={handleChange}
                        className={`w-full rounded-xl border bg-[#FDFBF7] p-2.5 text-xs text-[#2B2118] transition-colors focus:border-[#8B3A1B] focus:bg-white focus:outline-none ${
                          errors.email ? "border-red-500" : "border-gray-200"
                        }`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-[11px] text-red-600">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">
                        Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={handleChange}
                        className={`w-full rounded-xl border bg-[#FDFBF7] p-2.5 text-xs text-[#2B2118] transition-colors focus:border-[#8B3A1B] focus:bg-white focus:outline-none ${
                          errors.password ? "border-red-500" : "border-gray-200"
                        }`}
                      />
                      {errors.password && (
                        <p className="mt-1 text-[11px] text-red-600">
                          {errors.password}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between space-y-3.5">
                    {/* Craft Type */}
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">
                        Craft Type
                      </label>
                      <select
                        name="craftType"
                        value={form.craftType}
                        onChange={handleChange}
                        className={`w-full rounded-xl border bg-[#FDFBF7] p-2.5 text-xs text-[#2B2118] transition-colors focus:border-[#8B3A1B] focus:bg-white focus:outline-none ${
                          errors.craftType
                            ? "border-red-500"
                            : "border-gray-200"
                        }`}
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
                      {errors.craftType && (
                        <p className="mt-1 text-[11px] text-red-600">
                          {errors.craftType}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Tell us about your craft..."
                        required
                        className="w-full rounded-xl border border-gray-200 bg-[#FDFBF7] p-2.5 text-xs text-[#2B2118] transition-colors focus:border-[#8B3A1B] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">Phone</label>
                      <input type="tel" name="phone" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} inputMode="numeric" maxLength={10} placeholder="10-digit phone number" className={`w-full rounded-xl border bg-[#FDFBF7] p-2.5 text-xs ${errors.phone ? "border-red-500" : "border-gray-200"}`} required />
                      {errors.phone && <p className="mt-1 text-[11px] text-red-600">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">Location</label>
                      <input type="text" name="location" value={form.location} onChange={handleChange} placeholder="City or village" className={`w-full rounded-xl border bg-[#FDFBF7] p-2.5 text-xs ${errors.location ? "border-red-500" : "border-gray-200"}`} required />
                      {errors.location && <p className="mt-1 text-[11px] text-red-600">{errors.location}</p>}
                    </div>

                    {/* Profile Photo */}
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">Profile Photo</label>
                      <input type="file" name="profilePhoto" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleChange} className="block w-full text-[11px] text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-[#EFE8DC] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#6B4226] hover:file:bg-[#e2d8cb]" />
                    </div>

                    {/* Product/work photos */}
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">Photos of your work</label>
                      <input
                        type="file"
                        name="photos"
                        multiple
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleChange}
                        className="block w-full text-[11px] text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-[#EFE8DC] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#6B4226] hover:file:bg-[#e2d8cb]"
                      />
                      <p className="mt-1 text-[10px] text-gray-500">Up to 10 images. JPG, PNG, WebP, or GIF; up to 4 MB each.</p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8B3A1B] py-2.5 text-xs font-semibold text-white transition hover:bg-[#722F15] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Registering...
                        </>
                      ) : (
                        "Register as Kaarigar"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* STANDARD VISITOR LAYOUT */
          <div>
            <div className="text-center">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 font-serif text-xl font-bold text-[#6B4226]"
              >
                <span className="text-[#B4532D]">🌸</span> Kaarigar Expo
              </Link>

              <h1 className="mt-4 font-serif text-3xl font-bold text-[#2B2118]">
                Create Account
              </h1>
              <p className="mt-1 text-xs text-gray-500">
                Join Kaarigar Expo to explore upcoming events and artisans
              </p>
            </div>

            <a href={getGoogleOAuthUrl(form.role)} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              <span className="font-bold text-[#4285F4]">G</span> Continue with Google
            </a>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Account Type */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Account Type
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className={`w-full rounded-xl border bg-[#FDFBF7] p-3 text-xs text-[#2B2118] transition-colors focus:border-[#8B3A1B] focus:bg-white focus:outline-none ${
                    errors.role ? "border-red-500" : "border-gray-200"
                  }`}
                >
                  <option value="VISITOR">Visitor</option>
                  <option value="KAARIGAR">Kaarigar (Artisan)</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-xs text-red-600">{errors.role}</p>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Full name"
                  value={form.name}
                  onChange={handleChange}
                  className={`w-full rounded-xl border bg-[#FDFBF7] p-3 text-xs text-[#2B2118] transition-colors focus:border-[#8B3A1B] focus:bg-white focus:outline-none ${
                    errors.name ? "border-red-500" : "border-gray-200"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full rounded-xl border bg-[#FDFBF7] p-3 text-xs text-[#2B2118] transition-colors focus:border-[#8B3A1B] focus:bg-white focus:outline-none ${
                    errors.email ? "border-red-500" : "border-gray-200"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className={`w-full rounded-xl border bg-[#FDFBF7] p-3 text-xs text-[#2B2118] transition-colors focus:border-[#8B3A1B] focus:bg-white focus:outline-none ${
                    errors.password ? "border-red-500" : "border-gray-200"
                  }`}
                />
                {errors.password ? (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                ) : (
                  <p className="mt-1 text-[11px] text-gray-400">
                    8+ characters with uppercase, lowercase, number & special char.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8B3A1B] py-3 text-xs font-semibold text-white transition hover:bg-[#722F15] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Register"
                )}
              </button>
            </form>
          </div>
        )}

        {/* Login Prompt Footer */}
        <p className="mt-6 text-center text-xs text-gray-500">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="font-semibold text-[#8B3A1B] hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
