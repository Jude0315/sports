import React, { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderDetails } from '../redux/slices/orderSlice';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { orderDetails, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderDetails(id));
    }
  }, [dispatch, id]);

  if (loading) return <p className="text-center p-6">Loading order details...</p>;
  if (error) return <p className="text-center p-6 text-red-500">Error: {error}</p>;
  
  if (!orderDetails) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <p className="text-center">No order details found</p>
        <button
          onClick={() => navigate('/my-orders')}
          className="mt-4 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Back to My Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <h2 className="text-2xl md:text-3xl font-bold mb-6">Order Details</h2>

      {/* Order Info */}
      <div className="p-4 sm:p-6 rounded-lg border mb-8">
        <div className="flex flex-col sm:flex-row justify-between mb-8">
          <div>
            <h3 className="text-lg md:text-xl font-semibold">
              Order ID: #{orderDetails._id?.slice(-8)}
            </h3>
            <p className="text-gray-600">
              {orderDetails.createdAt ? new Date(orderDetails.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end mt-4 sm:mt-0">
            <span
              className={`${
                orderDetails.isPaid
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              } px-3 py-1 rounded-full text-sm font-medium mb-2`}
            >
              {orderDetails.isPaid ? "Approved" : "Pending"}
            </span>

            <span
              className={`${
                orderDetails.isDelivered
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              } px-3 py-1 rounded-full text-sm font-medium`}
            >
              {orderDetails.isDelivered ? "Delivered" : "Pending"}
            </span>
          </div>
        </div>

        {/* Customer, Payment, Shipping Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h4 className="text-lg font-semibold mb-2">Payment Info</h4>
            <p>Payment Method: {orderDetails.paymentMethod || 'N/A'}</p>
            <p>Status: {orderDetails.isPaid ? "Paid" : "Unpaid"}</p>
            {orderDetails.paidAt && (
              <p>Paid on: {new Date(orderDetails.paidAt).toLocaleDateString()}</p>
            )}
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-2">Shipping Info</h4>
            <p>Shipping Method: {orderDetails.shippingMethod || 'Standard'}</p>
            {orderDetails.shippingAddress && (
              <>
                <p>City: {orderDetails.shippingAddress.city || 'N/A'}</p>
                <p>Country: {orderDetails.shippingAddress.country || 'N/A'}</p>
              </>
            )}
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-2">Order Total</h4>
            <p className="text-xl font-bold">
              Rs. {orderDetails.totalPrice?.toLocaleString() || '0'}
            </p>
            {orderDetails.deliveredAt && (
              <p>Delivered on: {new Date(orderDetails.deliveredAt).toLocaleDateString()}</p>
            )}
          </div>
        </div>

        {/* Product List */}
        <div className="overflow-x-auto">
          <h4 className="text-lg font-semibold mb-4">Products</h4>
          {orderDetails.orderItems && orderDetails.orderItems.length > 0 ? (
            <table className="min-w-full text-gray-600 mb-4 border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left">Product</th>
                  <th className="py-2 px-4 text-right">Unit Price</th>
                  <th className="py-2 px-4 text-center">Quantity</th>
                  <th className="py-2 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orderDetails.orderItems.map((item, index) => (
                  <tr key={item.productId || index} className="border-b">
                    <td className="py-2 px-4 flex items-center">
                      <img
                        src={item.image || item.images?.[0]?.url}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg mr-4"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/48x48?text=No+Image';
                        }}
                      />
                      <Link
                        to={`/product/${item.productId}`}
                        className="text-blue-500 hover:underline"
                      >
                        {item.name || 'Unknown Product'}
                      </Link>
                    </td>
                    <td className="py-2 px-4 text-right">Rs. {item.price?.toLocaleString() || '0'}</td>
                    <td className="py-2 px-4 text-center">{item.quantity || '0'}</td>
                    <td className="py-2 px-4 text-right font-semibold">
                      Rs. {((item.price || 0) * (item.quantity || 0)).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No products found in this order</p>
          )}
        </div>

        {/* Order Summary */}
        <div className="border-t pt-4 mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Subtotal:</span>
            <span>Rs. {orderDetails.totalPrice?.toLocaleString() || '0'}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Shipping:</span>
            <span className="text-green-600">Free</span>
          </div>
          <div className="flex justify-between items-center border-t pt-2 mt-2">
            <span className="font-bold text-lg">Total:</span>
            <span className="font-bold text-lg">
              Rs. {orderDetails.totalPrice?.toLocaleString() || '0'}
            </span>
          </div>
        </div>

        {/* Back to Orders */}
        <div className="mt-6">
          <Link
            to="/my-orders"
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors inline-block"
          >
            Back to My Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;