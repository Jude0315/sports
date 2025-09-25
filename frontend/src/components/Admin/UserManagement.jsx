import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addUser, deleteUser, fetchUsers, updateUser } from '../../redux/slices/adminSlice';
import * as XLSX from 'xlsx';

const UserManagement = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user: currentUser } = useSelector((state) => state.auth);
    const { users, loading, error } = useSelector((state) => state.admin);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "customer",
    });

    const [showForm, setShowForm] = useState(false);
    const [filterRole, setFilterRole] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (currentUser && currentUser.role !== "admin") {
            navigate("/");
        }
    }, [currentUser, navigate]);

    useEffect(() => {
        if (currentUser && currentUser.role === "admin") {
            dispatch(fetchUsers());
        }
    }, [dispatch, currentUser]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(addUser(formData));
        setFormData({
            name: "",
            email: "",
            password: "",
            role: "customer",
        });
        setShowForm(false);
    };

    const handleRoleChange = (userId, newRole) => {
        dispatch(updateUser({ id: userId, role: newRole }));
    };

    const handleDelete = (userId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            dispatch(deleteUser(userId));
        }
    };

    // Generate Excel Report
    const generateUserReport = () => {
        const reportData = users.map(user => ({
            'Name': user.name,
            'Email': user.email,
            'Role': user.role,
            'User ID': user._id,
            'Status': user.isActive !== false ? 'Active' : 'Inactive',
            'Created At': user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
            'Last Updated': user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(reportData);
        
        XLSX.utils.book_append_sheet(wb, ws, "Users Report");
        XLSX.writeFile(wb, `Users_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    // Filter users based on filters and search
    const filteredUsers = users?.filter(user => {
        // Role filter
        const roleMatch = filterRole === "all" || user.role === filterRole;
        
        // Status filter
        const statusMatch = filterStatus === "all" || 
                           (filterStatus === "active" && user.isActive !== false) || 
                           (filterStatus === "inactive" && user.isActive === false);
        
        // Search query filter (name or email)
        const searchMatch = searchQuery === "" || 
                           user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           user.email.toLowerCase().includes(searchQuery.toLowerCase());
        
        return roleMatch && statusMatch && searchMatch;
    });

    // Get user counts for stats
    const userCounts = {
        all: users?.length || 0,
        admin: users?.filter(u => u.role === 'admin').length || 0,
        customer: users?.filter(u => u.role === 'customer').length || 0,
        active: users?.filter(u => u.isActive !== false).length || 0,
        inactive: users?.filter(u => u.isActive === false).length || 0,
    };

    if (currentUser && currentUser.role !== "admin") {
        return null;
    }

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error) return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="font-semibold">Error:</p>
                <p>{error}</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
                    <p className="text-gray-600 mt-1">Manage system users and permissions</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                        onClick={generateUserReport}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export Report
                    </button>
                    
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        {showForm ? 'Cancel' : 'Add User'}
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                {Object.entries({
                    all: 'Total Users',
                    admin: 'Admins',
                    customer: 'Customers',
                    active: 'Active',
                    inactive: 'Inactive'
                }).map(([key, label]) => (
                    <div 
                        key={key}
                        className={`bg-white p-4 rounded-lg shadow-sm border-2 cursor-pointer transition-all duration-200 ${
                            (filterRole === key || filterStatus === key) ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => {
                            if (['all', 'admin', 'customer'].includes(key)) {
                                setFilterRole(key);
                            } else if (['active', 'inactive'].includes(key)) {
                                setFilterStatus(key);
                            }
                        }}
                    >
                        <div className={`text-2xl font-bold ${
                            key === 'admin' ? 'text-purple-600' : 
                            key === 'customer' ? 'text-green-600' : 
                            key === 'active' ? 'text-emerald-600' :
                            key === 'inactive' ? 'text-red-600' : 'text-gray-900'
                        }`}>
                            {userCounts[key]}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{label}</div>
                    </div>
                ))}
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Search by name or email..."
                            />
                        </div>
                    </div>

                    {/* Role Filter */}
                    <div className="w-full md:w-48">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="block w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Administrator</option>
                            <option value="customer">Customer</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="w-full md:w-48">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="block w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    {/* Clear Filters Button */}
                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setFilterRole("all");
                                setFilterStatus("all");
                                setSearchQuery("");
                            }}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Add User Form */}
            {showForm && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Add New User
                    </h3>
                    
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Enter full name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="user@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Minimum 6 characters"
                                required
                                minLength={6}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                <option value="customer">Customer</option>
                                <option value="admin">Administrator</option>
                            </select>
                        </div>

                        <div className="md:col-span-2 flex gap-3 pt-4">
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Create User
                            </button>
                            
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">Users List</h3>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">
                            Showing {filteredUsers?.length || 0} of {users?.length || 0} users
                        </span>
                        {(filterRole !== "all" || filterStatus !== "all" || searchQuery) && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full">
                                Filtered
                            </span>
                        )}
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers && filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-150">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 text-sm">
                                                        {user.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        ID: {user._id?.slice(-6)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{user.email}</div>
                                        </td>
                                        
                                        <td className="px-6 py-4">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                className={`text-sm rounded-lg p-2 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}
                                                disabled={user._id === currentUser?._id}
                                            >
                                                <option value="customer">Customer</option>
                                                <option value="admin">Administrator</option>
                                            </select>
                                        </td>
                                        
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                user.isActive !== false ? 
                                                'bg-green-100 text-green-800' : 
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {user.isActive !== false ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleDelete(user._id)}
                                                    className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors duration-200 text-sm font-medium"
                                                    disabled={user._id === currentUser?._id}
                                                    title={user._id === currentUser?._id ? "Cannot delete your own account" : "Delete user"}
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="text-gray-500">
                                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                            <p className="text-lg font-medium">No users found</p>
                                            <p className="text-sm mt-2">
                                                {searchQuery 
                                                    ? `No users found for "${searchQuery}"` 
                                                    : `No users match the selected filters`
                                                }
                                            </p>
                                            {(filterRole !== "all" || filterStatus !== "all" || searchQuery) && (
                                                <button
                                                    onClick={() => {
                                                        setFilterRole("all");
                                                        setFilterStatus("all");
                                                        setSearchQuery("");
                                                    }}
                                                    className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    Clear all filters
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;