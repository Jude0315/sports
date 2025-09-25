import React, { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUserOrders } from '../redux/slices/orderSlice';

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  const handleRowClick = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  if (loading) return <p className="text-center p-6">Loading orders...</p>;
  if (error) return <p className="text-center p-6 text-red-500">Error: {error}</p>;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-6">My Orders</h2>
      <div className="relative shadow-md sm:rounded-lg overflow-hidden">
        <table className="min-w-full text-left text-gray-500">
          <thead className="bg-gray-100 text-xs uppercase text-gray-700">
            <tr>
              <th className="py-2 px-4 sm:py-3">Preview</th>
              <th className="py-2 px-4 sm:py-3">Order ID</th>
              <th className="py-2 px-4 sm:py-3">Created</th>
              <th className="py-2 px-4 sm:py-3">Shipping Address</th>
              <th className="py-2 px-4 sm:py-3">Items</th>
              <th className="py-2 px-4 sm:py-3">Price</th>
              <th className="py-2 px-4 sm:py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders && orders.length > 0 ? (
              orders.map((order) => (
                <tr 
                  key={order._id}
                  onClick={() => handleRowClick(order._id)}
                  className="border-b cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <td className="py-2 px-4">
                    {order.orderItems && order.orderItems.length > 0 && (
                      <img
                        src={order.orderItems[0]?.image || order.orderItems[0]?.images?.[0]?.url}
                        alt={order.orderItems[0]?.name || 'Product'}
                        className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/48x48?text=No+Image';
                        }}
                      />
                    )}
                  </td>
                  <td className="py-2 px-4 font-medium text-gray-900">
                    {order._id ? order._id.slice(-8) : 'N/A'}
                  </td>
                  <td className="py-2 px-4">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-2 px-4">
                    {order.shippingAddress ? 
                      `${order.shippingAddress.city}, ${order.shippingAddress.country}` : 
                      'N/A'
                    }
                  </td>
                  <td className="py-2 px-4">
                    {order.orderItems ? 
                      order.orderItems.map((item) => item.name).join(", ") : 
                      'No items'
                    }
                  </td>
                  <td className="py-2 px-4 font-semibold">
                    ${order.totalPrice ? order.totalPrice.toLocaleString() : '0'}
                  </td>
                  <td className="py-2 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        order.isPaid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {order.isPaid ? "Paid" : "Unpaid"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-8 px-4 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-lg font-medium">You have no orders yet</p>
                    <p className="text-sm mt-2">Start shopping to see your orders here</p>
                    <button
                      onClick={() => navigate('/')}
                      className="mt-4 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Start Shopping
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyOrdersPage;