import React from "react";
import { Link } from "react-router-dom";

export default function home() {
  return (
    <main
      className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4"
      style={{ backgroundColor: "#F8F9FB" }}
    >
      <section className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          <span style={{ color: "#1B2A4A" }}>Welcome to </span>
          <span style={{ color: "#1A6BFF" }}>CivicRate</span>
        </h1>
        <p className="mt-4 text-base sm:text-lg" style={{ color: "#1B2A4ACC" }}>
          Discover and rate public services with your community.
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            to="/signup"
            className="rounded-full px-7 py-3 text-sm font-bold shadow-md transition-all duration-300"
            style={{
              backgroundColor: "#1B2A4A",
              color: "#FFFFFF",
              border: "2px solid #1B2A4A",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#F5A623";
              e.currentTarget.style.borderColor = "#F5A623";
              e.currentTarget.style.color = "#1B2A4A";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(245, 166, 35, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#1B2A4A";
              e.currentTarget.style.borderColor = "#1B2A4A";
              e.currentTarget.style.color = "#FFFFFF";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Create an account
          </Link>
        </div>
      </section>
    </main>
  );
}
