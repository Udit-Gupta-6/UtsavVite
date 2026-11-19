import  { useState, useEffect } from "react";
import axios from "axios";

// ----------------------------------------------------
// 1. Interfaces
// ----------------------------------------------------
export interface Vendor {
  _id?: string;
  emailid: string;
  name: string;
  contact: string;
  business: string;
  area: string;
  address: string;
  city: string;
  estd: string;
  selcate: string;
  website?: string;
  insta?: string;
  shoppicurl?: string;
  certpicurl?: string;
}

interface FavrsProps {
  userEmail?: string;
}

export default function Favrs({ userEmail }: FavrsProps) {
  const API_BASE = "http://localhost:2004";

  // ----------------------------------------------------
  // 2. Citizen Email State (from props or localStorage)
  // ----------------------------------------------------
  const [citizenEmail, setCitizenEmail] = useState<string>(
    userEmail ||
      localStorage.getItem("email") ||
      localStorage.getItem("userEmail") ||
      ""
  );

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Sync email when prop or tab changes & auto-fetch wishlist on page load
  useEffect(() => {
    const activeEmail =
      userEmail ||
      localStorage.getItem("email") ||
      localStorage.getItem("userEmail") ||
      "";

    setCitizenEmail(activeEmail);

    if (activeEmail.trim()) {
      doFetchWishlist(activeEmail.trim());
    }
  }, [userEmail]);

  // ----------------------------------------------------
  // 3. API Functions
  // ----------------------------------------------------

  // Fetch wishlist vendors on page render
  async function doFetchWishlist(emailToFetch?: string) {
    const targetEmail = emailToFetch || citizenEmail;

    if (!targetEmail.trim()) return;

    setLoading(true);
    try {
      const resp = await axios.post(`${API_BASE}/favrs/fetchWishlist`, {
        citizenEmail: targetEmail.trim(),
      });

      if (resp.data.status === true && Array.isArray(resp.data.msg)) {
        setVendors(resp.data.msg);
      } else {
        setVendors([]);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setLoading(false);
    }
  }

  // Remove vendor from wishlist
  async function doRemoveFromWishlist(vendorEmail: string) {
    if (!window.confirm("Remove this vendor from your wishlist?")) return;

    // 1. Optimistic UI update: Remove from screen immediately
    setVendors((prev) => prev.filter((v) => v.emailid !== vendorEmail));

    // 2. Remove from DB via backend API
    try {
      const resp = await axios.post(`${API_BASE}/favrs/removeFavs`, {
        citizenEmail: citizenEmail.trim(),
        vendorEmail: vendorEmail,
      });

      if (resp.data.status !== true) {
        alert(resp.data.msg || "Warning: Could not remove from database.");
        // Refresh wishlist if backend failed
        doFetchWishlist();
      }
    } catch (error) {
      console.error("Error removing from database:", error);
      alert("Server error while deleting vendor from wishlist.");
      doFetchWishlist();
    }
  }

  function formatEstd(val: string): string {
    if (!val) return "";
    const d = new Date(val);
    return isNaN(d.getTime()) ? val : String(d.getFullYear());
  }

  return (
    <div className="w-full flex flex-col items-center font-sans">
      <main className="w-full max-w-7xl">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 rounded-2xl p-6 sm:p-8 mb-6 text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="bg-white/20 backdrop-blur-sm text-yellow-100 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              ❤️ FAVORITE VENDORS
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif mt-2">
              My Saved Wishlist
            </h1>
            <p className="text-xs sm:text-sm text-amber-100 mt-1">
              Vendors you have bookmarked for your upcoming festive events.
            </p>
          </div>

          <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-center border border-white/30">
            <span className="block text-2xl font-black">{vendors.length}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-100">
              {vendors.length === 1 ? "Saved Vendor" : "Saved Vendors"}
            </span>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center py-16 bg-white rounded-2xl border border-orange-100 shadow-sm">
            <p className="text-orange-600 font-bold text-sm animate-pulse">
              Loading your saved wishlist...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && vendors.length === 0 && (
          <div className="text-center py-16 px-4 bg-white border-2 border-dashed border-orange-200 rounded-3xl shadow-sm">
            <div className="text-5xl mb-3">💔</div>
            <h3 className="text-lg font-bold font-serif text-gray-800">
              No Wishlist Vendors Found
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto leading-relaxed">
              You haven't saved any vendors yet. Head over to <strong>Event Services</strong>, find verified vendors, and click the ❤️ icon to bookmark them here.
            </p>
          </div>
        )}

        {/* Vendor Cards Grid */}
        {!loading && vendors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor, index) => (
              <div
                key={vendor._id || vendor.emailid || index}
                className="bg-white rounded-2xl overflow-hidden shadow-md border-2 border-orange-200 flex flex-col justify-between hover:shadow-xl hover:border-orange-400 transition"
              >
                {/* 1. Shop Image & Badges */}
                <div className="relative h-44 bg-gradient-to-tr from-amber-100 to-rose-100 flex items-center justify-center overflow-hidden">
                  {vendor.shoppicurl ? (
                    <img
                      src={vendor.shoppicurl}
                      alt={vendor.business || vendor.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-orange-400 text-xs font-semibold">
                      No Shop Picture
                    </div>
                  )}

                  {/* City Badge */}
                  {vendor.city && (
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] font-bold px-2.5 py-1 rounded-md shadow">
                      📍 {vendor.city}
                    </span>
                  )}

                  {/* Estd Badge */}
                  {vendor.estd && (
                    <span className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                      Estd. {formatEstd(vendor.estd)}
                    </span>
                  )}

                  {/* Certificate Link */}
                  {vendor.certpicurl && (
                    <a
                      href={vendor.certpicurl}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute bottom-3 right-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded hover:bg-amber-600 transition"
                    >
                      ✓ Certificate
                    </a>
                  )}
                </div>

                {/* 2. Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900">
                      {vendor.business || vendor.name}
                    </h3>
                    <p className="text-xs text-orange-700 font-semibold">
                      Owner: {vendor.name}
                    </p>

                    <p className="text-xs text-gray-600 mt-2 flex items-start gap-1">
                      <span className="text-rose-500">📍</span>
                      <span>
                        {vendor.address ? `${vendor.address}, ` : ""}
                        {vendor.area ? `${vendor.area}, ` : ""}
                        <strong>{vendor.city}</strong>
                      </span>
                    </p>

                    {/* Categories */}
                    {vendor.selcate && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {vendor.selcate.split(",").map((cat, i) => (
                          <span
                            key={i}
                            className="bg-orange-50 text-orange-800 border border-orange-200 text-[10px] font-bold px-2 py-0.5 rounded"
                          >
                            {cat.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Contact & Links */}
                  <div className="mt-4 pt-3 border-t border-orange-100 flex items-center justify-between text-xs">
                    {vendor.contact && (
                      <a
                        href={`tel:${vendor.contact}`}
                        className="font-bold text-gray-800 hover:text-orange-600"
                      >
                        📞 {vendor.contact}
                      </a>
                    )}

                    <div className="flex items-center gap-2">
                      {vendor.insta && (
                        <a
                          href={
                            vendor.insta.startsWith("http")
                              ? vendor.insta
                              : `https://instagram.com/${vendor.insta.replace("@", "")}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="text-rose-600 font-bold hover:underline"
                        >
                          Insta
                        </a>
                      )}

                      {vendor.website && (
                        <a
                          href={
                            vendor.website.startsWith("http")
                              ? vendor.website
                              : `https://${vendor.website}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 font-bold hover:underline"
                        >
                          Web
                        </a>
                      )}

                      <a
                        href={`mailto:${vendor.emailid}`}
                        className="bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-600 hover:to-rose-600 transition px-2.5 py-1 rounded-md font-bold text-[10px]"
                      >
                        Email
                      </a>
                    </div>
                  </div>
                </div>

                {/* 3. Remove Button */}
                <div className="p-4 pt-0">
                  <button
                    type="button"
                    onClick={() => doRemoveFromWishlist(vendor.emailid)}
                    className="w-full py-2 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-300 rounded-xl font-bold text-xs uppercase tracking-wider transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>🗑️</span>
                    <span>Remove from Wishlist</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}