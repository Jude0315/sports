import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaUser, FaBoxOpen, FaClipboardList, FaStore, FaSignOutAlt, FaBolt,FaCreditCard } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice"; // Import logout action
import { clearCart } from "../../redux/slices/cartSlice";

const AdminSidebar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logout());
        dispatch(clearCart());
        localStorage.removeItem("userToken");
        localStorage.removeItem("userInfo");
        navigate("/");
    };

    return (
        <div className="p-6 bg-gray-800 text-white h-screen w-64 fixed left-0 top-0">
            <div className="mb-6">
                <NavLink 
                    to="/admin" 
                    className="text-2xl font-medium text-white hover:text-gray-300"
                >
                    JS Sports
                </NavLink>
            </div>

            <h2 className="text-xl font-medium mb-6 text-center">Admin Dashboard</h2>

            <nav className="flex flex-col space-y-2">
                <NavLink
                    to="/admin/users"
                    className={({ isActive }) =>
                        `py-3 px-4 rounded flex items-center space-x-2 transition-colors ${
                            isActive
                                ? "bg-gray-700 text-white"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white"
                        }`
                    }
                >
                    <FaUser />
                    <span>Users</span>
                </NavLink>

                <NavLink
                    to="/admin/products"
                    className={({ isActive }) =>
                        `py-3 px-4 rounded flex items-center space-x-2 transition-colors ${
                            isActive
                                ? "bg-gray-700 text-white"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white"
                        }`
                    }
                >
                    <FaBoxOpen />
                    <span>Products</span>
                </NavLink>

                <NavLink
                    to="/admin/orders"
                    className={({ isActive }) =>
                        `py-3 px-4 rounded flex items-center space-x-2 transition-colors ${
                            isActive
                                ? "bg-gray-700 text-white"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white"
                        }`
                    }
                >
                    <FaClipboardList />
                    <span>Orders</span>
                </NavLink>

                <NavLink
                    to="/admin/suppliers"
                    className={({ isActive }) =>
                        `py-3 px-4 rounded flex items-center space-x-2 transition-colors ${
                            isActive
                                ? "bg-gray-700 text-white"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white"
                        }`
                    }
                >
                    <FaStore />
                    <span>Supplier Management</span>
                </NavLink>

                <NavLink
                    to="/admin/quick-features"
                    className={({ isActive }) =>
                        `py-3 px-4 rounded flex items-center space-x-2 transition-colors ${
                            isActive
                                ? "bg-gray-700 text-white"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white"
                        }`
                    }
                >
                    <FaBolt />
                    <span>Quick Features</span>
                </NavLink>

                <NavLink
                    to="/admin/feedbacks"
                    className={({ isActive }) =>
                        `py-3 px-4 rounded flex items-center space-x-2 transition-colors ${
                            isActive
                                ? "bg-gray-700 text-white"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white"
                        }`
                    }
                >
                    <FaBolt />
                    <span>Feedbacks</span>
                </NavLink>

                
                    <NavLink
                    to="/admin/payments"  // Add this Payments link
                    className={({ isActive }) =>
                        `py-3 px-4 rounded flex items-center space-x-2 transition-colors ${
                            isActive
                                ? "bg-gray-700 text-white"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white"
                        }`
                    }
                >
                    <FaCreditCard />
                    <span>Payments</span>
                </NavLink>
                
            </nav>

            <div className="mt-6 pt-6 border-t border-gray-700">
                <button
                    onClick={handleLogout}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded flex items-center justify-center space-x-2 transition-colors"
                >
                    <FaSignOutAlt />
                    <span>Logout</span>
                </button>
            </div>

            {/* Link back to main site */}
            <div className="mt-4 pt-4 border-t border-gray-700">
                <NavLink
                    to="/"
                    className="text-gray-300 hover:text-white py-2 px-4 rounded flex items-center space-x-2 transition-colors text-sm"
                >
                    ← Back to Main Site
                </NavLink>
            </div>
        </div>
    );
};

export default AdminSidebar;