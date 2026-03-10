import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const adminToken = localStorage.getItem("adminToken") || "";
  const admin = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("admin") || "{}");
    } catch {
      return {};
    }
  }, []);
  const officeId = admin?.officeId || "";

  const [count, setCount] = useState(10);
  const [issuing, setIssuing] = useState(false);
  const [issueError, setIssueError] = useState("");
  const [issuedNow, setIssuedNow] = useState([]);

  const [codes, setCodes] = useState([]);
  const [loadingCodes, setLoadingCodes] = useState(false);
  const [codesError, setCodesError] = useState("");

  const [report, setReport] = useState({
    totalIssued: 0,
    used: 0,
    unused: 0,
    validOn: "",
  });
  const [loadingReport, setLoadingReport] = useState(false);

  const authHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    }),
    [adminToken]
  );

  const loadCodes = async () => {
    if (!adminToken) return;
    setLoadingCodes(true);
    setCodesError("");
    try {
      const res = await fetch("/api/admin/visit-codes", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load visit codes");
      }
      setCodes(data.codes || []);
    } catch (error) {
      setCodesError(error.message || "Failed to load visit codes");
      setCodes([]);
    } finally {
      setLoadingCodes(false);
    }
  };

  const loadReport = async () => {
    if (!adminToken) return;
    setLoadingReport(true);
    try {
      const res = await fetch("/api/admin/visit-codes/report", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load report");
      }
      setReport({
        totalIssued: data.totalIssued || 0,
        used: data.used || 0,
        unused: data.unused || 0,
        validOn: data.validOn || "",
      });
    } catch {
      setReport({
        totalIssued: 0,
        used: 0,
        unused: 0,
        validOn: "",
      });
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    if (!adminToken) {
      navigate("/admin/login", { replace: true });
      return;
    }
    loadCodes();
    loadReport();
  }, [adminToken]);

  const handleGenerateCodes = async (e) => {
    e.preventDefault();
    if (!officeId || !adminToken) return;

    setIssuing(true);
    setIssueError("");
    setIssuedNow([]);

    try {
      const res = await fetch(`/api/offices/${officeId}/issue-visit-codes`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ count: Number(count) || 1 }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to generate visit codes");
      }
      setIssuedNow(data.codes || []);
      await Promise.all([loadCodes(), loadReport()]);
    } catch (error) {
      setIssueError(error.message || "Failed to generate visit codes");
    } finally {
      setIssuing(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    navigate("/admin/login", { replace: true });
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#f0f4fa] px-4 py-8">
      <section className="mx-auto w-full max-w-6xl space-y-5">
        <header className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-[#1a2744]">Office Admin Dashboard</h1>
              <p className="mt-1 text-sm text-[#6b7a99]">
                {admin?.name || "Admin"} | Office ID: {officeId || "N/A"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleAdminLogout}
              className="rounded-xl border border-[#d4dff0] px-4 py-2 text-sm font-bold text-[#1a2744]"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-[#1a2744]">Issue Codes</h2>
          <form onSubmit={handleGenerateCodes} className="mt-4 flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#1a2744]">Count</label>
              <input
                type="number"
                min={1}
                max={50}
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="w-32 rounded-xl border border-[#d4dff0] px-3 py-2 text-sm outline-none focus:border-[#2563eb]"
              />
            </div>
            <button
              type="submit"
              disabled={issuing || !officeId}
              className="rounded-xl bg-gradient-to-r from-[#1a2744] to-[#2563eb] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              {issuing ? "Generating..." : "Generate Codes"}
            </button>
          </form>
          {issueError ? <p className="mt-2 text-sm font-semibold text-[#dc2626]">{issueError}</p> : null}

          {issuedNow.length > 0 ? (
            <div className="mt-4 overflow-x-auto rounded-xl border border-[#d4dff0]">
              <table className="min-w-full text-sm">
                <thead className="bg-[#f8fafd] text-left text-[#1a2744]">
                  <tr>
                    <th className="px-3 py-2">Code</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Valid Date</th>
                  </tr>
                </thead>
                <tbody>
                  {issuedNow.map((code) => (
                    <tr key={code} className="border-t border-[#eef3fb]">
                      <td className="px-3 py-2 font-mono font-semibold">{code}</td>
                      <td className="px-3 py-2">unused</td>
                      <td className="px-3 py-2">{report.validOn || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-[#1a2744]">Usage Report</h2>
          {loadingReport ? (
            <p className="mt-2 text-sm text-[#6b7a99]">Loading report...</p>
          ) : (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[#d4dff0] bg-[#f8fafd] p-3">
                <p className="text-xs font-semibold text-[#6b7a99]">Total Issued</p>
                <p className="text-2xl font-extrabold text-[#1a2744]">{report.totalIssued}</p>
              </div>
              <div className="rounded-xl border border-[#d4dff0] bg-[#f8fafd] p-3">
                <p className="text-xs font-semibold text-[#6b7a99]">Used</p>
                <p className="text-2xl font-extrabold text-[#1a2744]">{report.used}</p>
              </div>
              <div className="rounded-xl border border-[#d4dff0] bg-[#f8fafd] p-3">
                <p className="text-xs font-semibold text-[#6b7a99]">Unused</p>
                <p className="text-2xl font-extrabold text-[#1a2744]">{report.unused}</p>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-[#1a2744]">Today's Codes</h2>
          {loadingCodes ? (
            <p className="mt-2 text-sm text-[#6b7a99]">Loading codes...</p>
          ) : codesError ? (
            <p className="mt-2 text-sm font-semibold text-[#dc2626]">{codesError}</p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-xl border border-[#d4dff0]">
              <table className="min-w-full text-sm">
                <thead className="bg-[#f8fafd] text-left text-[#1a2744]">
                  <tr>
                    <th className="px-3 py-2">Code</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Valid Date</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.length === 0 ? (
                    <tr>
                      <td className="px-3 py-3 text-[#6b7a99]" colSpan={3}>
                        No codes issued for today.
                      </td>
                    </tr>
                  ) : (
                    codes.map((item) => (
                      <tr key={item._id} className="border-t border-[#eef3fb]">
                        <td className="px-3 py-2 font-mono font-semibold">{item.code}</td>
                        <td className="px-3 py-2">{item.status}</td>
                        <td className="px-3 py-2">{item.validOn}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
