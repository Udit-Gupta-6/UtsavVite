import React, { useState, useEffect } from "react";
import axios from "axios";

// ----------------------------------------------------
// 1. Interfaces
// ----------------------------------------------------

interface Vendor {
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

interface FormErrors {
  event?: string;
  services?: string;
  city?: string;
}

interface EventServicesProps {
  userEmail?: string;
}

function EventServices({ userEmail }: EventServicesProps) {
  // Backend Base URL
  const API_BASE = "http://localhost:2004";

  // Predefined events
  const eventOptions = [
    "Birthday",
    "Wedding",
    "Engagement",
    "Anniversary",
    "Jagran",
    "Bhog",
    "Sukhmani Sahib Path",
    "Akhand Path Sahib",
    "Housewarming",
    "Mata Ki Chowki",
    "Kirtan Darbar",
    "Baby Shower",
    "Retirement Party",
    "Griha Pravesh",
    "Bhangra Night",
    "Farewell Party",
  ];

  // Database States
  const [citiesList, setCitiesList] = useState<string[]>([]);
  const [servicesList, setServicesList] = useState<string[]>([]);

  // Selected Inputs
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");

  // ========================================================
  // Citizen Email (Read from Prop or localStorage)
  // ========================================================
  const [citizenEmail, setCitizenEmail] = useState<string>(
    userEmail ||
    localStorage.getItem("email") ||
    localStorage.getItem("userEmail") ||
    ""
  );

  useEffect(() => {
    // 1. Determine active email
    const activeEmail =
      userEmail ||
      localStorage.getItem("email") ||
      localStorage.getItem("userEmail") ||
      "";
    if (activeEmail) {
      setCitizenEmail(activeEmail);
      // 2. Fetch existing wishlist so hearts show RED ❤️ on load
      axios
        .post(`${API_BASE}/favrs/fetchWishlist`, {
          citizenEmail: activeEmail.trim(),
        })
        .then((res) => {
          if (res.data.status === true && Array.isArray(res.data.msg)) {
            // Extract only the vendor emails: ["v1@gmail.com", "v2@gmail.com"]
            const savedEmails = res.data.msg.map((v: Vendor) => v.emailid);
            setSavedVendorEmails(savedEmails);
          }
        })
        .catch((err) => {
          console.error("Error loading initial favorites:", err);
        });
    }
  }, [userEmail]);

  // Wishlist / Saved Vendors
  const [savedVendorEmails, setSavedVendorEmails] = useState<string[]>([]);

  // Result Vendors & UI States
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loadingServices, setLoadingServices] = useState<boolean>(false);
  const [loadingVendors, setLoadingVendors] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // ========================================================
  // PAGINATION LOGIC (4 Cards Per Page)
  // ========================================================
  const [currentPage, setCurrentPage] = useState<number>(1);
  const CARDS_PER_PAGE = 4;

  const totalPages = Math.ceil(vendors.length / CARDS_PER_PAGE);
  const indexOfLastCard = currentPage * CARDS_PER_PAGE;
  const indexOfFirstCard = indexOfLastCard - CARDS_PER_PAGE;
  const currentVendors = vendors.slice(indexOfFirstCard, indexOfLastCard);

  // ========================================================
  // 1. PAGE LOAD: FETCH DISTINCT CITIES
  // ========================================================
  useEffect(() => {
    doFetchCities();
  }, []);

  async function doFetchCities() {
    try {
      const url = `${API_BASE}/eventss/eventCityFetch`;
      const resp = await axios.post(url);

      if (resp.data.status === true && Array.isArray(resp.data.msg)) {
        setCitiesList(resp.data.msg);
      } else if (Array.isArray(resp.data)) {
        setCitiesList(resp.data);
      } else {
        setCitiesList([]);
      }
    } catch (error) {
      console.error("Error fetching cities from database:", error);
      setCitiesList([]);
    }
  }

