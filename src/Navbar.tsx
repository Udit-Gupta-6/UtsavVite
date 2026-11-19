import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Props
interface NavbarProps {
  currentPage: "home" | "signup" | "login" | "dashboard";
}

function Navbar({ currentPage }: NavbarProps) {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  // Check current page
  const isSignupPage = currentPage === "signup";
  const isLoginPage = currentPage === "login";

  // Navigation links
  const navLinks = [
    { name: "Home", id: "" },
    { name: "Explore", id: "events" },
    { name: "Our Services", id: "services" },
    { name: "How It Works", id: "how-it-works" },
  ];

  // Handle navigation and scrolling
  function handleNavClick(sectionId: string) {
    setMenuOpen(false);

    // Home button
    if (!sectionId) {
      if (window.location.pathname === "/") {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } else {
        navigate("/");
      }

      return;
    }

    // If already on Home page
    if (window.location.pathname === "/") {
      const section = document.getElementById(sectionId);

      section?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    // If on another page
    else {
      navigate("/#" + sectionId);
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-orange-100 bg-[#FFFCF7]/95 shadow-sm backdrop-blur-md">
      {/* MAIN NAVBAR CONTAINER */}

      <div className="mx-auto grid w-full max-w-7xl grid-cols-[1fr_auto] items-center px-5 py-3 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:px-8">
        {/* ================= LOGO ================= */}

        <div
          onClick={() => handleNavClick("")}
          className="flex cursor-pointer items-center gap-3 select-none justify-self-start"
        >
          {/* Diya Icon */}

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-orange-200 bg-gradient-to-br from-amber-400 to-orange-600 text-yellow-200 shadow-md">
            <svg
              className="h-7 w-7 animate-pulse text-yellow-100"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C10.5 4.5 9 6.8 9 9.5c0 1.66 1.34 3 3 3s3-1.34 3-3c0-2.7-1.5-5-3-7.5z" />
              <path d="M4 14c0 3.86 3.58 7 8 7s8-3.14 8-7H4z" />
            </svg>
          </div>

          {/* Brand Name */}

          <div>
            <h1 className="bg-gradient-to-r from-amber-500 via-orange-600 to-rose-500 bg-clip-text text-2xl font-extrabold tracking-wide text-transparent">
              UTSAV
            </h1>

            <p className="-mt-1 whitespace-nowrap text-[10px] font-semibold tracking-widest text-stone-500">
              CELEBRATE EVERY MOMENT
            </p>
          </div>
        </div>

        {/* ================= DESKTOP NAVIGATION ================= */}

        <div className="hidden items-center justify-center gap-6 lg:flex xl:gap-8">
          {navLinks.map((link) => (
            <button
              key={link.name}
              type="button"
              onClick={() => handleNavClick(link.id)}
              className="whitespace-nowrap py-2 text-sm font-semibold text-stone-600 transition duration-300 hover:text-orange-600"
            >
              {link.name}
            </button>
          ))}
        </div>

        {/* ================= AUTH BUTTONS ================= */}

        <div className="hidden items-center justify-self-end gap-3 sm:flex">
          {!isLoginPage && (
            <Link
              to="/login"
              className="whitespace-nowrap rounded-xl border border-orange-200 px-5 py-2.5 text-sm font-bold text-orange-600 transition hover:bg-orange-50"
            >
              Login
            </Link>
          )}

          {!isSignupPage && (
            <Link
              to="/signup"
              className="whitespace-nowrap rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Sign Up →
            </Link>
          )}
        </div>

        {/* ================= MOBILE MENU BUTTON ================= */}

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-10 w-10 items-center justify-center justify-self-end rounded-xl border border-orange-200 text-orange-600 transition hover:bg-orange-50 lg:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* ================= MOBILE MENU ================= */}

      {menuOpen && (
        <div className="border-t border-orange-100 bg-[#FFFCF7] px-5 py-5 shadow-lg lg:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <button
                key={link.name}
                type="button"
                onClick={() => handleNavClick(link.id)}
                className="rounded-xl px-4 py-3 text-left text-sm font-semibold text-stone-700 transition hover:bg-orange-50 hover:text-orange-600"
              >
                {link.name}
              </button>
            ))}
          </div>

          {/* Mobile Authentication */}

          <div className="mt-4 flex gap-3 border-t border-orange-100 pt-4">
            {!isLoginPage && (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="flex-1 rounded-xl border border-orange-200 px-4 py-3 text-center text-sm font-bold text-orange-600"
              >
                Login
              </Link>
            )}

            {!isSignupPage && (
              <Link
                to="/signup"
                onClick={() => setMenuOpen(false)}
                className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3 text-center text-sm font-bold text-white"
              >
                Sign Up →
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
