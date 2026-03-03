import { useState } from "react";
import { useNavigate } from "react-router-dom";

const EyeIcon = ({ open }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>) : (<><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>)}
  </svg>
);

const GlobeIcon = ({ size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
  </svg>
);

const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7a99" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7a99" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);

export default function SignIn() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [focused, setFocused] = useState("");
  const [loading, setLoading] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(false);

  const isValid = form.phone.trim().length >= 7 && form.password.length >= 1;

  const handleSignIn = async () => {
    if (!isValid) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phonenumber: form.phone,
          password: form.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Signin failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: data.user?.username || "User",
          phone: data.user?.phonenumber || form.phone,
          email: data.user?.email || "",
        })
      );

      setSignedIn(true);
      setTimeout(() => navigate("/rate"), 1000);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fw = (name) => ({
    display: "flex", alignItems: "center",
    border: `1.5px solid ${focused === name ? "#2563eb" : error ? "#fca5a5" : "#d4dff0"}`,
    borderRadius: "10px",
    background: focused === name ? "#f0f6ff" : "#f8fafd",
    transition: "all 0.18s", overflow: "hidden"
  });

  const inp = {
    flex: 1, border: "none", outline: "none", background: "transparent",
    padding: "0.78rem 0.5rem 0.78rem 0", fontSize: "0.95rem",
    color: "#111827", fontFamily: "inherit"
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4fa", fontFamily: "'Segoe UI',system-ui,sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes pop { 0%{transform:scale(0.7);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        .cr-btn:hover:not(:disabled) { filter:brightness(1.08); transform:translateY(-1px); }
        .cr-btn { transition: all .18s; }
        .eye:hover { color:#2563eb !important; }
        .fp:hover { color:#1a2744 !important; }
        .signup-link:hover { text-decoration: underline !important; }
      `}</style>

      {/* MAIN */}
      <main style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"3rem 1rem" }}>
        <div style={{ background:"#fff", borderRadius:"20px", boxShadow:"0 4px 40px rgba(37,99,235,0.10),0 1px 6px rgba(0,0,0,0.06)", width:"100%", maxWidth:"420px", overflow:"hidden", animation:"fadeUp 0.45s cubic-bezier(.22,.68,0,1.2) both" }}>

          {/* TOP BANNER */}
          <div style={{ background:"linear-gradient(135deg,#1a2744 0%,#2563eb 100%)", padding:"2rem 2.5rem 2.5rem", textAlign:"center", position:"relative" }}>
            <div style={{ width:"72px", height:"72px", borderRadius:"50%", background:"rgba(255,255,255,0.12)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1rem", backdropFilter:"blur(4px)", border:"1.5px solid rgba(255,255,255,0.2)" }}>
              <ShieldIcon />
            </div>
            <h1 style={{ fontSize:"1.6rem", fontWeight:700, color:"#fff", letterSpacing:"-0.03em", margin:"0 0 0.3rem" }}>Welcome back</h1>
            <p style={{ color:"rgba(255,255,255,0.7)", fontSize:"0.9rem", margin:0 }}>Sign in to your CivicRate account</p>
          </div>

          {/* FORM */}
          <div style={{ padding:"2rem 2.5rem 2.25rem" }}>
            {!signedIn ? (
              <>
                {error && (
                  <div style={{ background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:"8px", padding:"0.6rem 0.9rem", marginBottom:"1.1rem", fontSize:"0.85rem", color:"#dc2626", display:"flex", alignItems:"center", gap:"0.5rem" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {error}
                  </div>
                )}

                <div style={{ display:"flex", flexDirection:"column", gap:"1.1rem", marginBottom:"1rem" }}>
                  {/* Phone */}
                  <div>
                    <label style={{ display:"block", fontSize:"0.82rem", fontWeight:600, color:"#1a2744", marginBottom:"0.4rem" }}>Phone Number</label>
                    <div style={fw("phone")}>
                      <span style={{ padding:"0 0.75rem", display:"flex", alignItems:"center", flexShrink:0 }}><PhoneIcon /></span>
                      <input
                        style={inp} type="tel" placeholder="+1 (555) 000-0000"
                        value={form.phone}
                        onChange={e => { setError(""); setForm({ ...form, phone: e.target.value }); }}
                        onFocus={() => setFocused("phone")} onBlur={() => setFocused("")}
                        onKeyDown={e => e.key === "Enter" && handleSignIn()}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.4rem" }}>
                      <label style={{ fontSize:"0.82rem", fontWeight:600, color:"#1a2744" }}>Password</label>
                      <span className="fp" style={{ fontSize:"0.8rem", color:"#2563eb", cursor:"pointer", fontWeight:500, transition:"color .15s" }}>Forgot password?</span>
                    </div>
                    <div style={fw("password")}>
                      <span style={{ padding:"0 0.75rem", display:"flex", alignItems:"center", flexShrink:0 }}><LockIcon /></span>
                      <input
                        style={inp} type={showPw ? "text" : "password"} placeholder="Enter your password"
                        value={form.password}
                        onChange={e => { setError(""); setForm({ ...form, password: e.target.value }); }}
                        onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
                        onKeyDown={e => e.key === "Enter" && handleSignIn()}
                      />
                      <button type="button" className="eye" style={{ background:"none", border:"none", cursor:"pointer", color:"#6b7a99", padding:"0 0.75rem", display:"flex", alignItems:"center", transition:"color .15s" }} onClick={() => setShowPw(!showPw)}>
                        <EyeIcon open={showPw} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remember me */}
                <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", marginBottom:"1.5rem", cursor:"pointer" }} onClick={() => setRemember(!remember)}>
                  <div style={{ width:"18px", height:"18px", borderRadius:"5px", border:`2px solid ${remember ? "#2563eb" : "#c4d0e8"}`, background: remember ? "#2563eb" : "white", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .15s" }}>
                    {remember && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <span style={{ fontSize:"0.85rem", color:"#6b7a99" }}>Remember me on this device</span>
                </div>

                {/* Submit */}
                <button className="cr-btn" disabled={!isValid || loading}
                  style={{ width:"100%", padding:"0.875rem", background:"linear-gradient(135deg,#1a2744 0%,#2563eb 100%)", color:"#fff", border:"none", borderRadius:"10px", fontSize:"1rem", fontWeight:600, fontFamily:"inherit", cursor: isValid && !loading ? "pointer" : "not-allowed", opacity: isValid ? 1 : 0.55, display:"flex", alignItems:"center", justifyContent:"center", gap:"0.6rem" }}
                  onClick={handleSignIn}>
                  {loading ? (
                    <>
                      <div style={{ width:"18px", height:"18px", border:"2.5px solid rgba(255,255,255,0.3)", borderTop:"2.5px solid white", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
                      Signing in…
                    </>
                  ) : "Sign In"}
                </button>

                <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", margin:"1.25rem 0", color:"#c4d0e8", fontSize:"0.82rem" }}>
                  <div style={{ flex:1, height:"1px", background:"#e8edf6" }}/><span>or</span><div style={{ flex:1, height:"1px", background:"#e8edf6" }}/>
                </div>

                <p style={{ textAlign:"center", fontSize:"0.875rem", color:"#6b7a99", margin:0 }}>
                  Don't have an account?{" "}
                  <span className="signup-link" style={{ color:"#2563eb", fontWeight:600, cursor:"pointer", textDecoration:"none" }}>Create one</span>
                </p>
              </>
            ) : (
              /* SUCCESS */
              <div style={{ textAlign:"center", padding:"0.5rem 0 0.25rem", animation:"pop 0.4s cubic-bezier(.22,.68,0,1.2) both" }}>
                <div style={{ width:"72px", height:"72px", borderRadius:"50%", background:"linear-gradient(135deg,#1a2744,#2563eb)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1.25rem" }}>
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h2 style={{ fontSize:"1.4rem", fontWeight:700, color:"#1a2744", marginBottom:"0.5rem" }}>Signed in!</h2>
                <p style={{ color:"#6b7a99", fontSize:"0.92rem", lineHeight:"1.6", margin:"0 0 1.5rem" }}>
                  You're now signed in to <strong>CivicRate</strong>.<br/>Redirecting to your dashboard…
                </p>
                <button className="cr-btn"
                  style={{ width:"100%", padding:"0.85rem", background:"linear-gradient(135deg,#1a2744,#2563eb)", color:"#fff", border:"none", borderRadius:"10px", fontSize:"1rem", fontWeight:600, fontFamily:"inherit", cursor:"pointer" }}
                  onClick={() => { setSignedIn(false); setForm({ phone:"", password:"" }); setRemember(false); }}>
                  Back to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
