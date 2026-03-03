import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Otp() {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone || "your phone number";
  const username = location.state?.username || "User";
  const password = location.state?.password || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => {
      navigate("/signin");
    }, 1200);
    return () => clearTimeout(timer);
  }, [success, navigate]);

  const handleVerify = async () => {
    setError("");
    setSuccess("");

    if (!phone || !username || !password) {
      setError("Signup details missing. Please start again from the signup page.");
      return;
    }

    if (otp !== "0000") {
      setError("Invalid OTP. For now, use 0000.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          phonenumber: phone,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Signup failed");
      }

      setSuccess("OTP verified. Signup completed successfully.");
    } catch (err) {
      setError(err.message || "Something went wrong while creating account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0f4fa",
        fontFamily: "'Segoe UI',system-ui,sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#fff",
          borderRadius: "18px",
          boxShadow: "0 4px 30px rgba(0,0,0,0.08)",
          padding: "2rem",
        }}
      >
        <h1 style={{ margin: "0 0 0.6rem", color: "#1a2744" }}>Verify OTP</h1>
        <p style={{ margin: "0 0 1.2rem", color: "#6b7a99", fontSize: "0.92rem" }}>
          Hi <strong>{username}</strong>, enter the OTP sent to <strong>{phone}</strong>.
        </p>

        <input
          type="text"
          value={otp}
          maxLength={4}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          placeholder="Enter 4-digit OTP"
          style={{
            width: "100%",
            boxSizing: "border-box",
            border: "1.5px solid #d4dff0",
            borderRadius: "10px",
            padding: "0.8rem 0.9rem",
            fontSize: "1rem",
            marginBottom: "0.9rem",
            outline: "none",
          }}
        />

        <button
          onClick={handleVerify}
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.85rem",
            background: "linear-gradient(135deg,#1a2744,#2563eb)",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        {error ? (
          <p style={{ margin: "0.8rem 0 0", color: "#dc2626", fontSize: "0.86rem" }}>{error}</p>
        ) : null}
        {success ? (
          <p style={{ margin: "0.8rem 0 0", color: "#16a34a", fontSize: "0.86rem" }}>
            {success} Redirecting to sign in...
          </p>
        ) : null}
      </div>
    </div>
  );
}
