import { useState } from "react";
import { useNavigate } from "react-router-dom";

const EyeIcon = ({ open }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>) : (<><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>)}
  </svg>
);
const GlobeIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
  </svg>
);
const UserIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7a99" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const PhoneIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7a99" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>;
const LockIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7a99" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", phone: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState("");

  const getStrength = () => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const str = getStrength();
  const strLabel = ["","Weak","Fair","Good","Strong"][str];
  const strColor = ["","#ef4444","#f59e0b","#3b82f6","#22c55e"][str];

  const fw = (name) => ({ display:"flex", alignItems:"center", border:`1.5px solid ${focused===name?"#2563eb":"#d4dff0"}`, borderRadius:"10px", background:focused===name?"#f0f6ff":"#f8fafd", transition:"all 0.18s", overflow:"hidden" });
  const inp = { flex:1, border:"none", outline:"none", background:"transparent", padding:"0.75rem 0.5rem 0.75rem 0", fontSize:"0.95rem", color:"#111827", fontFamily:"inherit" };
  const lbl = { display:"block", fontSize:"0.82rem", fontWeight:600, color:"#1a2744", marginBottom:"0.4rem" };
  const ic = { padding:"0 0.75rem", display:"flex", alignItems:"center", flexShrink:0 };
  const canSubmit = Boolean(form.username && form.phone && form.password && agreed && !checking);

  const handleSignup = async () => {
    if (!canSubmit) return;

    setError("");
    setChecking(true);
    try {
      const res = await fetch("/api/auth/check-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          phonenumber: form.phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Could not validate signup details");
      }

      if (data.usernameExists && data.phoneExists) {
        setError("Username and phone number already exist.");
        return;
      }
      if (data.usernameExists) {
        setError("Username already exists.");
        return;
      }
      if (data.phoneExists) {
        setError("Phone number already exists.");
        return;
      }

      navigate("/verify-otp", {
        state: {
          phone: form.phone,
          username: form.username,
          password: form.password,
        },
      });
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f0f4fa", fontFamily:"'Segoe UI',system-ui,sans-serif", display:"flex", flexDirection:"column" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}} .cr-btn:hover{filter:brightness(1.07);transform:translateY(-1px)} .cr-btn{transition:all .18s} .eye:hover{color:#2563eb!important}`}</style>

      <main style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"3rem 1rem" }}>
        <div style={{ background:"#fff", borderRadius:"20px", boxShadow:"0 4px 40px rgba(37,99,235,0.10),0 1px 6px rgba(0,0,0,0.06)", width:"100%", maxWidth:"440px", padding:"2.5rem 2.5rem 2rem", animation:"fadeUp 0.45s cubic-bezier(.22,.68,0,1.2) both" }}>
          <>
              <div style={{ textAlign:"center", marginBottom:"2rem" }}>
                <div style={{ marginBottom:"0.75rem" }}><GlobeIcon /></div>
                <h1 style={{ fontSize:"1.75rem", fontWeight:700, color:"#1a2744", letterSpacing:"-0.03em", margin:"0 0 0.35rem" }}>Join <span style={{ color:"#2563eb" }}>CivicRate</span></h1>
                <p style={{ color:"#6b7a99", fontSize:"0.92rem", margin:0 }}>Create your account to rate public services</p>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:"1.1rem", marginBottom:"1.25rem" }}>
                <div>
                  <label style={lbl}>Username</label>
                  <div style={fw("username")}>
                    <span style={ic}><UserIcon /></span>
                    <input style={inp} type="text" name="username" placeholder="e.g. john_citizen" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} onFocus={()=>setFocused("username")} onBlur={()=>setFocused("")} />
                  </div>
                </div>
                <div>
                  <label style={lbl}>Phone Number</label>
                  <div style={fw("phone")}>
                    <span style={ic}><PhoneIcon /></span>
                    <input style={inp} type="tel" name="phone" placeholder="+1 (555) 000-0000" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} onFocus={()=>setFocused("phone")} onBlur={()=>setFocused("")} />
                  </div>
                </div>
                <div>
                  <label style={lbl}>Password</label>
                  <div style={fw("password")}>
                    <span style={ic}><LockIcon /></span>
                    <input style={inp} type={showPw?"text":"password"} name="password" placeholder="Create a strong password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} onFocus={()=>setFocused("password")} onBlur={()=>setFocused("")} />
                    <button type="button" className="eye" style={{ background:"none", border:"none", cursor:"pointer", color:"#6b7a99", padding:"0 0.75rem", display:"flex", alignItems:"center", transition:"color .15s" }} onClick={()=>setShowPw(!showPw)}><EyeIcon open={showPw}/></button>
                  </div>
                  {form.password && (
                    <div style={{ marginTop:"0.5rem", display:"flex", gap:"4px", alignItems:"center" }}>
                      {[1,2,3,4].map(i=><div key={i} style={{ height:"4px", flex:1, borderRadius:"2px", background:i<=str?strColor:"#e2e8f0", transition:"background .3s" }}/>)}
                      <span style={{ fontSize:"0.75rem", fontWeight:600, color:strColor, marginLeft:"6px", minWidth:"36px" }}>{strLabel}</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", marginBottom:"1.4rem", cursor:"pointer" }} onClick={()=>setAgreed(!agreed)}>
                <div style={{ width:"18px", height:"18px", borderRadius:"5px", border:`2px solid ${agreed?"#2563eb":"#c4d0e8"}`, background:agreed?"#2563eb":"white", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .15s" }}>
                  {agreed&&<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <span style={{ fontSize:"0.85rem", color:"#6b7a99" }}>I agree to the <a href="#" style={{ color:"#2563eb", fontWeight:600, textDecoration:"none" }} onClick={e=>e.stopPropagation()}>Terms of Service</a> and <a href="#" style={{ color:"#2563eb", fontWeight:600, textDecoration:"none" }} onClick={e=>e.stopPropagation()}>Privacy Policy</a></span>
              </div>

              <button className="cr-btn" style={{ width:"100%", padding:"0.85rem", background:"linear-gradient(135deg,#1a2744 0%,#2563eb 100%)", color:"#fff", border:"none", borderRadius:"10px", fontSize:"1rem", fontWeight:600, fontFamily:"inherit", cursor:canSubmit?"pointer":"not-allowed", opacity:canSubmit?1:0.55 }} onClick={handleSignup} disabled={!canSubmit}>
                {checking ? "Checking..." : "Create Account"}
              </button>
              {error ? (
                <p style={{ margin:"0.75rem 0 0", color:"#dc2626", fontSize:"0.85rem", textAlign:"center" }}>{error}</p>
              ) : null}

              <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", margin:"1.25rem 0", color:"#c4d0e8", fontSize:"0.82rem" }}>
                <div style={{ flex:1, height:"1px", background:"#e8edf6" }}/><span>or</span><div style={{ flex:1, height:"1px", background:"#e8edf6" }}/>
              </div>
              <p style={{ textAlign:"center", fontSize:"0.875rem", color:"#6b7a99", margin:0 }}>Already have an account? <span style={{ color:"#2563eb", fontWeight:600, cursor:"pointer" }}>Sign In</span></p>
            </>
        </div>
      </main>
    </div>
  );
}
