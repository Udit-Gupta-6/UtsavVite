import  { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 👈 Added for routing

// ============================================================================
// 1. IMPORT CHILD COMPONENTS
// ============================================================================
import CitizenRegistration from "./Citizen";
import EventServicesPage from "./EventServices";
import Favrs from "./Favrs";

// ============================================================================
// 2. INTERFACES & TYPES
// ============================================================================
export type DashboardTab = "registration" | "events" | "favrs";

export interface CitizenDashboardProps {
  initialTab?: DashboardTab;
  userEmail?: string;
  onSignOut?: () => void;
}

// ============================================================================
// 3. MAIN COMPONENT: CITIZEN DASHBOARD
// ============================================================================
export default function CitizenDashboard({
  initialTab = "registration",
  userEmail,
  onSignOut,
}: CitizenDashboardProps) {
  const navigate = useNavigate();

  // --------------------------------------------------------------------------
  // States
  // --------------------------------------------------------------------------
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);
  const [showSignOutModal, setShowSignOutModal] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Read email immediately from props or localStorage (avoids dummy email flash)
  const [citizenEmail, setCitizenEmail] = useState<string>(() => {
    return (
      userEmail ||
      localStorage.getItem("email") ||
      localStorage.getItem("userEmail") ||
      ""
    );
  });

  useEffect(() => {
    // 1. Protect route: if user has no token, redirect to login
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // 2. Sync email if not already present
    const savedEmail = localStorage.getItem("email") || localStorage.getItem("userEmail");
    if (savedEmail) {
      setCitizenEmail(savedEmail);
    }

    // 3. Synchronize with URL hash if present (e.g. #registration, #events, #favrs)
    const hash = window.location.hash.replace("#", "") as DashboardTab;
    if (hash === "registration" || hash === "events" || hash === "favrs") {
      setActiveTab(hash);
    }
  }, [navigate]);

  // Handler for tab switching (updates state & browser URL hash for routing)
  const handleTabChange = (tab: DashboardTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false); // Close mobile drawer if open
    window.location.hash = tab; // Sync browser hash
  };

  // Handler for confirmed Sign Out
  const handleConfirmSignOut = () => {
    // Clear session / tokens
    localStorage.removeItem("email");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("token");
    localStorage.removeItem("utype");

    if (onSignOut) {
      onSignOut();
    } else {
      navigate("/login"); // 👈 Uses react-router-dom navigation
    }
  };

  // --------------------------------------------------------------------------
  // Navigation Menu Items
  // --------------------------------------------------------------------------
  const menuItems = [
    {
      id: "registration" as DashboardTab,
      label: "Citizen Registration",
      subtitle: "KYC & Profile Details",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      id: "events" as DashboardTab,
      label: "Event Services",
      subtitle: "Explore & Book Vendors",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      ),
    },
    {
      id: "favrs" as DashboardTab,
      label: "Favorites (Favrs)",
      subtitle: "Saved Vendor Wishlist",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-gray-800 flex flex-col relative selection:bg-orange-200 selection:text-orange-900 font-sans">
      {/* ====================================================================
          SUBTLE AMBIENT FESTIVE GLOWS (UTSAV THEME)
          ==================================================================== */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-amber-300/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-rose-300/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/2 left-1/3 w-80 h-80 bg-orange-200/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* ====================================================================
          MOBILE TOP BAR (Visible only on small screens)
          ==================================================================== */}
      <div
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-md border-b border-orange-100 sticky top-0 z-30 shadow-sm cursor-pointer select-none"
      >
        {/* Left: "Menu" title with active tab indicator (Replaces UTSAV Logo) */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h10M4 18h7" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 leading-tight">Menu</h2>
            <p className="text-[10px] text-orange-600 font-semibold uppercase tracking-wider">
              {menuItems.find((m) => m.id === activeTab)?.label || "Citizen Portal"}
            </p>
          </div>
        </div>

        {/* Right: Arrow Toggle Button (Replaces Burger Button - shows arrow & rotates on click) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMobileMenuOpen(!mobileMenuOpen);
          }}
          className="p-2 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 active:scale-95 transition-all focus:outline-none"
          aria-label={mobileMenuOpen ? "Close Menu" : "Open Menu"}
        >
          <svg
            className={`w-5 h-5 transition-transform duration-300 ease-in-out ${
              mobileMenuOpen ? "rotate-180 text-orange-700" : "text-orange-600"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Mobile Dropdown Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-orange-200 px-4 py-3 space-y-2 z-20 shadow-lg animate-fadeIn">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/20"
                    : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                }`}
              >
                <span className={isActive ? "text-white" : "text-orange-500"}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              setShowSignOutModal(true);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition border-t border-gray-100 mt-2"
          >
            <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* ====================================================================
          MAIN DASHBOARD BODY (LEFT MENU + RIGHT RE-RENDERING CONTAINER)
          ==================================================================== */}
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-7xl mx-auto p-3 sm:p-5 lg:p-6 gap-5 lg:gap-7">
        {/* ==================================================================
            LEFT SIDEBAR NAVIGATION (DESKTOP)
            ================================================================== */}
        <aside
          className={`hidden md:flex flex-col transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? "w-20" : "w-72 lg:w-80"
          } shrink-0`}
        >
          <div className="bg-white/90 backdrop-blur-xl border border-orange-100/80 rounded-3xl p-4 lg:p-5 shadow-xl shadow-orange-950/5 flex flex-col h-full justify-between sticky top-6">
            {/* Top Section: Citizen Profile Card */}
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-orange-100/60 mb-5">
                <div className={`flex items-center gap-3 ${isSidebarCollapsed ? "justify-center w-full" : ""}`}>
                  {/* Avatar with Festive Ring */}
                  <div className="relative group cursor-pointer">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 p-0.5 shadow-md shadow-orange-500/20 flex items-center justify-center">
                      <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-orange-600 font-bold text-lg font-serif">
                        {citizenEmail ? citizenEmail.charAt(0).toUpperCase() : "C"}
                      </div>
                    </div>
                    {/* Active Status Indicator */}
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                  </div>

                  {/* Profile Details (hidden when collapsed) */}
                  {!isSidebarCollapsed && (
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-900 text-sm truncate block max-w-[150px]">
                          {citizenEmail ? citizenEmail.split("@")[0] : "Citizen"}
                        </span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800">
                          Citizen
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate max-w-[160px]" title={citizenEmail}>
                        {citizenEmail || "No Email Found"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Sidebar Collapse Toggle Button */}
                {!isSidebarCollapsed && (
                  <button
                    type="button"
                    onClick={() => setIsSidebarCollapsed(true)}
                    className="p-1.5 rounded-xl hover:bg-orange-50 text-gray-400 hover:text-orange-600 transition"
                    title="Collapse Sidebar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Expand Toggle when collapsed */}
              {isSidebarCollapsed && (
                <div className="flex justify-center mb-4">
                  <button
                    type="button"
                    onClick={() => setIsSidebarCollapsed(false)}
                    className="p-1.5 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition"
                    title="Expand Sidebar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Sidebar Section Label */}
              {!isSidebarCollapsed && (
                <div className="px-3 mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Dashboard Menu
                  </span>
                  <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                    UTSAV
                  </span>
                </div>
              )}

              {/* Menu Items List */}
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleTabChange(item.id)}
                      className={`w-full group relative flex items-center ${
                        isSidebarCollapsed ? "justify-center p-3" : "px-3.5 py-3"
                      } rounded-2xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/25 scale-[1.02]"
                          : "text-gray-600 hover:text-orange-600 hover:bg-orange-50/80"
                      }`}
                      title={isSidebarCollapsed ? item.label : undefined}
                    >
                      {/* Active Indicator Strip */}
                      {isActive && !isSidebarCollapsed && (
                        <div className="absolute -left-1.5 top-2.5 bottom-2.5 w-1.5 bg-yellow-300 rounded-full shadow-sm" />
                      )}

                      {/* Icon */}
                      <span
                        className={`transition-transform duration-200 group-hover:scale-110 ${
                          isActive ? "text-white" : "text-orange-500/80 group-hover:text-orange-600"
                        }`}
                      >
                        {item.icon}
                      </span>

                      {/* Text Labels */}
                      {!isSidebarCollapsed && (
                        <div className="ml-3.5 text-left flex-1 overflow-hidden">
                          <span className="block leading-tight font-medium tracking-wide">
                            {item.label}
                          </span>
                          <span
                            className={`text-[11px] block mt-0.5 font-normal ${
                              isActive ? "text-orange-100" : "text-gray-400"
                            }`}
                          >
                            {item.subtitle}
                          </span>
                        </div>
                      )}

                      {/* Right Chevron Arrow */}
                      {isActive && !isSidebarCollapsed && (
                        <svg
                          className="w-4 h-4 ml-2 text-white/80 animate-pulse"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Section: Tip Card & Sign Out Button */}
            <div className="pt-4 border-t border-orange-100/60 mt-6 space-y-3">
              {/* Festive Tip Card */}
              {!isSidebarCollapsed && (
                <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 rounded-2xl p-3.5 border border-orange-200/50">
                  <div className="flex items-start gap-2.5">
                    <span className="text-xl">🪔</span>
                    <div>
                      <p className="text-xs font-bold text-gray-800">Festive Assistance</p>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                        Need help finding verified vendors for your event? Check Event Services.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={() => setShowSignOutModal(true)}
                className={`w-full group flex items-center ${
                  isSidebarCollapsed ? "justify-center p-3" : "px-3.5 py-3"
                } rounded-2xl font-semibold text-sm text-gray-500 hover:text-rose-600 hover:bg-rose-50/80 border border-transparent hover:border-rose-200 transition-all duration-200 cursor-pointer`}
                title="Sign Out"
              >
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-rose-500 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>

                {!isSidebarCollapsed && (
                  <div className="ml-3.5 text-left">
                    <span className="block leading-tight font-medium">Sign Out</span>
                    <span className="text-[11px] text-gray-400 block font-normal">End your session</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </aside>

        {/* ==================================================================
            RIGHT SIDE: DYNAMIC ROUTING & COMPONENT DISPLAY AREA
            ================================================================== */}
        <main className="flex-1 flex flex-col min-w-0">
          <div className="bg-white/95 backdrop-blur-xl border border-orange-100 rounded-3xl p-3 sm:p-6 shadow-xl shadow-orange-950/5 min-h-[550px] transition-all">
            {activeTab === "registration" && (
              <div className="animate-fadeIn">
                <CitizenRegistration userEmail={citizenEmail} />
              </div>
            )}
            {activeTab === "events" && (
              <div className="animate-fadeIn">
                <EventServicesPage />
              </div>
            )}
            {activeTab === "favrs" && (
              <div className="animate-fadeIn">
                <Favrs />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ====================================================================
          SIGN OUT CONFIRMATION MODAL (UTSAV THEMED)
          ==================================================================== */}
      {showSignOutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-orange-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />

            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-inner">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-center text-gray-900">Sign Out of UTSAV?</h3>
            <p className="text-sm text-center text-gray-500 mt-2 leading-relaxed">
              Are you sure you want to log out from your Citizen Dashboard? You will need to sign back in with your credentials to manage your bookings and wishlist.
            </p>

            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowSignOutModal(false)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSignOut}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 shadow-md shadow-rose-500/20 transition focus:outline-none cursor-pointer"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}