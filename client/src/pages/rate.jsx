import { Link } from "react-router-dom";

export default function RatePage() {
  return (
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#f0f4fa] px-4">
      <section className="w-full max-w-3xl rounded-3xl bg-white p-10 text-center shadow-[0_14px_30px_rgba(26,39,68,0.08)]">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#1a2744] sm:text-4xl">
          Your Voice our Growth.
        </h1>
        <p className="mt-3 text-base text-[#1a2744cc] sm:text-lg">
          Every experience shared drives better governance and higher service standards.
        </p>

        <div className="mt-5 flex justify-center">
          <Link
            to="/find-office"
            className="rounded-full border-2 border-[#1a2744] bg-[#1a2744] px-7 py-3 text-sm font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#2563eb] hover:bg-[#2563eb]"
          >
            Rate our employees
          </Link>
        </div>
      </section>
    </main>
  );
}
