import { getCurrentUser } from "../utils/auth";

export default function Home1() {
  const user = getCurrentUser();

  return (
    <main
      className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4"
      style={{ backgroundColor: "#F8F9FB" }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "720px",
          background: "#FFFFFF",
          borderRadius: "20px",
          border: "1px solid #E3EAF7",
          boxShadow: "0 8px 30px rgba(27,42,74,0.08)",
          padding: "2rem",
        }}
      >
        <p style={{ margin: 0, color: "#1A6BFF", fontWeight: 700, letterSpacing: "0.04em" }}>
          LOGGED IN
        </p>
        <h1 style={{ margin: "0.35rem 0 0", color: "#1B2A4A", fontSize: "2rem", fontWeight: 800 }}>
          Welcome to your dashboard
        </h1>
        <p style={{ marginTop: "0.75rem", color: "#41577A" }}>
          You are signed in as <strong>{user?.username || "User"}</strong>.
        </p>

        <div style={{ marginTop: "1.5rem", display: "grid", gap: "0.9rem" }}>
          <div
            style={{
              border: "1px solid #E3EAF7",
              borderRadius: "12px",
              padding: "0.9rem 1rem",
              color: "#1B2A4A",
              background: "#F8FBFF",
            }}
          >
            Username: <strong>{user?.username || "-"}</strong>
          </div>
          <div
            style={{
              border: "1px solid #E3EAF7",
              borderRadius: "12px",
              padding: "0.9rem 1rem",
              color: "#1B2A4A",
              background: "#F8FBFF",
            }}
          >
            Phone: <strong>{user?.phonenumber || "-"}</strong>
          </div>
        </div>
      </section>
    </main>
  );
}
