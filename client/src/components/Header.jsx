import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Optimized Color palette:
// Primary Navy:    #1B2A4A
// Secondary Blue:  #1A6BFF
// Accent Gold:     #F5A623
// Background:      #F8F9FB

export default function Header() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const token = localStorage.getItem("token");
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }
  const initials = user?.name
    ? user.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase() || "")
        .join("")
    : "";

  useEffect(() => {
    const onClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setOpen(false);
    navigate("/signin");
  };

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

        {token ? (
          <div className="relative ml-auto flex items-center" ref={menuRef}>
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1a274433] bg-white text-sm font-bold text-[#1a2744]"
              aria-label="Profile"
              title={user?.name || "Profile"}
            >
              {initials || (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </button>

            {open ? (
              <div className="absolute right-0 top-12 z-50 w-40 rounded-lg border border-[#d9e2f3] bg-white p-1 shadow-lg">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  Log Out
                </button>
              </div>
            ) : null}
          </div>
        ) : (
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
        )}

      </nav>
    </header>
  );
}
