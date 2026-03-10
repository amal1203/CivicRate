import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Admin login failed");
      }

      localStorage.setItem("adminToken", data.token || "");
      localStorage.setItem("admin", JSON.stringify(data.admin || {}));
      navigate("/admin/dashboard", { replace: true });
    } catch (loginError) {
      setError(loginError.message || "Admin login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#f0f4fa] px-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-extrabold text-[#1a2744]">Office Admin Login</h1>
        <p className="mt-1 text-sm text-[#6b7a99]">
          Sign in to generate and manage daily visit codes.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-[#1a2744]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#d4dff0] px-3 py-2 text-sm outline-none focus:border-[#2563eb]"
              placeholder="admin@office.gov"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[#1a2744]">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[#d4dff0] px-3 py-2 text-sm outline-none focus:border-[#2563eb]"
              placeholder="Enter password"
            />
          </div>

          {error ? <p className="text-sm font-semibold text-[#dc2626]">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting || !email.trim() || !password}
            className="w-full rounded-xl bg-gradient-to-r from-[#1a2744] to-[#2563eb] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>

          <Link
            to="/"
            className="inline-block text-sm font-semibold text-[#2563eb] underline-offset-2 hover:underline"
          >
            Back to Home
          </Link>
        </form>
      </section>
    </main>
  );
}