  // ========================================================
  // 2. EVENT SELECT: FETCH SERVICES
  // ========================================================
  async function doSelectEvent(event: React.ChangeEvent<HTMLSelectElement>) {
    const chosenEvent = event.target.value;
    setSelectedEvent(chosenEvent);
    setSelectedServices([]);
    setServicesList([]);
    setErrors((prev) => ({ ...prev, event: "" }));

    if (!chosenEvent) return;

    setLoadingServices(true);
    try {
      const url = `${API_BASE}/eventss/eventSerFetch`;
      const resp = await axios.post(url, {
        eventOptions: chosenEvent,
        event: chosenEvent,
      });

      if (resp.data.status === true) {
        let serv = resp.data.msg?.services || resp.data.msg;

        if (Array.isArray(serv)) {
          setServicesList(serv);
        } else if (typeof serv === "string") {
          setServicesList(serv.split(",").map((s: string) => s.trim()));
        } else {
          setServicesList([]);
        }
      } else {
        setServicesList([]);
        alert(resp.data.msg);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      setServicesList([]);
    } finally {
      setLoadingServices(false);
    }
  }

  // ========================================================
  // 3. TOGGLE SERVICE
  // ========================================================
  function doToggleService(service: string) {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter((s) => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
    setErrors((prev) => ({ ...prev, services: "" }));
  }

  function doSelectAllServices() {
    setSelectedServices([...servicesList]);
    setErrors((prev) => ({ ...prev, services: "" }));
  }

  function doClearServices() {
    setSelectedServices([]);
  }

  // ========================================================
  // 4. FORM VALIDATION
  // ========================================================
  function validateForm(): boolean {
    const err: FormErrors = {};

    if (!selectedEvent.trim()) {
      err.event = "Please choose an event";
    }

    if (selectedServices.length === 0) {
      err.services = "Please select at least 1 service";
    }

    if (!selectedCity.trim()) {
      err.city = "Please select a city";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  }

  // ========================================================
  // 5. FIND VENDORS
  // ========================================================
  async function doFindVendors(event: React.FormEvent) {
    event.preventDefault();

    if (!validateForm()) return;

    setLoadingVendors(true);
    setHasSearched(true);
    setCurrentPage(1);

    try {
      const url = `${API_BASE}/eventss/eventVendorDetails`;
      const payload = {
        city: selectedCity,
        services: selectedServices,
      };

      let token = localStorage.getItem("token");
      const resp = await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resp.data.status === true && Array.isArray(resp.data.msg)) {
        setVendors(resp.data.msg);
      } else {
        setVendors([]);
        alert(resp.data.msg || "No vendors found");
      }
    } catch (error) {
      console.error("Vendor Fetch Error:", error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.msg || "Unable to fetch vendors");
      } else {
        alert("Something went wrong");
      }
      setVendors([]);
    } finally {
      setLoadingVendors(false);
    }
  }

  // ========================================================
  // 6. TOGGLE FAVORITE VENDOR (WISHLIST)
  // ========================================================
  async function handleToggleFavorite(vendorEmail: string) {
    // If not logged in, alert user
    if (!citizenEmail || !citizenEmail.trim()) {
      alert("Please log in to your Citizen account to save vendors to your wishlist!");
      return;
    }

    try {
      const url = `${API_BASE}/eventss/eventFavVendor`;
      const payload = {
        citizenEmail: citizenEmail.trim(),
        vendorEmail: vendorEmail.trim(),
      };

      const resp = await axios.post(url, payload);

      if (resp.data.status === true) {
        if (resp.data.action === "saved") {
          setSavedVendorEmails((prev) => [...prev, vendorEmail]);
        } else if (resp.data.action === "removed") {
          setSavedVendorEmails((prev) => prev.filter((e) => e !== vendorEmail));
        } else {
          // Fallback toggle
          setSavedVendorEmails((prev) =>
            prev.includes(vendorEmail)
              ? prev.filter((e) => e !== vendorEmail)
              : [...prev, vendorEmail]
          );
        }
      } else {
        alert(resp.data.msg || "Could not update favorites");
      }
    } catch (error) {
      console.error("Error saving favorite vendor to DB:", error);
      alert("Unable to update favorites right now.");
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
        {/* Hero Banner Panel */}
        <div className="bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 rounded-2xl p-6 sm:p-8 mb-8 text-white shadow-md">
          <span className="bg-white/20 backdrop-blur-sm text-yellow-100 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            ✨ UTSAV EVENT SERVICES
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif mt-2">
            Find Top Verified Vendors For Your Events
          </h1>
          <p className="text-xs sm:text-sm text-amber-100 mt-1">
            Pick your event, select required services, and choose your city to
            connect with local vendors.
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ==================== LEFT COLUMN: SEARCH FORM ==================== */}
          <div className="lg:col-span-5 bg-orange-50/40 rounded-2xl p-6 shadow-sm border border-orange-200">
            <form onSubmit={doFindVendors} className="space-y-6">
              <div className="border-b border-orange-200 pb-3">
                <h2 className="text-xl font-bold font-serif text-rose-900">
                  Select Requirements
                </h2>
                <p className="text-xs text-gray-500">
                  Filter vendors by your event details
                </p>
              </div>

              {/* 1. Event Dropdown */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-rose-900 mb-1.5">
                  1. Select Event <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedEvent}
                  onChange={doSelectEvent}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold outline-none bg-white transition cursor-pointer ${errors.event
                      ? "border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    }`}
                >
                  <option value="">-- Choose Event --</option>
                  {eventOptions.map((ev, index) => (
                    <option key={index} value={ev}>
                      🎉 {ev}
                    </option>
                  ))}
                </select>
                {errors.event && (
                  <p className="text-xs text-red-600 font-semibold mt-1">
                    {errors.event}
                  </p>
                )}
              </div>

              {/* 2. Services List */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-rose-900">
                    2. Choose Services <span className="text-red-500">*</span>
                  </label>
                  {servicesList.length > 0 && !loadingServices && (
                    <div className="flex gap-2 text-xs font-bold">
                      <button
                        type="button"
                        onClick={doSelectAllServices}
                        className="text-orange-600 hover:underline cursor-pointer"
                      >
                        Select All
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        type="button"
                        onClick={doClearServices}
                        className="text-gray-500 hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                {loadingServices ? (
                  <div className="p-4 text-center bg-white rounded-xl border border-dashed border-orange-300">
                    <p className="text-xs text-orange-600 font-bold animate-pulse">
                      Loading services...
                    </p>
                  </div>
                ) : servicesList.length > 0 ? (
                  <div
                    className={`max-h-56 overflow-y-auto p-3 bg-white rounded-xl border ${errors.services ? "border-red-500" : "border-orange-200"
                      } space-y-2`}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {servicesList.map((service, index) => {
                        const isChecked = selectedServices.includes(service);
                        return (
                          <div
                            key={index}
                            onClick={() => doToggleService(service)}
                            className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs font-semibold cursor-pointer select-none transition ${isChecked
                                ? "bg-orange-500 text-white border-orange-500"
                                : "bg-orange-50/30 text-gray-800 border-orange-200 hover:border-orange-400"
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => { }}
                              className="accent-orange-600 cursor-pointer"
                            />
                            <span className="truncate">{service}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-white border border-dashed border-orange-200 text-center text-xs text-gray-500">
                    {selectedEvent
                      ? "No services found for this event."
                      : "👈 Select an event to load services"}
                  </div>
                )}

                {selectedServices.length > 0 && (
                  <p className="text-xs text-rose-900 font-bold mt-2">
                    Selected ({selectedServices.length}):{" "}
                    <span className="text-orange-600 font-semibold">
                      {selectedServices.join(", ")}
                    </span>
                  </p>
                )}

                {errors.services && (
                  <p className="text-xs text-red-600 font-semibold mt-1">
                    {errors.services}
                  </p>
                )}
              </div>

              {/* 3. City Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-rose-900 mb-1.5">
                  3. Select City <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setErrors((prev) => ({ ...prev, city: "" }));
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold outline-none bg-white transition cursor-pointer ${errors.city
                      ? "border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    }`}
                >
                  <option value="">-- Choose City --</option>
                  {citiesList.map((city, index) => (
                    <option key={index} value={city}>
                      📍 {city}
                    </option>
                  ))}
                </select>
                {errors.city && (
                  <p className="text-xs text-red-600 font-semibold mt-1">
                    {errors.city}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loadingVendors}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold text-sm tracking-wider uppercase rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                {loadingVendors ? "Searching..." : "Find Vendors"}
              </button>
            </form>
          </div>

          {/* ==================== RIGHT COLUMN: VENDORS CARDS ==================== */}
          <div className="lg:col-span-7">
            {/* Status bar */}
            <div className="bg-orange-100/70 border border-orange-200 rounded-xl px-5 py-3 mb-5 flex justify-between items-center text-xs font-bold text-rose-900">
              <span>
                {hasSearched
                  ? `Vendors in ${selectedCity}`
                  : "Vendors Directory"}
                {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
              </span>
              <span className="bg-white px-2.5 py-1 rounded-md text-orange-600 border border-orange-200">
                {vendors.length} Found
              </span>
            </div>

            {/* Before Search Prompt */}
            {!loadingVendors && !hasSearched && (
              <div className="bg-white rounded-2xl p-10 text-center border-2 border-dashed border-orange-200">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-lg font-bold font-serif text-gray-800">
                  Find Event Vendors
                </h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Select your event, pick services, choose your city, and click{" "}
                  <strong>"Find Vendors"</strong>.
                </p>
              </div>
            )}

            {/* Loading Indicator */}
            {loadingVendors && (
              <div className="p-10 text-center bg-white rounded-2xl border border-orange-100">
                <p className="text-orange-600 font-bold animate-pulse text-sm">
                  Searching verified vendors...
                </p>
              </div>
            )}

            {/* No Vendors Found State */}
            {!loadingVendors && hasSearched && vendors.length === 0 && (
              <div className="bg-white rounded-2xl p-10 text-center border-2 border-dashed border-red-200">
                <div className="text-4xl mb-3">❌</div>
                <h3 className="text-lg font-bold text-gray-800">
                  No Vendors Found
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  No vendors available in database for{" "}
                  <strong>{selectedCity}</strong> with the selected services.
                </p>
              </div>
            )}

            {/* Vendor Cards List (Paginated: 4 per page) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {!loadingVendors &&
                currentVendors.map((vendor, index) => {
                  const isSaved = savedVendorEmails.includes(vendor.emailid);

                  return (
                    <div
                      key={vendor._id || vendor.emailid || index}
                      className="bg-white rounded-2xl overflow-hidden shadow-md border-2 border-orange-200 flex flex-col justify-between hover:shadow-xl hover:border-orange-400 transition"
                    >
                      {/* Shop Picture Area */}
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

                        {/* Heart Wishlist Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleFavorite(vendor.emailid)}
                          title={
                            isSaved
                              ? "Remove from favorites"
                              : "Save vendor to favorites"
                          }
                          className={`absolute top-3 right-3 p-2 rounded-full shadow-md backdrop-blur-sm transition-all duration-200 transform hover:scale-110 active:scale-95 cursor-pointer ${isSaved
                              ? "bg-rose-500 text-white shadow-rose-200"
                              : "bg-white/90 text-gray-400 hover:text-rose-500 hover:bg-white"
                            }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4 transition-colors"
                            viewBox="0 0 24 24"
                            fill={isSaved ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        </button>

                        {/* Estd Badge */}
                        {vendor.estd && (
                          <span className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                            Estd. {formatEstd(vendor.estd)}
                          </span>
                        )}

                        {/* Certificate Badge */}
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

                      {/* Card Body */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-base font-extrabold text-gray-900">
                              {vendor.business || vendor.name}
                            </h3>
                          </div>
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

                          {/* Category Badges */}
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

                        {/* Card Footer Details */}
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
                                title="Instagram"
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
                                title="Website"
                              >
                                Web
                              </a>
                            )}

                            <a
                              href={`mailto:${vendor.emailid}`}
                              className="bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-600 hover:to-rose-600 transition px-3 py-1 rounded-lg font-bold text-[11px]"
                            >
                              Email
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2 select-none">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl border border-orange-200 bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm cursor-pointer"
                >
                  &larr; Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => {
                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-9 h-9 flex items-center justify-center text-xs font-bold rounded-xl transition shadow-sm cursor-pointer ${isActive
                            ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-orange-300 font-extrabold scale-105"
                            : "bg-white border border-orange-200 text-gray-700 hover:bg-orange-50 hover:border-orange-400"
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl border border-orange-200 bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm cursor-pointer"
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default EventServices;