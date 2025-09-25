import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminProducts } from "../redux/slices/adminProductSlice";
import { fetchAllOrders } from "../redux/slices/adminOrderSlice";

const AdminHomePage = () => {
  const dispatch = useDispatch();
  
  const {
    products,
    loading: productsLoading,
    error: productsError,
  } = useSelector((state) => state.adminProducts);
  
  const {
    orders,
    totalOrders,
    totalSales,
    loading: ordersLoading,
    error: ordersError,
  } = useSelector((state) => state.adminOrders);

  useEffect(() => {
    dispatch(fetchAdminProducts());
    dispatch(fetchAllOrders());
  }, [dispatch]);

  if (productsLoading || ordersLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {productsError && (
        <p className="text-red-500 mb-4">Error fetching products: {productsError}</p>
      )}
      {ordersError && (
        <p className="text-red-500 mb-4">Error fetching orders: {ordersError}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="p-4 shadow-md rounded-lg bg-white">
          <h2 className="text-xl font-semibold mb-2">Revenue</h2>
          <p className="text-2xl font-bold text-green-600">
            ${totalSales?.toFixed(2) || '0.00'}
          </p>
        </div>

        <div className="p-4 shadow-md rounded-lg bg-white">
          <h2 className="text-xl font-semibold mb-2">Total Orders</h2>
          <p className="text-2xl font-bold">{totalOrders || 0}</p>
          <Link to="/admin/orders" className="text-blue-500 hover:underline text-sm mt-2 block">
            Manage Orders →
          </Link>
        </div>

        <div className="p-4 shadow-md rounded-lg bg-white">
          <h2 className="text-xl font-semibold mb-2">Total Products</h2>
          <p className="text-2xl font-bold">{products?.length || 0}</p>
          <Link to="/admin/products" className="text-blue-500 hover:underline text-sm mt-2 block">
            Manage Products →
          </Link>
        </div>
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-gray-500">
            <thead className="bg-gray-100 text-xs uppercase text-gray-700">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Total Price</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders && orders.length > 0 ? (
                orders.slice(0, 5).map((order) => (
                  <tr key={order._id} className="border-b hover:bg-gray-50 cursor-pointer">
                    <td className="p-4 font-medium text-gray-900">
                      {order._id ? order._id.slice(-8) : 'N/A'}
                    </td>
                    <td className="p-4">
                      {order.user?.name || order.user?.email || 'Guest'}
                    </td>
                    <td className="p-4">
                      ${order.totalPrice?.toFixed(2) || '0.00'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.status === 'delivered' 
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'processing'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status || 'pending'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    No recent orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {orders && orders.length > 5 && (
          <div className="mt-4 text-center">
            <Link 
              to="/admin/orders" 
              className="text-blue-500 hover:underline"
            >
              View all orders →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHomePage;