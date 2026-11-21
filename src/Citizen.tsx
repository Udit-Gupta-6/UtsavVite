import React, { useState, useEffect } from 'react';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;
// ----------------------------------------------------
// 1. Interfaces
// ----------------------------------------------------

export interface CitizenFormState {
  emailid: string;      // Citizen email address (read-only, loaded from session)
  acardno: string;      // Aadhaar Card Number (read-only, auto-filled by GenAI)
  name: string;         // Citizen Full Name (read-only, auto-filled by GenAI)
  dob: string;          // Date of Birth (read-only, auto-filled by GenAI)
  gender: string;       // Gender (read-only, auto-filled by GenAI)
  address: string;      // Residential Address (read-only, auto-filled by GenAI)
  city: string;         // City (read-only, auto-filled by GenAI)
  contact: string;      // 10-digit mobile number (editable)
  frontpic: File | null; // Front side of Aadhaar card
  backpic: File | null;  // Back side of Aadhaar card
}

export interface ValidationStatus {
  isValid: boolean;
  message: string;
}

export interface GenAiAadhaarData {
  acardno?: string;
  name?: string;
  dob?: string;
  gender?: string;
  address?: string;
  city?: string;
}

export interface CitizenRegistrationProps {
  userEmail?: string;
}

function CitizenRegistration({ userEmail }: CitizenRegistrationProps) {
  // Helper to get logged-in email from prop or localStorage
  const getLoggedInEmail = (): string => {
    if (userEmail && userEmail.trim() !== '') return userEmail.trim();
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('email') ||
        localStorage.getItem('userEmail') ||
        ''
      );
    }
    return '';
  };

  // ----------------------------------------------------
  // 2. Initial States
  // ----------------------------------------------------
  const initial_obj: CitizenFormState = {
    emailid: getLoggedInEmail(),
    acardno: '',
    name: '',
    dob: '',
    gender: '',
    address: '',
    city: '',
    contact: '',
    frontpic: null,
    backpic: null,
  };

  const [obj, setObj] = useState<CitizenFormState>(initial_obj);
  const [frontPicPrev, setFrontPicPrev] = useState<string>('');
  const [backPicPrev, setBackPicPrev] = useState<string>('');
  const [isAiScanning, setIsAiScanning] = useState<boolean>(false);
  const [aiStatusMsg, setAiStatusMsg] = useState<string>('');
  const [validations, setValidations] = useState<{ [key: string]: ValidationStatus }>({});

  // ----------------------------------------------------
  // 3. Validation Helper Function (Contact regex & Email format)
  // ----------------------------------------------------
  function validateField(name: string, value: string): ValidationStatus {
    if (!value || value.trim() === '') {
      return { isValid: false, message: 'This field is required' };
    }

    if (name === 'emailid') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value)
        ? { isValid: true, message: 'Verified Account Email ✓' }
        : { isValid: false, message: 'Invalid Email format' };
    }

    if (name === 'contact') {
      const phoneRegex = /^[6-9]\d{9}$/;
      return phoneRegex.test(value)
        ? { isValid: true, message: 'Valid 10-digit Contact ✓' }
        : { isValid: false, message: 'Invalid Contact: must be 10 digits starting with 6-9' };
    }

    return { isValid: true, message: 'Valid ✓' };
  }

  // ----------------------------------------------------
  // 4. Load Logged-in Email on Mount & Auto-Fetch Record
  // ----------------------------------------------------
  useEffect(() => {
    const activeEmail = getLoggedInEmail();
    if (activeEmail) {
      setObj((prev) => ({
        ...prev,
        emailid: activeEmail,
      }));
      setValidations((prev) => ({
        ...prev,
        emailid: validateField('emailid', activeEmail),
      }));

      // Automatically fetch existing citizen record quietly on load
      autoFetchCitizen(activeEmail);
    }
  }, [userEmail]);

  // ----------------------------------------------------
  // 5. Input Change Handler (Only allows modifying contact)
  // ----------------------------------------------------
  function doUpdateObj(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    // Prevent any changes to emailid
    if (name === 'emailid') return;

    setObj((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'contact') {
      const valResult = validateField(name, value);
      setValidations((prev) => ({
        ...prev,
        [name]: valResult,
      }));
    }
  }

  // ----------------------------------------------------
  // 6. GenAI Backend OCR Processor
  // ----------------------------------------------------
  async function triggerGenAiOcr(frontFile: File | null, backFile: File | null) {
    if (!frontFile && !backFile) return;

    setIsAiScanning(true);
    setAiStatusMsg('GenAI is analyzing Aadhaar card image(s) to extract details...');

    // const ocrUrl = 'http://localhost:2004/citizen/ocr-aadhaar';
    const ocrFormData = new FormData();

    if (frontFile) ocrFormData.append('frontpic', frontFile);
    if (backFile) ocrFormData.append('backpic', backFile);

    try {
      const resp = await axios.post(`${API_URL}/citizen/ocr-aadhaar`, ocrFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (resp.data.status === true && resp.data.extracted) {
        const extracted: GenAiAadhaarData = resp.data.extracted;
        setObj((prev) => ({
          ...prev,
          acardno: extracted.acardno || prev.acardno,
          name: extracted.name || prev.name,
          dob: extracted.dob || prev.dob,
          gender: extracted.gender || prev.gender,
          address: extracted.address || prev.address,
          city: extracted.city || prev.city,
        }));
        setAiStatusMsg('Aadhaar data successfully extracted and auto-filled by GenAI ✓');
      } else {
        setAiStatusMsg(resp.data.msg || 'Aadhaar processed. Verify details below.');
      }
    } catch (error) {
      console.error('GenAI OCR Error:', error);

      setAiStatusMsg(
        'Unable to extract Aadhaar details. Please upload your Aadhaar images again.'
      );
    } finally {
      setIsAiScanning(false);
    }
  }

  // Aadhaar Front & Back Upload Handlers
  function doShowFrontPic(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setObj((prev) => ({ ...prev, frontpic: file }));
      setFrontPicPrev(URL.createObjectURL(file));
      triggerGenAiOcr(file, obj.backpic);
    }
  }

  function doShowBackPic(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setObj((prev) => ({ ...prev, backpic: file }));
      setBackPicPrev(URL.createObjectURL(file));
      triggerGenAiOcr(obj.frontpic, file);
    }
  }

  // ----------------------------------------------------
  // 7. Server Actions: Fetch, Save, Modify (Locked to Logged-in Email)
  // ----------------------------------------------------

  // Internal silent fetch on component mount
  async function autoFetchCitizen(email: string) {
    if (!email) return;
    try {
      const resp = await axios.post(
        'http://localhost:2004/citizen/fetch',
        { emailid: email },
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      if (resp.data.status === true && resp.data.msg) {
        const data = resp.data.msg;
        setObj((prev) => ({
          ...prev,
          emailid: email, // Always preserve logged-in email
          acardno: data.acardno || '',
          name: data.name || '',
          dob: data.dob || '',
          gender: data.gender || '',
          address: data.address || '',
          city: data.city || '',
          contact: data.contact || '',
        }));
      }
    } catch (e) {
      // Quietly ignore network failures on initial mount
    }
  }

  // A. FETCH RECORD (Explicit button click)
  async function doFetchObj() {
    const currentEmail = obj.emailid || getLoggedInEmail();

    if (!currentEmail) {
      alert('No logged-in user email found in session. Please log in first.');
      return;
    }

    const url = 'http://localhost:2004/citizen/fetch';
    try {
      const resp = await axios.post(
        url,
        { emailid: currentEmail },
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      if (resp.data.status === true) {
        const data = resp.data.msg;
        setObj({
          emailid: currentEmail, // Strictly enforce logged-in email
          acardno: data.acardno || '',
          name: data.name || '',
          dob: data.dob || '',
          gender: data.gender || '',
          address: data.address || '',
          city: data.city || '',
          contact: data.contact || '',
          frontpic: null,
          backpic: null,
        });

        setFrontPicPrev('');
        setBackPicPrev('');
        alert('Citizen record fetched successfully!');
      } else {
        alert('No registered record found for this account. Please upload details to register.');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Error fetching citizen record from server');
    }
  }

  // B. UPLOAD DATA (Save New Record)
  async function doSaveObj(event: React.FormEvent) {
    event.preventDefault();

    const currentEmail = obj.emailid || getLoggedInEmail();
    if (!currentEmail) {
      alert('Logged-in email session is missing. Please sign in again.');
      return;
    }

    if (!obj.contact) {
      alert('Please fill mandatory contact number.');
      return;
    }

    const contactCheck = validateField('contact', obj.contact);
    if (!contactCheck.isValid) {
      alert(contactCheck.message);
      return;
    }

    if (!obj.acardno || !obj.name) {
      const proceed = window.confirm(
        'Aadhaar details appear empty. Have you uploaded the Aadhaar card for GenAI auto-fill? Click OK to proceed anyway, or Cancel to upload.'
      );
      if (!proceed) return;
    }

    const url = 'http://localhost:2004/citizen/save';
    const citizenPayload = {
      emailid: currentEmail, // strictly logged-in citizen email
      acardno: obj.acardno,
      name: obj.name,
      dob: obj.dob,
      gender: obj.gender,
      address: obj.address,
      city: obj.city,
      contact: obj.contact,
    };

    let token = localStorage.getItem("token")
    try {
      const resp = await axios.post(url, citizenPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Citizen Data Uploaded Successfully: ' + JSON.stringify(resp.data));
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading citizen data');
    }
  }

  // C. MODIFY RECORD (Update Existing Record)
  async function doModifyObj() {
    const currentEmail = obj.emailid || getLoggedInEmail();
    if (!currentEmail) {
      alert('Logged-in Email is required to modify citizen details');
      return;
    }

    const contactCheck = validateField('contact', obj.contact);
    if (!contactCheck.isValid) {
      alert(contactCheck.message);
      return;
    }

    const url = 'http://localhost:2004/citizen/update';
    const citizenPayload = {
      emailid: currentEmail, // strictly logged-in citizen email
      acardno: obj.acardno,
      name: obj.name,
      dob: obj.dob,
      gender: obj.gender,
      address: obj.address,
      city: obj.city,
      contact: obj.contact,
    };

    try {
      const resp = await axios.post(url, citizenPayload);
      alert('Citizen Details Modified Successfully: ' + JSON.stringify(resp.data));
    } catch (error) {
      console.error('Modify error:', error);
      alert('Error modifying citizen record');
    }
  }

  // ----------------------------------------------------
  // 8. UI Template
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-orange-200 overflow-hidden">



        {/* Sub Header */}
        <div className="text-center py-3 bg-orange-100/60 border-b border-orange-200">
          <h2 className="text-2xl font-bold text-rose-700 tracking-wide">
            Citizen Registration
          </h2>
        </div>

        {/* Form Body */}
        <form onSubmit={doSaveObj} className="p-6 md:p-8 space-y-6">

          {/* Top Section: READ-ONLY Email Id Linked to Session & Fetch Button */}
          <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              <div className="md:col-span-9">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-semibold text-rose-800">
                    Email Id <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                    <svg className="w-3 h-3 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Locked to Logged-in Citizen (Read-Only)
                  </span>
                </div>

                <input
                  type="email"
                  name="emailid"
                  value={obj.emailid}
                  readOnly
                  placeholder="Loading logged-in email..."
                  className="w-full rounded-lg border border-orange-300 bg-amber-50/60 px-3 py-2 text-sm text-slate-800 font-medium outline-none cursor-not-allowed shadow-inner tracking-wide"
                />

                {validations.emailid ? (
                  <span
                    className={`text-xs font-semibold block mt-1 ${validations.emailid.isValid ? 'text-green-600' : 'text-red-600'
                      }`}
                  >
                    {validations.emailid.message}
                  </span>
                ) : (
                  <span className="text-[11px] text-gray-500 block mt-1">
                    This email is bound to your account and cannot be modified.
                  </span>
                )}
              </div>

              <div className="md:col-span-3 md:mt-6">
                <button
                  type="button"
                  onClick={doFetchObj}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Fetch Record</span>
                </button>
              </div>
            </div>
          </div>

          {/* GenAI Progress / Notification Banner */}
          {(isAiScanning || aiStatusMsg) && (
            <div className={`p-3 rounded-lg border flex items-center gap-2.5 text-xs font-medium transition ${isAiScanning
              ? 'bg-amber-50 border-amber-300 text-amber-800 animate-pulse'
              : 'bg-emerald-50 border-emerald-300 text-emerald-800'
              }`}>
              {isAiScanning ? (
                <svg className="animate-spin h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <span className="text-emerald-600 font-bold">✨</span>
              )}
              <span>{isAiScanning ? 'Processing Aadhaar card with GenAI...' : aiStatusMsg}</span>
            </div>
          )}

          {/* Main Content Grid: 2 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

            {/* LEFT COLUMN: Upload Aadhaar Card (Front & Back) */}
            <div className="md:col-span-5 bg-orange-50/40 p-4 rounded-xl border border-orange-200 space-y-4">
              <div className="border-b border-orange-200 pb-2">
                <h3 className="text-base font-bold text-rose-800 flex items-center gap-1.5">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Upload Aadhaar Card</span>
                </h3>
                <p className="text-xs text-orange-700/80 mt-0.5">
                  AI will read details automatically from card
                </p>
              </div>

              {/* Front Side */}
              <div className="space-y-2 bg-white p-3 rounded-lg border border-orange-200 shadow-sm">
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">
                  Front Side
                </span>
                <div className="w-full h-36 border-2 border-dashed border-orange-300 rounded-lg flex items-center justify-center overflow-hidden bg-orange-50/50 relative">
                  {frontPicPrev ? (
                    <img src={frontPicPrev} alt="Front Preview" className="w-full h-full object-contain p-1" />
                  ) : (
                    <div className="text-center p-3 text-orange-400">
                      <svg className="w-8 h-8 mx-auto mb-1 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                      <span className="text-xs font-medium">Front Side Preview</span>
                    </div>
                  )}
                </div>
                <label className="block w-full text-center cursor-pointer bg-orange-100 hover:bg-orange-200 text-rose-800 text-xs font-semibold py-2 px-3 rounded-md border border-orange-300 transition duration-150">
                  <span>Choose Front Side</span>
                  <input type="file" name="frontpic" accept="image/*" onChange={doShowFrontPic} className="hidden" />
                </label>
              </div>

              {/* Back Side */}
              <div className="space-y-2 bg-white p-3 rounded-lg border border-orange-200 shadow-sm">
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">
                  Back Side
                </span>
                <div className="w-full h-36 border-2 border-dashed border-orange-300 rounded-lg flex items-center justify-center overflow-hidden bg-orange-50/50 relative">
                  {backPicPrev ? (
                    <img src={backPicPrev} alt="Back Preview" className="w-full h-full object-contain p-1" />
                  ) : (
                    <div className="text-center p-3 text-orange-400">
                      <svg className="w-8 h-8 mx-auto mb-1 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-xs font-medium">Back Side Preview</span>
                    </div>
                  )}
                </div>
                <label className="block w-full text-center cursor-pointer bg-orange-100 hover:bg-orange-200 text-rose-800 text-xs font-semibold py-2 px-3 rounded-md border border-orange-300 transition duration-150">
                  <span>Choose Back Side</span>
                  <input type="file" name="backpic" accept="image/*" onChange={doShowBackPic} className="hidden" />
                </label>
              </div>

            </div>

            {/* RIGHT COLUMN: Auto-filled Details & Contact Details */}
            <div className="md:col-span-7 space-y-5">

              {/* Aadhaar Identity Details */}
              <div className="bg-orange-50/30 p-4 rounded-xl border border-orange-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-orange-200 pb-2">
                  <h3 className="text-sm font-bold text-rose-800">
                    Aadhaar Identity Details
                  </h3>
                  <span className="text-[11px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full border border-amber-300">
                    🔒 GenAI Auto-filled (Read Only)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-rose-800 mb-1">
                    Aadhaar Card Number
                  </label>
                  <input
                    type="text"
                    name="acardno"
                    value={obj.acardno}
                    readOnly
                    placeholder="XXXX XXXX XXXX (Auto-filled by GenAI)"
                    className="w-full rounded-lg border border-orange-300 bg-amber-50/60 px-3 py-2 text-sm text-slate-800 font-mono font-medium outline-none cursor-not-allowed tracking-wider shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-7">
                    <label className="block text-xs font-bold text-rose-800 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={obj.name}
                      readOnly
                      placeholder="Full Name (Auto-filled)"
                      className="w-full rounded-lg border border-orange-300 bg-amber-50/60 px-3 py-2 text-sm text-slate-800 font-medium outline-none cursor-not-allowed shadow-inner"
                    />
                  </div>

                  <div className="sm:col-span-5">
                    <label className="block text-xs font-bold text-rose-800 mb-1">
                      DOB
                    </label>
                    <input
                      type="text"
                      name="dob"
                      value={obj.dob}
                      readOnly
                      placeholder="DD/MM/YYYY"
                      className="w-full rounded-lg border border-orange-300 bg-amber-50/60 px-3 py-2 text-sm text-slate-800 font-medium outline-none cursor-not-allowed shadow-inner"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-rose-800 mb-1">
                    Gender
                  </label>
                  <input
                    type="text"
                    name="gender"
                    value={obj.gender}
                    readOnly
                    placeholder="Male / Female / Other"
                    className="w-full rounded-lg border border-orange-300 bg-amber-50/60 px-3 py-2 text-sm text-slate-800 font-medium outline-none cursor-not-allowed shadow-inner"
                  />
                </div>
              </div>

              {/* Address & Contact Details */}
              <div className="bg-orange-50/30 p-4 rounded-xl border border-orange-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-orange-200 pb-2">
                  <h3 className="text-sm font-bold text-rose-800">
                    Address & Contact Details
                  </h3>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-rose-800">
                      Address
                    </label>
                    <span className="text-[10px] text-amber-700 font-medium">
                      🔒 Read-only (GenAI)
                    </span>
                  </div>
                  <input
                    type="text"
                    name="address"
                    value={obj.address}
                    readOnly
                    placeholder="Residential Address from Aadhaar"
                    className="w-full rounded-lg border border-orange-300 bg-amber-50/60 px-3 py-2 text-sm text-slate-800 font-medium outline-none cursor-not-allowed shadow-inner"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-rose-800">
                      City
                    </label>
                    <span className="text-[10px] text-amber-700 font-medium">
                      🔒 Read-only (GenAI)
                    </span>
                  </div>
                  <input
                    type="text"
                    name="city"
                    value={obj.city}
                    readOnly
                    placeholder="City from Aadhaar"
                    className="w-full rounded-lg border border-orange-300 bg-amber-50/60 px-3 py-2 text-sm text-slate-800 font-medium outline-none cursor-not-allowed shadow-inner"
                  />
                </div>

                {/* Contact Number (Editable) */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-rose-800">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-emerald-700 font-semibold">
                      ✏️ Editable
                    </span>
                  </div>
                  <input
                    type="text"
                    name="contact"
                    value={obj.contact}
                    onChange={doUpdateObj}
                    placeholder="10-digit mobile number (e.g., 9876543210)"
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition ${validations.contact
                      ? validations.contact.isValid
                        ? 'border-green-500 bg-green-50/20 focus:ring-2 focus:ring-green-400'
                        : 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-400'
                      : 'border-orange-300 focus:ring-2 focus:ring-orange-400'
                      }`}
                  />
                  {validations.contact && (
                    <span
                      className={`text-xs font-semibold block mt-1 ${validations.contact.isValid ? 'text-green-600' : 'text-red-600'
                        }`}
                    >
                      {validations.contact.message}
                    </span>
                  )}
                </div>

              </div>

            </div>

          </div>

          {/* Action Buttons: Upload Data & Modify */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-4 border-t border-orange-200">
            <button
              type="submit"
              className="w-full sm:w-48 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-lg hover:shadow-orange-300/50 transition duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Upload Data</span>
            </button>

            <button
              type="button"
              onClick={doModifyObj}
              className="w-full sm:w-48 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-lg hover:shadow-teal-300/50 transition duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Modify</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default CitizenRegistration;