import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

// ============================================================================
// 1. DATA INTERFACES
// ============================================================================
interface LoginState {
  emailid: string;
  password: string;
}

interface FormErrors {
  emailid?: string;
  password?: string;
  general?: string;
}

interface LoggedInUser {
  emailid: string;
  utype: 'Citizen' | 'Vendor' | 'Admin' | string;
}

// ============================================================================
// 2. MAIN LOGIN COMPONENT (UTSAV THEME)
// ============================================================================
export default function Login() {
  const navigate = useNavigate();

  const initial_obj: LoginState = {
    emailid: '',
    password: '',
  };

  // Login form states
  const [obj, setObj] = useState<LoginState>(initial_obj);
  const [errors, setErrors] = useState<FormErrors>({});
  const [emailStatus, setEmailStatus] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // --- FORGOT PASSWORD STATES (Simple 2-Step Flow) ---
  const [isForgotMode, setIsForgotMode] = useState<boolean>(false);
  const [forgotStep, setForgotStep] = useState<number>(1); // 1 = Email, 2 = OTP + New Password
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [forgotMessage, setForgotMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Email format regex validation
  function isValidEmail(email: string): boolean {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email.trim());
  }

  // Handle live input typing & validation
  function doUpdateObj(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    if (name === 'emailid') {
      if (value.trim() === '') {
        setEmailStatus('');
      } else if (isValidEmail(value)) {
        setEmailStatus('Valid Email');
      } else {
        setEmailStatus('Invalid Email Format');
      }
    }

    setErrors((prev) => ({
      ...prev,
      [name]: '',
      general: '',
    }));

    setObj((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // Validate fields before submitting login
  function validateForm(): boolean {
    const err: FormErrors = {};

    const trimmedEmail = obj.emailid.trim();
    if (!trimmedEmail) {
      err.emailid = 'Email ID is required.';
    } else if (!isValidEmail(trimmedEmail)) {
      err.emailid = 'Please enter a valid email address (e.g., user@example.com).';
    }

    if (!obj.password) {
      err.password = 'Password is required.';
    } else if (obj.password.length < 6) {
      err.password = 'Password must be at least 6 characters.';
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  }

  // Route user based on role
  function redirectToDashboard(utype: string) {
    const role = utype?.trim().toLowerCase();
    switch (role) {
      case 'admin':
        navigate('/admindash');
        break;
      case 'vendor':
        navigate('/vendordash');
        break;
      case 'citizen':
        navigate('/citizendash');
        break;
      default:
        navigate('/');
        break;
    }
  }

  // ----------------------------------------------------
  // LOGIN SUBMIT HANDLER
  // ----------------------------------------------------
  async function doLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setErrors({});

      const url = 'http://localhost:2004/login/loginUser';
      const cleanEmail = obj.emailid.trim().toLowerCase();
      const payload = {
        emailid: cleanEmail,
        password: obj.password,
      };

      const resp = await axios.post(url, payload);

      if (resp.data.status === true) {
        const receivedUser: LoggedInUser = {
          emailid: resp.data.emailid || cleanEmail,
          utype: resp.data.utype,
        };

        if (resp.data.token) {
          localStorage.setItem('token', resp.data.token);
        }
        localStorage.setItem('utsav_user', JSON.stringify(receivedUser));
        localStorage.setItem('email', receivedUser.emailid);
        localStorage.setItem('citizenEmail', receivedUser.emailid);

        alert('Welcome to UTSAV!');

        setObj(initial_obj);
        setEmailStatus('');
        setErrors({});

        redirectToDashboard(receivedUser.utype);
      } else {
        setErrors({ general: resp.data.msg || 'Invalid Email or Password!' });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const serverMsg = error.response?.data?.msg || 'Error connecting to server. Please try again!';
      setErrors({ general: serverMsg });
    } finally {
      setLoading(false);
    }
  }

  // ----------------------------------------------------
  // FORGOT PASSWORD: STEP 1 - SEND OTP
  // ----------------------------------------------------
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    const targetEmail = forgotEmail || obj.emailid;

    if (!targetEmail || !isValidEmail(targetEmail)) {
      setForgotMessage({
        text: 'Please enter a valid registered email address.',
        isError: true,
      });
      return;
    }

    try {
      setLoading(true);
      setForgotMessage(null);

      const resp = await axios.post('http://localhost:2004/login/forgot-password', {
        emailid: targetEmail.trim().toLowerCase(),
      });

      if (resp.data.status === true) {
        setForgotMessage({ text: resp.data.msg || 'OTP sent successfully!', isError: false });
        setForgotStep(2); // Move to Step 2 (Enter OTP + New Password)
      } else {
        setForgotMessage({ text: resp.data.msg || 'Email not found', isError: true });
      }
    } catch (error: any) {
      setForgotMessage({
        text: error.response?.data?.msg || 'Failed to send OTP. Please check backend connection.',
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  }

  // ----------------------------------------------------
  // FORGOT PASSWORD: STEP 2 - VERIFY OTP & RESET PASSWORD
  // ----------------------------------------------------
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();

    if (!otp || otp.trim().length !== 6) {
      setForgotMessage({ text: 'Please enter the 6-digit OTP code sent to your email.', isError: true });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setForgotMessage({ text: 'New password must be at least 6 characters long.', isError: true });
      return;
    }

    try {
      setLoading(true);
      setForgotMessage(null);

      const targetEmail = (forgotEmail || obj.emailid).trim().toLowerCase();
      const resp = await axios.post('http://localhost:2004/login/reset-password', {
        emailid: targetEmail,
        otp: otp.trim(),
        newPassword: newPassword,
      });

      if (resp.data.status === true) {
        alert(resp.data.msg || 'Password updated successfully! Please sign in.');

        // Pre-fill email in login input and return to Login view
        setObj({
          emailid: targetEmail,
          password: '',
        });
        setIsForgotMode(false);
        setForgotStep(1);
        setForgotEmail('');
        setOtp('');
        setNewPassword('');
        setForgotMessage(null);
      } else {
        setForgotMessage({ text: resp.data.msg || 'Failed to reset password.', isError: true });
      }
    } catch (error: any) {
      setForgotMessage({
        text: error.response?.data?.msg || 'Failed to reset password. Please try again.',
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  }

  // ============================================================================
  // 3. UI RENDER (Theme: UTSAV Warm Aesthetics)
  // ============================================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 text-gray-900 flex flex-col font-sans">

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-orange-100 overflow-hidden grid grid-cols-1 md:grid-cols-2">

          {/* LEFT SIDE: UTSAV BRANDING & ROUND PHOTO */}
          <div className="relative bg-gradient-to-br from-amber-100/80 via-orange-100/60 to-amber-50/90 p-8 sm:p-10 flex flex-col justify-between min-h-[380px] md:min-h-[500px] border-b md:border-b-0 md:border-r border-orange-100/70 overflow-hidden">
            <div className="absolute -top-16 -left-16 w-56 h-56 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-rose-400/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <span className="text-xs uppercase tracking-widest text-orange-600 font-bold block">
                Welcome to UTSAV
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl text-gray-900 mt-2 font-black leading-tight">
                Crafting memorable moments together.
              </h1>
            </div>

            {/* Cozy Round Photo */}
            <div className="relative z-10 my-auto flex justify-center py-4">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 rounded-full blur-md opacity-40 group-hover:opacity-70 transition duration-500" />
                <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden border-4 border-white shadow-xl ring-4 ring-orange-200/70 bg-amber-50">
                  <img
                    src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80"
                    alt="UTSAV Festive Celebration"
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 via-transparent to-transparent flex items-end justify-center pb-3">
                    <span className="text-white text-[11px] tracking-widest uppercase font-mono bg-orange-600/80 px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
                      utsav.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="relative z-10 text-xs text-gray-600 text-center font-normal tracking-wide">
              Seamless event management for Citizens, Vendors, and Admins.
            </p>
          </div>

          {/* RIGHT SIDE: LOGIN OR FORGOT PASSWORD */}
          <div className="p-8 sm:p-10 flex flex-col justify-center bg-white">

            {/* VIEW 1: SIGN IN FORM */}
            {!isForgotMode ? (
              <>
                <div className="mb-6">
                  <h2 className="font-serif text-3xl font-black text-gray-900 tracking-tight">Sign In</h2>
                  <p className="text-sm text-gray-500 mt-1 font-normal">
                    Enter your credentials to access your UTSAV portal
                  </p>
                </div>

                {errors.general && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                    ⚠️ {errors.general}
                  </div>
                )}

                <form onSubmit={doLogin} className="space-y-4" noValidate>
                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="emailid"
                      value={obj.emailid}
                      onChange={doUpdateObj}
                      placeholder="name@example.com"
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all duration-200 ${
                        errors.emailid
                          ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-200'
                          : 'border-gray-200 bg-gray-50/40 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100'
                      }`}
                    />

                    {emailStatus && !errors.emailid && (
                      <p
                        className={`text-xs font-medium mt-1.5 flex items-center gap-1 ${
                          emailStatus === 'Valid Email' ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        <span>●</span> {emailStatus}
                      </p>
                    )}

                    {errors.emailid && (
                      <p className="text-xs text-rose-600 font-semibold mt-1.5">{errors.emailid}</p>
                    )}
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotMode(true);
                          setForgotStep(1);
                          setForgotEmail(obj.emailid);
                          setForgotMessage(null);
                        }}
                        className="text-xs text-orange-600 hover:text-orange-700 hover:underline font-semibold cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={obj.password}
                        onChange={doUpdateObj}
                        placeholder="••••••••"
                        className={`w-full px-4 py-3 pr-14 rounded-xl border text-sm outline-none transition-all duration-200 ${
                          errors.password
                            ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-200'
                            : 'border-gray-200 bg-gray-50/40 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-orange-600 transition cursor-pointer"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>

                    {errors.password && (
                      <p className="text-xs text-rose-600 font-semibold mt-1.5">{errors.password}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 text-white font-bold text-sm tracking-wide rounded-full shadow-md hover:shadow-lg transition-all duration-300 ease-in-out cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                  </div>

                  <p className="text-center text-xs text-gray-500 pt-2">
                    Don't have an account?{' '}
                    <Link to="/signup" className="font-bold text-orange-600 hover:underline">
                      Create one
                    </Link>
                  </p>
                </form>
              </>
            ) : (
              /* VIEW 2: FORGOT PASSWORD (STEP 1 & STEP 2) */
              <>
                <div className="mb-6">
                  <h2 className="font-serif text-2xl font-black text-gray-900 tracking-tight">Reset Password</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {forgotStep === 1
                      ? 'Enter your registered email to receive a 6-digit verification code.'
                      : 'Enter the 6-digit OTP code sent to your email and your new password.'}
                  </p>
                </div>

                {forgotMessage && (
                  <div
                    className={`mb-4 p-3 rounded-xl border text-xs font-semibold ${
                      forgotMessage.isError
                        ? 'bg-rose-50 border-rose-200 text-rose-700'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    }`}
                  >
                    {forgotMessage.isError ? '⚠️ ' : '✅ '} {forgotMessage.text}
                  </div>
                )}

                {/* STEP 1: ENTER EMAIL & SEND OTP */}
                {forgotStep === 1 ? (
                  <form onSubmit={handleSendOtp} className="space-y-4" noValidate>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        Registered Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => {
                          setForgotEmail(e.target.value);
                          setForgotMessage(null);
                        }}
                        placeholder="name@example.com"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/40 text-sm outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm tracking-wide rounded-full shadow-md transition-all duration-300 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? 'Sending OTP...' : 'Send Verification OTP'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotMode(false);
                        setForgotMessage(null);
                      }}
                      className="w-full py-2 text-xs font-bold text-gray-500 hover:text-orange-600 transition-colors cursor-pointer"
                    >
                      ← Back to Sign In
                    </button>
                  </form>
                ) : (
                  /* STEP 2: ENTER OTP & NEW PASSWORD TOGETHER */
                  <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        6-Digit OTP Code <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => {
                          setOtp(e.target.value.replace(/\D/g, '')); // numbers only
                          setForgotMessage(null);
                        }}
                        placeholder="123456"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/40 text-base text-center tracking-widest font-mono outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        New Password (Min 6 chars) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            setForgotMessage(null);
                          }}
                          placeholder="••••••••"
                          required
                          className="w-full px-4 py-3 pr-14 rounded-xl border border-gray-200 bg-gray-50/40 text-sm outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-orange-600 transition cursor-pointer"
                        >
                          {showNewPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 text-white font-bold text-sm tracking-wide rounded-full shadow-md transition-all duration-300 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? 'Resetting Password...' : 'Reset & Save Password'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setForgotStep(1);
                        setOtp('');
                        setNewPassword('');
                        setForgotMessage(null);
                      }}
                      className="w-full py-2 text-xs font-bold text-gray-500 hover:text-orange-600 transition-colors cursor-pointer"
                    >
                      Change Email Address
                    </button>
                  </form>
                )}
              </>
            )}

          </div>

        </div>
      </main>

    </div>
  );
}