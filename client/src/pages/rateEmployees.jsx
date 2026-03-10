import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

export default function RateEmployees() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [office, setOffice] = useState(location.state?.office || null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [serviceType, setServiceType] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const officeId = office?._id || searchParams.get("officeId");
  const sessionVisitToken = officeId
    ? sessionStorage.getItem(`visitAccessToken:${officeId}`)
    : "";
  const isAccessVerified =
    Boolean(sessionVisitToken) ||
    location.state?.verifiedOfficeId === officeId;

  useEffect(() => {
    if (!officeId || isAccessVerified) return;
    navigate(`/rate-employees/access?officeId=${officeId}`, {
      replace: true,
      state: office ? { office } : undefined,
    });
  }, [officeId, isAccessVerified, navigate, office]);

  useEffect(() => {
    if (!officeId || !isAccessVerified) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const loadEmployees = async () => {
      setLoading(true);
      setFetchError("");
      try {
        const res = await fetch(`/api/offices/${officeId}/employees`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to load employees");
        }
        setOffice(data.office || null);
        setEmployees(data.employees || []);
      } catch (error) {
        if (error.name !== "AbortError") {
          setFetchError(error.message || "Failed to load employees");
          setEmployees([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadEmployees();
    return () => controller.abort();
  }, [officeId, isAccessVerified]);

  const canSubmit = useMemo(() => {
    return Boolean(
      selectedEmployee &&
        serviceType.trim().length >= 2 &&
        rating >= 1 &&
        rating <= 5 &&
        office
    );
  }, [selectedEmployee, serviceType, rating, office]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitError("");
    setSubmitMessage("");
    setSubmitting(true);

    try {
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token") || "";
      const visitAccessToken = sessionStorage.getItem(`visitAccessToken:${office._id}`) || "";

      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          officeId: office._id,
          officeName: office.name,
          employeeId: selectedEmployee._id,
          district: office.district,
          employeeName: selectedEmployee.name,
          serviceType: serviceType.trim(),
          rating: Number(rating),
          comment: comment.trim(),
          userName: savedUser?.name || "Anonymous",
          userPhone: savedUser?.phone || "",
          visitAccessToken,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Unable to submit rating");
      }

      setSubmitMessage("Rating submitted successfully.");
      setSelectedEmployee(null);
      setServiceType("");
      setRating(5);
      setComment("");
      sessionStorage.removeItem(`visitAccessToken:${office._id}`);
      sessionStorage.removeItem(`verifiedVisit:${office._id}`);
      navigate(`/rate-employees/access?officeId=${office._id}`, {
        replace: true,
        state: {
          office,
          infoMessage: "Rating submitted. This visit code is now used. Enter a new code to rate again.",
        },
      });
    } catch (error) {
      setSubmitError(error.message || "Failed to submit rating");
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
      <section className="mx-auto w-full max-w-5xl rounded-2xl bg-white p-6 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg border border-[#d4dff0] px-3 py-1 text-sm font-semibold text-[#1a2744]"
        >
          Back
        </button>

        <h1 className="mt-4 text-2xl font-extrabold text-[#1a2744]">Rate Employees</h1>
        <p className="mt-1 text-sm text-[#6b7a99]">
          {office ? `${office.name} - ${office.place}, ${office.district}` : "Loading office..."}
        </p>

        {loading ? (
          <div className="mt-5 rounded-2xl border border-[#d4dff0] bg-[#f8fafd] p-8 text-center text-[#6b7a99]">
            Loading employees...
          </div>
        ) : fetchError ? (
          <div className="mt-5 rounded-2xl border border-[#fecaca] bg-[#fef2f2] p-8 text-center text-[#dc2626]">
            {fetchError}
          </div>
        ) : employees.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-[#d4dff0] bg-[#f8fafd] p-8 text-center text-[#6b7a99]">
            No employees found for this office.
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            {employees.map((employee) => (
              <article
                key={employee._id}
                className="rounded-2xl border border-[#e8edf6] bg-white p-5 shadow-[0_2px_12px_rgba(37,99,235,0.06)]"
              >
                <h2 className="text-lg font-bold text-[#1a2744]">{employee.name}</h2>
                <p className="mt-1 text-sm font-semibold text-[#2563eb]">{employee.designation}</p>
                <p className="mt-1 text-sm text-[#6b7a99]">{employee.department}</p>
                <div className="mt-3 flex items-center justify-between rounded-xl bg-[#f8fafd] px-3 py-2 text-sm">
                  <span className="font-semibold text-[#1a2744]">
                    Rating: {employee.rating || 0}
                  </span>
                  <span className="text-[#6b7a99]">
                    {employee.reviewsCount || 0} reviews
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedEmployee(employee);
                    setSubmitError("");
                    setSubmitMessage("");
                  }}
                  className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#1a2744] to-[#2563eb] px-4 py-2 text-sm font-bold text-white"
                >
                  Rate
                </button>
              </article>
            ))}
          </div>
        )}

        {selectedEmployee ? (
          <section className="mt-6 rounded-2xl border border-[#d4dff0] bg-[#f8fafd] p-5">
            <h3 className="text-lg font-bold text-[#1a2744]">
              Submit rating for {selectedEmployee.name}
            </h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#1a2744]">
                  Service type
                </label>
                <input
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full rounded-xl border border-[#d4dff0] px-3 py-2 text-sm outline-none focus:border-[#2563eb]"
                  placeholder="Example: document verification"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-[#1a2744]">
                  Rating (1-5)
                </label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#d4dff0] px-3 py-2 text-sm outline-none focus:border-[#2563eb]"
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-[#1a2744]">
                  Comment (optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-[#d4dff0] px-3 py-2 text-sm outline-none focus:border-[#2563eb]"
                  placeholder="Share your experience"
                />
              </div>

              {submitError ? (
                <p className="text-sm font-semibold text-[#dc2626]">{submitError}</p>
              ) : null}
              {submitMessage ? (
                <p className="text-sm font-semibold text-[#16a34a]">{submitMessage}</p>
              ) : null}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={!canSubmit || submitting}
                  className="w-full rounded-xl bg-gradient-to-r from-[#1a2744] to-[#2563eb] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Submit rating"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedEmployee(null)}
                  className="rounded-xl border border-[#d4dff0] px-4 py-2 text-sm font-bold text-[#1a2744]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        ) : null}
      </section>
    </main>
  );
}
