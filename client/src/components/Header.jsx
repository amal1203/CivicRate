import { Link } from "react-router-dom";

// Optimized Color palette:
// Primary Navy:    #1B2A4A
// Secondary Blue:  #1A6BFF
// Accent Gold:     #F5A623
// Background:      #F8F9FB

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 border-b shadow-sm"
      style={{ backgroundColor: "#F8F9FB", borderColor: "#1B2A4A15" }}
    >
      <nav className="flex min-h-16 items-center justify-between px-3 sm:px-4">

        {/* Logo + Brand Name */}
        <Link
          to="/"
          className="flex items-center gap-2 transition-transform duration-200 hover:scale-105"
        >
          <img
            src="/civic1.png"
            alt="CivicRate Logo"
            className="h-10 w-auto object-contain sm:h-12"
          />
          <span className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            <span style={{ color: "#1B2A4A" }}>Civic</span>
            <span style={{ color: "#1A6BFF" }}>Rate</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="ml-auto flex items-center gap-3 pr-1 text-sm font-semibold sm:gap-4 sm:pr-4">
          <Link
            to="/"
            className="rounded-full border px-4 py-2 transition-all duration-200 hover:-translate-y-0.5"
            style={{
              color: "#1B2A4A",
              borderColor: "#1B2A4A33",
              backgroundColor: "#FFFFFF",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#1A6BFF";
              e.currentTarget.style.borderColor = "#1A6BFF66";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#1B2A4A";
              e.currentTarget.style.borderColor = "#1B2A4A33";
            }}
          >
            Home
          </Link>

          <Link
            to="/signin"
            className="rounded-full border px-4 py-2 transition-all duration-200 hover:-translate-y-0.5"
            style={{
              color: "#1B2A4A",
              borderColor: "#1B2A4A66",
              backgroundColor: "#F8F9FB",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#FFFFFF";
              e.currentTarget.style.backgroundColor = "#1B2A4A";
              e.currentTarget.style.borderColor = "#1B2A4A";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#1B2A4A";
              e.currentTarget.style.backgroundColor = "#F8F9FB";
              e.currentTarget.style.borderColor = "#1B2A4A66";
            }}
          >
            Sign In
          </Link>

        </div>

      </nav>
    </header>
  );
}
