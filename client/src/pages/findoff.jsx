import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const DISTRICTS = [
  "",
  "Thiruvananthapuram",
  "Kollam",
  "Pathanamthitta",
  "Alappuzha",
  "Kottayam",
  "Idukki",
  "Ernakulam",
  "Thrissur",
  "Palakkad",
  "Malappuram",
  "Kozhikode",
  "Wayanad",
  "Kannur",
  "Kasaragod",
];

export default function FindOffice() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("");
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (district) params.set("district", district);
        if (search.trim()) params.set("search", search.trim());

        const query = params.toString();
        const res = await fetch(`/api/offices${query ? `?${query}` : ""}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch offices");
        }
        setOffices(data.offices || []);
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          setError(fetchError.message || "Failed to fetch offices");
          setOffices([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [search, district]);

  const handleRateClick = (office) => {
    navigate(`/rate-employees/access?officeId=${office._id}`, { state: { office } });
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#f0f4fa] px-4 py-8">
      <section className="mx-auto w-full max-w-6xl">
        <h1 className="text-3xl font-extrabold text-[#1a2744]">Find The Office</h1>

        <div className="mt-5 grid grid-cols-1 gap-3 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search office, place or district"
            className="rounded-xl border border-[#d4dff0] px-3 py-2 text-sm outline-none focus:border-[#2563eb]"
          />
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="rounded-xl border border-[#d4dff0] px-3 py-2 text-sm outline-none focus:border-[#2563eb]"
          >
            <option value=""> Districts</option>
            {DISTRICTS.filter(Boolean).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <p className="mt-4 text-sm text-[#6b7a99]">
          Showing <strong className="text-[#1a2744]">{offices.length}</strong> offices
        </p>

        {loading ? (
          <div className="mt-4 rounded-2xl bg-white p-8 text-center text-[#6b7a99] shadow-sm">
            Loading offices...
          </div>
        ) : error ? (
          <div className="mt-4 rounded-2xl bg-white p-8 text-center text-[#dc2626] shadow-sm">
            {error}
          </div>
        ) : offices.length === 0 ? (
          <div className="mt-4 rounded-2xl bg-white p-8 text-center text-[#6b7a99] shadow-sm">
            No offices found.
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {offices.map((office) => {
              const isOpen = office.open !== false;
              return (
                <article
                  key={office._id}
                  className="rounded-2xl bg-white p-5 shadow-[0_2px_16px_rgba(37,99,235,0.07)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-[#1a2744]">{office.name}</h2>
                      <p className="mt-1 text-xs font-semibold text-[#2563eb]">{office.type}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        isOpen
                          ? "border border-[#bbf7d0] bg-[#f0fdf4] text-[#16a34a]"
                          : "border border-[#fecaca] bg-[#fef2f2] text-[#dc2626]"
                      }`}
                    >
                      {isOpen ? "Open" : "Closed"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-[#6b7a99]">
                    {office.place}, {office.district}
                  </p>
                  <button
                    onClick={() => handleRateClick(office)}
                    className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#1a2744] to-[#2563eb] px-4 py-2 text-sm font-bold text-white"
                  >
                    Rate Employees
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
