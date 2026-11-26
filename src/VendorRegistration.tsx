import React, { useState, useEffect } from 'react';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

// ====================================================
// 1. Interfaces
// ====================================================

// Interface matching the backend vendor collection
interface VendorFormState {
  emailid: string;
  name: string;
  contact: string;
  business: string;
  area: string;
  address: string;
  city: string;
  estd: string;
  selcate: string;
  website: string;
  insta: string;
  shoppic: File | null;
  certpic: File | null;
}

// Interface for Category Combo Box items
interface CategoryItem {
  id: number;
  name: string;
}

// Interface for field validation status
interface ValidationStatus {
  isValid: boolean;
  message: string;
}

export interface VendorRegistrationProps {
  userEmail?: string;
}

function VendorRegistration({ userEmail }: VendorRegistrationProps) {
  // ====================================================
  // 2. Initial State & Hooks
  // ====================================================
  const initial_obj: VendorFormState = {
    emailid: '',
    name: '',
    contact: '',
    business: '',
    area: '',
    address: '',
    city: '',
    estd: '',
    selcate: '',
    website: '',
    insta: '',
    shoppic: null,
    certpic: null,
  };

  const [obj, setObj] = useState<VendorFormState>(initial_obj);

  // Preview URLs for images
  const [shoppicPrev, setShoppicPrev] = useState<string>('');
  const [certpicPrev, setCertpicPrev] = useState<string>('');

  // States for the Custom Combo Box
  const [isComboOpen, setIsComboOpen] = useState<boolean>(false);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);

  // State to track validation message for each field
  const [validations, setValidations] = useState<{ [key: string]: ValidationStatus }>({});

  // Loading indicator for runtime auto-fetching
  const [isAutoFetching, setIsAutoFetching] = useState<boolean>(false);

  // ====================================================
  // 3. Category List (All 16 Categories)
  // ====================================================
  const categoryList: CategoryItem[] = [
    { id: 1, name: 'Decoration' },
    { id: 2, name: 'Photography' },
    { id: 3, name: 'Catering' },
    { id: 4, name: 'DJ & Sound' },
    { id: 5, name: 'Mehndi Artist' },
    { id: 6, name: 'Bridal Makeup' },
    { id: 7, name: 'Wedding Planner' },
    { id: 8, name: 'Cake' },
    { id: 9, name: 'Lighting' },
    { id: 10, name: 'Tent House' },
    { id: 11, name: 'Invitation Cards' },
    { id: 12, name: 'Wedding Cake' },
    { id: 13, name: 'Sweets' },
    { id: 14, name: 'Bhangra Group' },
    { id: 15, name: 'Cleaning' },
    { id: 16, name: 'Security' },
  ];

  // ====================================================
  // 4. Auto-Fetch Function & Runtime Lifecycle (useEffect)
  // ====================================================
  async function fetchVendorDetails(emailToFetch: string) {
    if (!emailToFetch) return;

    setIsAutoFetching(true);
    try {
      // const url = 'http://localhost:2004/vendor/fetch-vendor';
      const resp = await axios.post(
        `${API_URL}/vendor/fetch-vendor`,
        { emailid: emailToFetch },
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      if (resp.data.status === true && resp.data.msg) {
        const vendorData = resp.data.msg;

        setObj({
          emailid: vendorData.emailid || emailToFetch,
          name: vendorData.name || '',
          contact: vendorData.contact || '',
          business: vendorData.business || '',
          area: vendorData.area || '',
          address: vendorData.address || '',
          city: vendorData.city || '',
          estd: vendorData.estd || '',
          selcate: vendorData.selcate || '',
          website: vendorData.website || '',
          insta: vendorData.insta || '',
          shoppic: null,
          certpic: null,
        });

        // Parse categories if present
        if (vendorData.selcate) {
          const catArray = vendorData.selcate
            .split(',')
            .map((c: string) => c.trim())
            .filter(Boolean);
          setSelectedCats(catArray);
        }

        // Preview saved images if available from server
        if (vendorData.shoppicurl) setShoppicPrev(vendorData.shoppicurl);
        if (vendorData.certpicurl) setCertpicPrev(vendorData.certpicurl);
      }
    } catch (error) {
      console.log('No prior vendor record found or fetch error:', error);
    } finally {
      setIsAutoFetching(false);
    }
  }

  // Auto-fill email from localStorage and fetch data on runtime
  useEffect(() => {
    const savedEmail =
      userEmail ||
      localStorage.getItem('email') ||
      localStorage.getItem('userEmail') ||
      '';

    if (savedEmail) {
      setObj((prev) => ({
        ...prev,
        emailid: savedEmail,
      }));

      // Automatically fetch vendor record if already registered
      fetchVendorDetails(savedEmail);
    }
  }, [userEmail]);

  // ====================================================
  // 5. Live Validation Function
  // ====================================================
  function validateField(name: string, value: string): ValidationStatus {
    if (!value || value.trim() === '') {
      return { isValid: false, message: 'This field is required' };
    }

    if (name === 'contact') {
      const phoneRegex = /^[6-9]\d{9}$/;
      return phoneRegex.test(value)
        ? { isValid: true, message: 'Valid 10-digit Contact ✓' }
        : { isValid: false, message: 'Invalid Contact: must be 10 digits (6-9)' };
    }

    if (name === 'name') {
      return value.trim().length >= 3
        ? { isValid: true, message: 'Valid Name ✓' }
        : { isValid: false, message: 'Invalid: Name must be at least 3 letters' };
    }

    if (name === 'business') {
      return value.trim().length >= 2
        ? { isValid: true, message: 'Valid Business Name ✓' }
        : { isValid: false, message: 'Invalid: Business name too short' };
    }

    if (name === 'city') {
      return value.trim().length >= 2
        ? { isValid: true, message: 'Valid City ✓' }
        : { isValid: false, message: 'Invalid: Please enter valid city' };
    }

    if (name === 'website') {
      const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      return urlRegex.test(value)
        ? { isValid: true, message: 'Valid Website ✓' }
        : { isValid: false, message: 'Invalid URL format' };
    }

    return { isValid: true, message: 'Valid ✓' };
  }

  // ====================================================
  // 6. Input Change Handler
  // ====================================================
  function doUpdateObj(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setObj((prev) => ({
      ...prev,
      [name]: value,
    }));

    const status = validateField(name, value);
    setValidations((prev) => ({
      ...prev,
      [name]: status,
    }));
  }

  // ====================================================
  // 7. Custom Combo Box Selection Handler
  // ====================================================
  function doSelectCategory(categoryName: string) {
    let updated: string[];

    if (selectedCats.includes(categoryName)) {
      updated = selectedCats.filter((item) => item !== categoryName);
    } else {
      updated = [...selectedCats, categoryName];
    }

    setSelectedCats(updated);

    setObj((prev) => ({
      ...prev,
      selcate: updated.join(', '),
    }));
  }

  // ====================================================
  // 8. Image Upload & Preview Handlers
  // ====================================================
  function doShowShopPic(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setObj((prev) => ({ ...prev, shoppic: file }));
      setShoppicPrev(URL.createObjectURL(file));
    }
  }

  function doShowCertPic(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setObj((prev) => ({ ...prev, certpic: file }));
      setCertpicPrev(URL.createObjectURL(file));
    }
  }

  // ====================================================
  // 9. Server Actions (Save & Update)
  // ====================================================

  // SAVE VENDOR
  async function doSaveObj(event: React.FormEvent) {
    event.preventDefault();

    if (!obj.emailid || !obj.name || !obj.contact || !obj.business) {
      alert('Please fill all mandatory fields (Name, Contact, Business Name)');
      return;
    }

    try {
      // const url = 'http://localhost:2004/vendor/reg-vendor';
      const frmData = new FormData();

      frmData.append('emailid', obj.emailid);
      frmData.append('name', obj.name);
      frmData.append('contact', obj.contact);
      frmData.append('business', obj.business);
      frmData.append('area', obj.area);
      frmData.append('address', obj.address);
      frmData.append('city', obj.city);
      frmData.append('estd', obj.estd);
      frmData.append('selcate', obj.selcate);
      frmData.append('website', obj.website);
      frmData.append('insta', obj.insta);

      if (obj.shoppic) frmData.append('shoppic', obj.shoppic);
      if (obj.certpic) frmData.append('certpic', obj.certpic);

      const token = localStorage.getItem('token');

      const resp = await axios.post(`${API_URL}/vendor/reg-vendor`, frmData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      if (resp.data.status === true) {
        alert(resp.data.msg || 'Vendor Registered Successfully!');
      } else {
        alert(resp.data.msg || 'Failed to register vendor.');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Error saving vendor record');
    }
  }

  // UPDATE VENDOR
  async function doUpdateObj_Server() {
    if (!obj.emailid) {
      alert('Email Id is required to update vendor profile');
      return;
    }

    try {
      // const url = 'http://localhost:2004/vendor/update-vendor';
      const frmData = new FormData();

      frmData.append('emailid', obj.emailid);
      frmData.append('name', obj.name);
      frmData.append('contact', obj.contact);
      frmData.append('business', obj.business);
      frmData.append('area', obj.area);
      frmData.append('address', obj.address);
      frmData.append('city', obj.city);
      frmData.append('estd', obj.estd);
      frmData.append('selcate', obj.selcate);
      frmData.append('website', obj.website);
      frmData.append('insta', obj.insta);

      if (obj.shoppic) frmData.append('shoppic', obj.shoppic);
      if (obj.certpic) frmData.append('certpic', obj.certpic);

      const token = localStorage.getItem('token');

      const resp = await axios.post(`${API_URL}/vendor/update-vendor`, frmData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      if (resp.data.status === true) {
        alert(resp.data.msg || 'Vendor Updated Successfully!');
      } else {
        alert(resp.data.msg || 'Failed to update vendor.');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Error updating vendor profile');
    }
  }

  // ====================================================
  // 10. UI Layout
  // ====================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white/95 rounded-2xl shadow-xl border-2 border-orange-200 overflow-hidden">
        

        {/* Title Bar */}
        <div className="text-center py-4 bg-orange-100/60 border-b border-orange-200 flex items-center justify-center gap-2">
          <h2 className="text-2xl font-bold text-rose-700 tracking-wide">
            Vendor Registration
          </h2>
          {isAutoFetching && (
            <span className="text-xs font-semibold text-orange-600 bg-orange-200/70 px-2.5 py-1 rounded-full animate-pulse">
              Fetching details...
            </span>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={doSaveObj} className="p-8 space-y-6">
          {/* Row 1: Email Id (Auto-Filled from localStorage & Read-Only) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-semibold text-rose-800">
                Email Id <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] font-semibold text-orange-600 bg-orange-100/80 px-2 py-0.5 rounded-md flex items-center gap-1 border border-orange-200">
                <svg className="w-3.5 h-3.5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Auto-Filled & Read Only
              </span>
            </div>

            <input
              type="email"
              name="emailid"
              readOnly
              value={obj.emailid}
              placeholder="vendor@utsav.com"
              className="w-full rounded-lg border-2 border-orange-200 bg-orange-50/50 px-3 py-2.5 text-sm text-slate-700 font-medium outline-none cursor-not-allowed select-none shadow-inner"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Logged in vendor email from session. Your existing details are automatically loaded if already registered.
            </p>
          </div>

          {/* Row 2: Name & Contact Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-rose-800 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={obj.name}
                onChange={doUpdateObj}
                placeholder="Full Name"
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition ${
                  validations.name
                    ? validations.name.isValid
                      ? 'border-green-500 bg-green-50/20 focus:ring-2 focus:ring-green-400'
                      : 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-400'
                    : 'border-orange-300 focus:ring-2 focus:ring-orange-400'
                }`}
              />
              {validations.name && (
                <span
                  className={`text-xs font-semibold block mt-1 ${
                    validations.name.isValid ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {validations.name.message}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-rose-800 mb-1">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="contact"
                value={obj.contact}
                onChange={doUpdateObj}
                placeholder="10-digit mobile number"
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition ${
                  validations.contact
                    ? validations.contact.isValid
                      ? 'border-green-500 bg-green-50/20 focus:ring-2 focus:ring-green-400'
                      : 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-400'
                    : 'border-orange-300 focus:ring-2 focus:ring-orange-400'
                }`}
              />
              {validations.contact && (
                <span
                  className={`text-xs font-semibold block mt-1 ${
                    validations.contact.isValid ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {validations.contact.message}
                </span>
              )}
            </div>
          </div>

          {/* Section Heading: Business Details */}
          <div className="pt-2">
            <h3 className="text-lg font-bold text-rose-800 border-b-2 border-orange-200 pb-1">
              Business Details:-
            </h3>
          </div>

          {/* Row 3: Business Name, Area, Address */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-rose-800 mb-1">
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="business"
                value={obj.business}
                onChange={doUpdateObj}
                placeholder="e.g. Royal Decorators"
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition ${
                  validations.business
                    ? validations.business.isValid
                      ? 'border-green-500 bg-green-50/20'
                      : 'border-red-500 bg-red-50/20'
                    : 'border-orange-300 focus:ring-2 focus:ring-orange-400'
                }`}
              />
              {validations.business && (
                <span
                  className={`text-xs font-semibold block mt-1 ${
                    validations.business.isValid ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {validations.business.message}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-rose-800 mb-1">
                Area
              </label>
              <input
                type="text"
                name="area"
                value={obj.area}
                onChange={doUpdateObj}
                placeholder="e.g. Civil Lines"
                className="w-full rounded-lg border border-orange-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-rose-800 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={obj.address}
                onChange={doUpdateObj}
                placeholder="Shop No., Street"
                className="w-full rounded-lg border border-orange-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          {/* Row 4: City & Estd. in */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-rose-800 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={obj.city}
                onChange={doUpdateObj}
                placeholder="e.g. Jaipur"
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition ${
                  validations.city
                    ? validations.city.isValid
                      ? 'border-green-500 bg-green-50/20'
                      : 'border-red-500 bg-red-50/20'
                    : 'border-orange-300 focus:ring-2 focus:ring-orange-400'
                }`}
              />
              {validations.city && (
                <span
                  className={`text-xs font-semibold block mt-1 ${
                    validations.city.isValid ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {validations.city.message}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-rose-800 mb-1">
                Estd. in
              </label>
              <input
                type="text"
                name="estd"
                value={obj.estd}
                onChange={doUpdateObj}
                placeholder="e.g. 2018"
                className="w-full rounded-lg border border-orange-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          {/* Row 5: Custom Combo Box & Selected Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
            {/* Custom Combo Box */}
            <div className="relative">
              <label className="block text-sm font-semibold text-rose-800 mb-1">
                Select Business Categories
              </label>
              <div
                onClick={() => setIsComboOpen(!isComboOpen)}
                className="w-full rounded-lg border-2 border-orange-300 bg-white px-3 py-2 text-sm cursor-pointer flex justify-between items-center shadow-sm hover:border-orange-500 transition"
              >
                <span className="text-rose-700 font-medium">
                  {selectedCats.length > 0
                    ? `${selectedCats.length} Categories Chosen`
                    : 'Deco/Photo/Catering'}
                </span>
                <span className="text-orange-500 font-bold">
                  {isComboOpen ? '▲' : '▼'}
                </span>
              </div>

              {/* Dropdown Options Popup */}
              {isComboOpen && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-orange-300 rounded-lg shadow-xl max-h-56 overflow-y-auto p-2">
                  <p className="text-xs text-orange-600 font-bold px-2 py-1 border-b border-orange-100">
                    Click to Select / Deselect Categories:
                  </p>
                  <div className="grid grid-cols-1 gap-1 mt-1">
                    {categoryList.map((cat: CategoryItem) => {
                      const isSelected = selectedCats.includes(cat.name);
                      return (
                        <div
                          key={cat.id}
                          onClick={() => doSelectCategory(cat.name)}
                          className={`flex items-center justify-between px-3 py-1.5 rounded-md cursor-pointer text-xs font-medium transition ${
                            isSelected
                              ? 'bg-orange-500 text-white font-semibold'
                              : 'hover:bg-orange-100 text-slate-700'
                          }`}
                        >
                          <span>{cat.name}</span>
                          <span>{isSelected ? '✓' : '+'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Selected Categories Box */}
            <div>
              <label className="block text-sm font-semibold text-rose-800 mb-1">
                Selected Categories
              </label>
              <input
                type="text"
                name="selcate"
                readOnly
                value={obj.selcate}
                placeholder="Deco, Photo"
                className="w-full rounded-lg border-2 border-blue-400 bg-blue-50/40 px-3 py-2 text-sm text-slate-800 font-medium outline-none cursor-not-allowed"
              />
              <span className="text-xs text-orange-600 block mt-1">
                {selectedCats.length > 0
                  ? `${selectedCats.length} categories chosen`
                  : 'Select categories from the combo box on the left'}
              </span>
            </div>
          </div>

          {/* Row 6: Website & Insta Id */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-rose-800 mb-1">
                Website
              </label>
              <input
                type="text"
                name="website"
                value={obj.website}
                onChange={doUpdateObj}
                placeholder="https://example.com"
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition ${
                  validations.website
                    ? validations.website.isValid
                      ? 'border-green-500 bg-green-50/20'
                      : 'border-red-500 bg-red-50/20'
                    : 'border-orange-300 focus:ring-2 focus:ring-orange-400'
                }`}
              />
              {validations.website && (
                <span
                  className={`text-xs font-semibold block mt-1 ${
                    validations.website.isValid ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {validations.website.message}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-rose-800 mb-1">
                Insta Id
              </label>
              <input
                type="text"
                name="insta"
                value={obj.insta}
                onChange={doUpdateObj}
                placeholder="@utsav_decor"
                className="w-full rounded-lg border border-orange-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          {/* Row 7: Shop Pic & Business Certificate with Previews */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Shop Pic */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-rose-800">
                Shop Pic
              </label>
              <input
                type="file"
                name="shoppic"
                accept="image/*"
                onChange={doShowShopPic}
                className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-orange-100 file:text-rose-700 hover:file:bg-orange-200 cursor-pointer"
              />
              <div className="w-28 h-28 border-2 border-dashed border-orange-400 rounded-lg flex items-center justify-center overflow-hidden bg-orange-50/50 shadow-inner">
                {shoppicPrev ? (
                  <img
                    src={shoppicPrev}
                    alt="Shop Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-orange-400 font-medium text-center px-1">
                    Shop Preview
                  </span>
                )}
              </div>
            </div>

            {/* Business Certificate */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-rose-800">
                Business Certificate (if Any)
              </label>
              <input
                type="file"
                name="certpic"
                accept="image/*"
                onChange={doShowCertPic}
                className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-orange-100 file:text-rose-700 hover:file:bg-orange-200 cursor-pointer"
              />
              <div className="w-28 h-28 border-2 border-dashed border-orange-400 rounded-lg flex items-center justify-center overflow-hidden bg-orange-50/50 shadow-inner">
                {certpicPrev ? (
                  <img
                    src={certpicPrev}
                    alt="Certificate Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-orange-400 font-medium text-center px-1">
                    Cert Preview
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Row 8: Action Buttons (Save & Update) */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-4 border-t border-orange-200">
            <button
              type="submit"
              className="w-full sm:w-44 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-lg hover:shadow-orange-300/50 transition duration-200 transform hover:-translate-y-0.5"
            >
              Save
            </button>

            <button
              type="button"
              onClick={doUpdateObj_Server}
              className="w-full sm:w-44 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-lg hover:shadow-teal-300/50 transition duration-200 transform hover:-translate-y-0.5"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VendorRegistration;