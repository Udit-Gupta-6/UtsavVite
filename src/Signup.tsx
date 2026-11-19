import React, { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
// ============================================================================
// 1. INTERFACES (Data Types matching DB & Validation)
// ============================================================================

// Schema matching database table columns: emailid, password, utype, status
export interface SignupFormState {
  emailid: string;
  password: string;
  utype: string; // "Citizen" or "Vendor"
  status: boolean; // 1 for active user
}

// Validation status structure (same pattern used in citizen.tsx)
export interface ValidationStatus {
  isValid: boolean;
  message: string;
}

// ============================================================================
// 2. MAIN SIGNUP COMPONENT (No Navbar - will be added by you)
// ============================================================================
export default function Signup() {
  // ----------------------------------------------------
  // States
  // ----------------------------------------------------

  // Main form data state
  const [formData, setFormData] = useState<SignupFormState>({
    emailid: "",
    password: "",
    utype: "",
    status: true, // Default status is 1 (active user) for security rakh le db leyi okkkk
  });

  // Runtime validation state for fields (matches citizen.tsx pattern)
  const [validations, setValidations] = useState<{ [key: string]: ValidationStatus }>({});

  // Password visibility toggle (Show / Hide)
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Loading spinner state during submission
  const [loading, setLoading] = useState<boolean>(false);

  // ----------------------------------------------------
  // 3. Validation Helper Function (Runtime & Submit)
  // ----------------------------------------------------
  function validateField(name: string, value: string): ValidationStatus {
    // Check for empty field
    if (value.trim() === "") {
      if (name === "emailid")
        return { isValid: false, message: "Email ID is required" };

      if (name === "password")
        return { isValid: false, message: "Password is required" };

      if (name === "utype")
        return { isValid: false, message: "Please select a user type (Citizen or Vendor)" };

      return { isValid: false, message: "This field is required" };
    }

    // Email Regex Validation
    if (name === "emailid") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value.trim())
        ? { isValid: true, message: "Valid Email ID ✓" }
        : { isValid: false, message: "Invalid email format (e.g., user@domain.com)" };
    }

    // Password Length Validation
    if (name === "password") {
      return value.length >= 6
        ? { isValid: true, message: "Password looks good ✓" }
        : { isValid: false, message: "Password must be at least 6 characters" };
    }

    // User Type Selection
    if (name === "utype") {
      return value !== ""
        ? { isValid: true, message: "User type selected ✓" }
        : { isValid: false, message: "Please select a user type (Citizen or Vendor)" };
    }

    return { isValid: true, message: "Valid ✓" };
  }

  // ----------------------------------------------------
  // 4. Runtime Input Change Handler
  // ----------------------------------------------------
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    // 1. Update form data
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 2. Validate in real-time on every keystroke / change
    const valResult = validateField(name, value);
    setValidations((prev) => ({
      ...prev,
      [name]: valResult,
    }));
  }

  // ----------------------------------------------------
  // 5. Signup Submit Handler (with LocalStorage & Alert)
  // ----------------------------------------------------
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    // Validate all fields on submit
    const emailVal = validateField("emailid", formData.emailid);
    const passwordVal = validateField("password", formData.password);
    const utypeVal = validateField("utype", formData.utype);

    setValidations({
      emailid: emailVal,
      password: passwordVal,
      utype: utypeVal,
    });

    // If any field is invalid, prevent submission
    if (!emailVal.isValid || !passwordVal.isValid || !utypeVal.isValid) {
      return;
    }

    // Prepare table payload (columns: emailid, password, utype, status)
    const payload = {
      emailid: formData.emailid.trim().toLowerCase(),
      password: formData.password,
      utype: formData.utype,
      status: formData.status, // 1
    };

    setLoading(true);

    try {
      // ----------------------------------------------------------------------
      // BACKEND API CALL:
      // When your backend route is ready, this will save data in DB users table.
      // ----------------------------------------------------------------------
      // const url = "http://localhost:2004/signup/signupUser";
      const resp = await axios.post(`${API_URL}/signup/signupUser`, payload,{ headers: { "Content-Type": "application/x-www-form-urlencoded" } });

      if (resp.data.status === true) {
        // 1. Store emailid in localStorage
        localStorage.setItem("userEmail", formData.emailid);

        // 2. Read from localStorage and alert "Welcome user's emailid"
        const savedEmail = localStorage.getItem("userEmail");
        alert("Welcome" + savedEmail)

        // 3. Clear form and validations
        setFormData({
          emailid: "",
          password: "",
          utype: "",
          status: true,
        });
        setValidations({});
      } else {
        alert(resp.data.msg || "Signup failed. Please try again.");
        console.log(resp.data.error)
        console.log(resp.data.msg)
      }
    } catch (error) {
      console.warn("Backend not yet connected or returned error:", error);

      // ----------------------------------------------------------------------
      // LOCALSTORAGE & ALERT (Active even while backend is being created)
      // ----------------------------------------------------------------------
      localStorage.setItem("userEmail", formData.emailid);
      const savedEmail = localStorage.getItem("userEmail");
      alert(`Welcome ${savedEmail}`);

      // Reset form
      setFormData({
        emailid: "",
        password: "",
        utype: "",
        status: true,
      });
      setValidations({});
    } finally {
      setLoading(false);
    }
  }

  // ============================================================================
  // 6. UI RENDER (Theme: Relaxed, Decent, UTSAV Warm Aesthetics)
  // ============================================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Main Container Card */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-orange-100 overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* ====================================================================
            LEFT SIDE: RELAXED & DECENT SIGNUP PICTURE (Warm ambiance, peaceful)
            ==================================================================== */}
        <div className="relative hidden md:block min-h-[560px] bg-stone-900 overflow-hidden">
          {/* Relaxed, Decent Event/Celebration Image */}
          <img
            src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80"
            alt="Warm Elegant Celebration"
            className="absolute inset-0 w-full h-full object-cover transform hover:scale-105 transition-transform duration-700 ease-out"
          />

          {/* Calm, Soft Warm Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-900/40 to-transparent" />

          {/* Overlay Content */}
          <div className="relative z-10 h-full flex flex-col justify-between p-8 text-white">
            {/* Top Brand Emblem */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-200 shadow-md border border-white/20">
                {/* Diya / Flame Icon */}
                <svg
                  className="w-6 h-6 text-amber-200"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C10.5 4.5 9 6.8 9 9.5c0 1.66 1.34 3 3 3s3-1.34 3-3c0-2.7-1.5-5-3-7.5z" />
                  <path d="M4 14c0 3.86 3.58 7 8 7s8-3.14 8-7H4z" />
                </svg>
              </div>
              <div>
                <span className="text-2xl font-black tracking-widest font-serif drop-shadow-sm">
                  UTSAV
                </span>
                <p className="text-[11px] uppercase font-semibold text-amber-200 tracking-wider">
                  Celebrate Every Moment
                </p>
              </div>
            </div>

            {/* Bottom Relaxed Text */}
            <div className="space-y-3">
              <span className="inline-block px-3 py-1 bg-amber-600/75 backdrop-blur-sm rounded-full text-xs font-medium tracking-wide text-amber-100">
                Seamless & Peaceful Experience
              </span>

              <h2 className="text-2xl lg:text-3xl font-semibold leading-snug text-white">
                Begin your festive journey with tranquility.
              </h2>

              <p className="text-xs text-stone-300 leading-relaxed">
                Connect with verified vendors or register your event services seamlessly on UTSAV.
              </p>
            </div>
          </div>
        </div>

        {/* ====================================================================
            RIGHT SIDE: SIGNUP FORM
            ==================================================================== */}
        <div className="p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">

          {/* Signup Heading */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Sign Up
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Enter your details to create your UTSAV account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} noValidate className="space-y-4">

            {/* --------------------------------------------------------------
                1. EMAIL ID FIELD & INPUT BOX (WITH RUNTIME VALIDATION)
                -------------------------------------------------------------- */}
            <div>
              <label
                htmlFor="emailid"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
              >
                Email ID <span className="text-rose-500">*</span>
              </label>

              <div className="relative">
                {/* Envelope / Email Icon */}
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </div>

                <input
                  type="email"
                  id="emailid"
                  name="emailid"
                  value={formData.emailid}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-gray-800 placeholder-gray-400 transition focus:outline-none ${validations.emailid
                      ? validations.emailid.isValid
                        ? "border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                        : "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-200"
                      : "border-gray-200 hover:border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    }`}
                />
              </div>

              {/* Runtime validation feedback for Email */}
              {validations.emailid && (
                <span
                  className={`text-xs font-semibold block mt-1 ${validations.emailid.isValid ? "text-emerald-600" : "text-rose-600"
                    }`}
                >
                  {validations.emailid.message}
                </span>
              )}
            </div>

            {/* --------------------------------------------------------------
                2. PASSWORD FIELD & INPUT BOX (WITH SHOW/HIDE TOGGLE)
                -------------------------------------------------------------- */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
              >
                Password <span className="text-rose-500">*</span>
              </label>

              <div className="relative">
                {/* Lock Icon */}
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>

                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className={`w-full pl-10 pr-11 py-3 rounded-xl border text-sm text-gray-800 placeholder-gray-400 transition focus:outline-none ${validations.password
                      ? validations.password.isValid
                        ? "border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                        : "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-200"
                      : "border-gray-200 hover:border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    }`}
                />

                {/* Show / Hide Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-orange-600 transition cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    // Eye slash icon
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    // Eye icon
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* Runtime validation feedback for Password */}
              {validations.password && (
                <span
                  className={`text-xs font-semibold block mt-1 ${validations.password.isValid ? "text-emerald-600" : "text-rose-600"
                    }`}
                >
                  {validations.password.message}
                </span>
              )}
            </div>

            {/* --------------------------------------------------------------
                3. USER TYPE COMBO (VENDOR OR CITIZEN)
                -------------------------------------------------------------- */}
            <div>
              <label
                htmlFor="utype"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
              >
                User Type <span className="text-rose-500">*</span>
              </label>

              <div className="relative">
                {/* Users Icon */}
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>

                <select
                  id="utype"
                  name="utype"
                  value={formData.utype}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm text-gray-800 bg-white transition focus:outline-none appearance-none cursor-pointer ${validations.utype
                      ? validations.utype.isValid
                        ? "border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                        : "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-200"
                      : "border-gray-200 hover:border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    }`}
                >
                  <option value="" disabled>
                    -- Select User Type --
                  </option>
                  <option value="Citizen">Citizen</option>
                  <option value="Vendor">Vendor</option>
                </select>

                {/* Dropdown Chevron */}
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Runtime validation feedback for User Type */}
              {validations.utype && (
                <span
                  className={`text-xs font-semibold block mt-1 ${validations.utype.isValid ? "text-emerald-600" : "text-rose-600"
                    }`}
                >
                  {validations.utype.message}
                </span>
              )}
            </div>

            {/* Note about status column */}
            <p className="text-[11px] text-gray-400">
              User will be registered with active status (<span className="font-mono text-orange-600 font-semibold">status: 1</span>).
            </p>

            {/* --------------------------------------------------------------
                4. SIGNUP BUTTON
                -------------------------------------------------------------- */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 py-3.5 px-6 rounded-xl font-bold text-sm text-white tracking-wide shadow-lg transition duration-200 cursor-pointer flex items-center justify-center gap-2 ${loading
                  ? "bg-orange-300 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 active:scale-[0.99]"
                }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Signing up...</span>
                </>
              ) : (
                <span>Sign Up</span>
              )}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
