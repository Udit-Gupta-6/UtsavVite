import React, { useState, useEffect } from "react";
import axios from "axios";

// ============================================================================
// 1. DATA TYPES (INTERFACES)
// ============================================================================

// Schema strictly matching your backend MongoDB Users collection
export interface UserItem {
  _id?: string;
  emailid: string;
  utype: "Citizen" | "Vendor" | string;
  status: boolean; // true = Active, false = Blocked
  regDate?: string;
  createdAt?: string;
}

// Backend Server URL
const BASE_URL = "http://localhost:2004/admin";

// ============================================================================
// 2. MAIN ADMIN DASHBOARD COMPONENT
// ============================================================================
export default function AdminDash() {
  // ----------------------------------------------------
  // States (No dummy data - purely fetched from backend)
  // ----------------------------------------------------
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [alertMessage, setAlertMessage] = useState<string>("");

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("All"); // "All" | "Citizen" | "Vendor"
  const [selectedStatus, setSelectedStatus] = useState<string>("All"); // "All" | "Active" | "Blocked"

  // ----------------------------------------------------
  // 3. FETCH ALL USERS FROM BACKEND
  // ----------------------------------------------------
  useEffect(() => {
    fetchAllUsers();
  }, []);

  async function fetchAllUsers() {
    try {
      setLoading(true);
      setErrorMessage("");

      // Fetch from backend API
      const response = await axios.post(`${BASE_URL}/fetchallusers`);

      // Handle response: { status: true, data: [...] } or direct array [...]
      if (response.data && response.data.status && Array.isArray(response.data.data)) {
        setUsers(response.data.data);
      } else if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        setUsers([]);
      }
    } catch (error: any) {
      console.error("Error fetching users from backend:", error);
      setErrorMessage(
        error.response?.data?.msg ||
          "Could not connect to the backend server. Please verify your server is running."
      );
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  // ----------------------------------------------------
  // 4. RUNTIME ACTIONS: BLOCK, RESUME & DELETE
  // ----------------------------------------------------

  /**
   * Block / Resume Status:
   * Sends update to server and re-renders state at runtime immediately!
   */
  async function handleToggleStatus(emailid: string, currentStatus: boolean) {
    const newStatus = !currentStatus; // Toggle status
    const actionText = newStatus ? "Resumed (Active)" : "Blocked";

    try {
      const response = await axios.post(`${BASE_URL}/updatestatus`, {
        emailid: emailid,
        status: newStatus,
      });

      if (response.data && response.data.status === false) {
        showAlert(response.data.msg || "Failed to update status on server.");
        return;
      }

      // RUNTIME RE-RENDER: Updates list immediately without refreshing page!
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.emailid === emailid ? { ...user, status: newStatus } : user
        )
      );

      showAlert(`User ${emailid} has been ${actionText} successfully!`);
    } catch (err: any) {
      console.error("Status update error:", err);
      showAlert("Server communication error while updating status.");
    }
  }

  /**
   * Delete User:
   * Confirms, deletes from backend, and removes from state at runtime.
   */
  async function handleDeleteUser(emailid: string) {
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete user: ${emailid}?`
    );
    if (!confirmDelete) return;

    try {
      const response = await axios.post(`${BASE_URL}/deleteuser`, {
        emailid: emailid,
      });

      if (response.data && response.data.status === false) {
        showAlert(response.data.msg || "Failed to delete user on server.");
        return;
      }

      // RUNTIME RE-RENDER: Immediately remove user from table state
      setUsers((prevUsers) => prevUsers.filter((user) => user.emailid !== emailid));

      showAlert(`User ${emailid} was permanently deleted.`);
    } catch (err: any) {
      console.error("Delete user error:", err);
      showAlert("Server communication error while deleting user.");
    }
  }

  // Helper notification alert
  function showAlert(msg: string) {
    setAlertMessage(msg);
    setTimeout(() => setAlertMessage(""), 3500);
  }

  // ----------------------------------------------------
  // 5. CALCULATE COUNTS DYNAMICALLY FROM USERS LIST
  // ----------------------------------------------------
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === true).length;
  const blockedUsers = users.filter((u) => u.status === false).length;
  const totalCitizens = users.filter((u) => u.utype?.toLowerCase() === "citizen").length;
  const totalVendors = users.filter((u) => u.utype?.toLowerCase() === "vendor").length;

  // ----------------------------------------------------
  // 6. FILTER LOGIC FOR SEARCH & DROPDOWNS
  // ----------------------------------------------------
  const filteredUsers = users.filter((user) => {
    // 1. Search text filter
    const matchesSearch = user.emailid
      .toLowerCase()
      .includes(searchTerm.toLowerCase().trim());

    // 2. User Type filter
    const matchesType =
      selectedType === "All" ||
      user.utype?.toLowerCase() === selectedType.toLowerCase();

    // 3. Status filter
    const matchesStatus =
      selectedStatus === "All" ||
      (selectedStatus === "Active" && user.status === true) ||
      (selectedStatus === "Blocked" && user.status === false);

    return matchesSearch && matchesType && matchesStatus;
  });

  // ----------------------------------------------------
  // 7. COMPONENT LAYOUT
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage, monitor, and regulate user accounts from the collection.
          </p>
        </div>

        {/* Runtime Alert Notification Banner */}
        {alertMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">✓</span>
              <span>{alertMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setAlertMessage("")}
              className="text-emerald-600 hover:text-emerald-900 font-bold text-base"
            >
              ✕
            </button>
          </div>
        )}

        {/* Server Error Banner (if backend is unreachable) */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠</span>
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={fetchAllUsers}
              className="px-3 py-1 bg-rose-600 text-white text-xs rounded-lg hover:bg-rose-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* ========================================================
            2. SUMMARY STATS CARDS (Total, Active, Blocked, Breakdown)
            ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          
          {/* Card 1: Total Users */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-sm font-medium text-slate-500">Total Users</span>
            <div className="mt-2 text-3xl font-extrabold text-slate-900">
              {totalUsers}
            </div>
          </div>

          {/* Card 2: Active Users */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Active Users</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
            </div>
            <div className="mt-2 text-3xl font-extrabold text-slate-900">
              {activeUsers}
            </div>
          </div>

          {/* Card 3: Blocked / Suspended */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Blocked / Suspended</span>
              <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-rose-100 text-rose-700">
                {blockedUsers}
              </span>
            </div>
            <div className="mt-2 text-3xl font-extrabold text-slate-900">
              {blockedUsers}
            </div>
          </div>

          {/* Card 4: Breakdown */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-sm font-medium text-slate-500">Breakdown</span>
            <div className="mt-2 text-base font-bold text-slate-800">
              Citizens: <span className="text-blue-600 font-extrabold">{totalCitizens}</span>
              {" | "}
              Vendors: <span className="text-purple-600 font-extrabold">{totalVendors}</span>
            </div>
          </div>

        </div>

        {/* ========================================================
            3. FILTER BAR (No CSV Export, No Refresh Button)
            ======================================================== */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row items-center gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition duration-150"
            />
          </div>

          {/* Filter: User Type */}
          <div className="w-full md:w-48">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition duration-150 cursor-pointer text-slate-700"
            >
              <option value="All">All User Types</option>
              <option value="Citizen">Citizens Only</option>
              <option value="Vendor">Vendors Only</option>
            </select>
          </div>

          {/* Filter: Status */}
          <div className="w-full md:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition duration-150 cursor-pointer text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Blocked">Blocked Only</option>
            </select>
          </div>

        </div>

        {/* ========================================================
            4. USERS DATA TABLE (Runtime Re-render)
            ======================================================== */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-4">Email ID</th>
                  <th scope="col" className="px-6 py-4">User Type</th>
                  <th scope="col" className="px-6 py-4">Account Status</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                        <span>Loading users from database collection...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                      No users found in database collection.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const isActive = user.status === true;

                    return (
                      <tr
                        key={user.emailid}
                        className="hover:bg-slate-50/80 transition duration-150"
                      >
                        {/* 1. Email ID */}
                        <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                          {user.emailid}
                        </td>

                        {/* 2. User Type Badge */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.utype?.toLowerCase() === "vendor" ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                              Vendor
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                              Citizen
                            </span>
                          )}
                        </td>

                        {/* 3. Account Status Badge */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Blocked
                            </span>
                          )}
                        </td>

                        {/* 4. Runtime Action Buttons */}
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            
                            {/* Block / Resume Button */}
                            {isActive ? (
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(user.emailid, user.status)}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition duration-150 cursor-pointer"
                              >
                                Block
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(user.emailid, user.status)}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition duration-150 cursor-pointer"
                              >
                                Resume / Unblock
                              </button>
                            )}

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user.emailid)}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition duration-150 cursor-pointer"
                            >
                              Delete
                            </button>

                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}