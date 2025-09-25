import React from 'react';
import { IoMdClose } from 'react-icons/io';
import { useSelector } from 'react-redux';
import CartContents from '../Cart/CartContents';
import { useNavigate } from 'react-router-dom';

const CartDrawer = ({ drawerOpen, toggleCartDrawer }) => {
  const navigate = useNavigate();
  const { user, guestId } = useSelector((state) => state.auth);
  const { cart, loading, error } = useSelector((state) => state.cart);

  const handleCheckout = () => {
    toggleCartDrawer();
    if (!user) {
      navigate("/login?redirect=checkout");
    } else {
      navigate("/checkout");
    }
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full bg-white shadow-lg transform transition-transform duration-300 
        flex flex-col z-50 w-3/4 sm:w-1/2 md:w-[30rem] ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
    >
      {/* Close button */}
      <div className="flex justify-end p-4">
        <button onClick={toggleCartDrawer} aria-label="Close cart">
          <IoMdClose className="h-6 w-6 text-gray-600" />
        </button>
      </div>

      {/* Cart content with scrollable area */}
      <div className="flex-grow p-4 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Your Cart</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-8">
            <p>Loading cart...</p>
          </div>
        ) : cart && cart.products?.length > 0 ? (
          <CartContents />
        ) : (
          <div className="text-center py-8">
            <p>Your cart is empty.</p>
            <button
              onClick={toggleCartDrawer}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>

      {/* Checkout button fixed at the bottom */}
      {cart && cart.products?.length > 0 && (
        <div className="p-4 bg-white border-t">
          <button 
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Checkout'}
          </button>

          <p className="text-sm text-gray-500 mt-2 text-center">
            Shipping, taxes and discount codes calculated at checkout
          </p>
        </div>
      )}
    </div>
  );
};

export default CartDrawer;