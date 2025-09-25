import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearCart } from '../redux/slices/cartSlice'; // Adjust path as needed

const OrderConfirmationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { checkout } = useSelector((state) => state.checkout);

  // Clear the cart when the order is confirmed
  useEffect(() => {
    if (checkout && checkout._id) {
      dispatch(clearCart());
      localStorage.removeItem("cart");
    } else {
      navigate("/my-orders");
    }
  }, [checkout, dispatch, navigate]);

  const calculateEstimatedDelivery = (createdAt) => {
    const orderDate = new Date(createdAt);
    orderDate.setDate(orderDate.getDate() + 10);
    return orderDate.toLocaleDateString();
  };

  const calculateTotal = () => {
    if (!checkout || !checkout.checkoutItems) return 0;
    return checkout.checkoutItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  // If no checkout data, show loading or redirect
  if (!checkout) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white">
        <p className="text-center">Loading order details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
      <h1 className="text-4xl font-bold text-center text-emerald-700 mb-8">
        Thank You for Your Order!
      </h1>

      <div className="p-6 rounded-lg border shadow">
        {/* Order Info */}
        <div className="flex justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Order ID: {checkout._id}</h2>
            <p className="text-gray-500">
              Order Date: {new Date(checkout.createdAt).toLocaleDateString()}
            </p>
            <p className="text-gray-500">
              Estimated Delivery:{" "}
              <span className="text-emerald-700 font-medium">
                {calculateEstimatedDelivery(checkout.createdAt)}
              </span>
            </p>
            <p className="text-gray-500">
              Payment Method:{" "}
              <span className="text-black font-semibold">
                {checkout.paymentMethod}
              </span>
            </p>
            <p className="text-gray-500">
              Payment Status:{" "}
              <span className={`font-semibold ${
                checkout.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'
              }`}>
                {checkout.paymentStatus}
              </span>
            </p>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Shipping Address</h3>
          <p className="text-gray-700">
            {checkout.shippingAddress.firstName} {checkout.shippingAddress.lastName}
          </p>
          <p className="text-gray-700">{checkout.shippingAddress.address}</p>
          <p className="text-gray-700">
            {checkout.shippingAddress.city}, {checkout.shippingAddress.postalCode}
          </p>
          <p className="text-gray-700">{checkout.shippingAddress.country}</p>
          <p className="text-gray-700">Phone: {checkout.shippingAddress.phone}</p>
        </div>

        {/* Item List */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Order Items</h3>
          {checkout.checkoutItems.map((item, index) => (
            <div key={index} className="flex items-center mb-4 border-b pb-2">
              <img
                src={item.image || item.images?.[0]?.url}
                alt={item.name}
                className="w-16 h-16 rounded mr-4 object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/64x64?text=No+Image';
                }}
              />
              <div className="flex-grow">
                <p className="font-medium">{item.name}</p>
                {item.size && (
                  <p className="text-sm text-gray-600">Size: {item.size}</p>
                )}
                {item.color && (
                  <p className="text-sm text-gray-600">Color: {item.color}</p>
                )}
                <p className="text-sm">Rs. {item.price.toLocaleString()} × {item.quantity}</p>
              </div>
              <p className="font-semibold text-sm">
                Rs. {(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="border-t pt-4 text-sm text-gray-700">
          <div className="flex justify-between mb-2">
            <span>Subtotal</span>
            <span>Rs. {calculateTotal().toLocaleString()}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Shipping</span>
            <span className="text-green-600 font-semibold">Free</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-bold text-base">
            <span>Total</span>
            <span>Rs. {calculateTotal().toLocaleString()}</span>
          </div>
        </div>

        {/* Continue Shopping Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;