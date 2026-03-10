import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";

export default function RateEmployeesAccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const officeId = searchParams.get("officeId");
  const [office, setOffice] = useState(location.state?.office || null);
  const [visitCode, setVisitCode] = useState("");
  const [loadingOffice, setLoadingOffice] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const infoMessage = location.state?.infoMessage || "";

  useEffect(() => {
    if (!officeId || office) return;

    const controller = new AbortController();
    const loadOffice = async () => {
      setLoadingOffice(true);
      setError("");
      try {
        const res = await fetch(`/api/offices/${officeId}/employees`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Unable to load office details");
        }
        setOffice(data.office || null);
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          setError(fetchError.message || "Unable to load office details");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingOffice(false);
        }
      }
    };

    loadOffice();
    return () => controller.abort();
  }, [officeId, office]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!officeId || !visitCode.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/offices/${officeId}/verify-visit-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitCode: visitCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Visit code verification failed");
      }

      sessionStorage.setItem(`verifiedVisit:${officeId}`, String(Date.now()));
      sessionStorage.setItem(`visitAccessToken:${officeId}`, data.visitAccessToken || "");
      navigate(`/rate-employees?officeId=${officeId}`, {
        replace: true,
        state: { office, verifiedOfficeId: officeId },
      });
    } catch (submitError) {
      setError(submitError.message || "Visit code verification failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (!officeId) {
    return (
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#f0f4fa] px-4">
        <section className="w-full max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-[#1a2744]">Select an Office First</h1>
          <p className="mt-2 text-sm text-[#6b7a99]">
            Open the office list and choose "Rate Employees".
          </p>
          <Link
            to="/find-office"
            className="mt-5 inline-block rounded-xl bg-[#1a2744] px-5 py-2 text-sm font-bold text-white"
          >
            Go to Find Office
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#f0f4fa] px-4 py-8">
      <section className="mx-auto w-full max-w-xl rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-extrabold text-[#1a2744]">Enter One-Time Visit Code</h1>
        <p className="mt-2 text-sm text-[#6b7a99]">
          {office
            ? `Office: ${office.name}, ${office.place}`
            : loadingOffice
            ? "Loading office details..."
            : "Enter the code shared by the office to continue."}
        </p>
        {infoMessage ? <p className="mt-2 text-sm font-semibold text-[#16a34a]">{infoMessage}</p> : null}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-[#1a2744]">Visit code</label>
            <input
              value={visitCode}
              onChange={(e) => setVisitCode(e.target.value)}
              placeholder="Enter one-time code"
              className="w-full rounded-xl border border-[#d4dff0] px-3 py-2 text-sm uppercase outline-none focus:border-[#2563eb]"
            />
          </div>

          {error ? <p className="text-sm font-semibold text-[#dc2626]">{error}</p> : null}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting || !visitCode.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-[#1a2744] to-[#2563eb] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              {submitting ? "Verifying..." : "Continue to Rate"}
            </button>
            <Link
              to="/find-office"
              className="rounded-xl border border-[#d4dff0] px-4 py-2 text-sm font-bold text-[#1a2744]"
            >
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
