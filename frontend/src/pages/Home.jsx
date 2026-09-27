import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, HeartHandshake, Landmark } from "lucide-react";

export default function Home() {
  const [imgError, setImgError] = useState(false);

  // Fallback image URL if /bg.png fails to load
  const primaryFallback =
    "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=1600&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2B2118]">
      {/* Header / Navbar */}
      <header className="w-full bg-[#FDFBF7] px-8 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-serif text-2xl font-bold text-[#6B4226]"
          >
            <span className="text-[#B4532D]">🌸</span> Kaarigar Expo
          </Link>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-8 text-sm font-medium text-gray-700 md:flex">
            <Link to="/" className="font-semibold text-[#6B4226]">
              Home
            </Link>
            <Link to="/events" className="hover:text-[#B4532D]">
              Events
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:border-gray-400"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-[#8B3A1B] px-6 py-2 text-sm font-medium text-white transition hover:bg-[#722F15]"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="relative mx-auto my-4 max-w-7xl overflow-hidden rounded-3xl bg-[#EFE8DC] shadow-sm">
        {/* Background Image Banner */}
        <div className="relative flex min-h-[480px] w-full items-center justify-center px-6 py-16 text-center md:py-24">
          <img
            src={imgError ? primaryFallback : "src/public/bg.png"}
            onError={() => setImgError(true)}
            alt="Artisans at work crafting pottery"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-85"
          />
          {/* Light Overlay to preserve readability for text */}
          <div className="absolute inset-0 bg-[#FDFBF7]/30 backdrop-blur-[2px]" />

          {/* Hero Content */}
          <div className="relative z-10 mx-auto max-w-2xl">
            <h1 className="font-serif text-4xl font-bold leading-tight text-[#2B2118] sm:text-5xl md:text-6xl">
              Discover <br />
              India's Finest Crafts
            </h1>

            <p className="mt-4 text-base font-medium text-[#2B2118] sm:text-lg">
              Meet talented artisans, explore unique handmade products and be a
              part of our upcoming melas.
            </p>

            <div className="mt-8">
              <Link
                to="/events"
                className="inline-block rounded-full bg-[#8B3A1B] px-8 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-[#722F15]"
              >
                Explore Upcoming Melas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 md:gap-12">
          <FeatureItem
            icon={<Sparkles className="h-7 w-7 text-[#8B3A1B]" />}
            label="Authentic Crafts"
          />
          <FeatureItem
            icon={<HeartHandshake className="h-7 w-7 text-[#8B3A1B]" />}
            label="Support Artisans"
          />
          <FeatureItem
            icon={<Landmark className="h-7 w-7 text-[#8B3A1B]" />}
            label="Cultural Heritage"
          />
        </div>
      </section>
    </div>
  );
}

function FeatureItem({ icon, label }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EFE8DC]/60">
        {icon}
      </div>
      <span className="font-serif text-lg font-semibold text-[#2B2118]">
        {label}
      </span>
    </div>
  );
}