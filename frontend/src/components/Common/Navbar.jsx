import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineUser, HiOutlineShoppingCart, HiBars3BottomRight, HiChatBubbleLeftRight } from "react-icons/hi2";
import { useSelector } from 'react-redux';
import SearchBar from './SearchBar';
import CartDrawer from '../Layout/CartDrawer';

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);
  const navigate = useNavigate();
  
  const { cart } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const cartItemCount =
    cart?.products?.reduce((total, product) => total + product.quantity, 0) || 0;

  const handleUserClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  };

  const toggleCartDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <>
      <nav className="container mx-auto flex items-center justify-between py-4 px-6">
        <div>
          <Link to="/" className="text-2xl font-medium">
            JS SPORTS
          </Link>
        </div>

        <div className="hidden md:flex space-x-6">
          <Link to="/collections/all?gender=Men" className="text-gray-700 hover:text-black text-sm font-medium uppercase">
            Men
          </Link>
          <Link to="/collections/all?gender=Women" className="text-gray-700 hover:text-black text-sm font-medium uppercase">
            Women
          </Link>
          <Link to="/collections/all?category=Football" className="text-gray-700 hover:text-black text-sm font-medium uppercase">
            Football Gears
          </Link>
          <Link to="/collections/all?brand=Nike" className="text-gray-700 hover:text-black text-sm font-medium uppercase">
            Nike
          </Link>
          {/* Add Feedback Link */}
          <Link to="/feedback" className="text-gray-700 hover:text-black text-sm font-medium uppercase flex items-center">
            <HiChatBubbleLeftRight className="mr-1 h-4 w-4" />
            Feedback
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {user && user.role === "admin" && (
            <Link to="/admin" className="block bg-black px-3 py-1 rounded text-sm text-white hover:bg-gray-800 transition-colors">
              Admin
            </Link>
          )}
          
          <button onClick={handleUserClick} className="hover:text-black transition-colors">
            <HiOutlineUser className="h-6 w-6 text-gray-700" />
          </button>

          <button onClick={toggleCartDrawer} className="relative hover:text-black transition-colors">
            <HiOutlineShoppingCart className="h-6 w-6 text-gray-700" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>

          <SearchBar />

          <button 
            className="md:hidden"
            onClick={() => setNavDrawerOpen(!navDrawerOpen)}
          >
            <HiBars3BottomRight className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {navDrawerOpen && (
        <div className="md:hidden fixed top-0 left-0 w-full h-full bg-white z-50 p-6">
          <div className="flex flex-col space-y-4">
            <button 
              onClick={() => setNavDrawerOpen(false)}
              className="self-end text-2xl"
            >
              ×
            </button>
            <Link 
              to="/collections/all?gender=Men" 
              className="text-gray-700 hover:text-black text-sm font-medium uppercase"
              onClick={() => setNavDrawerOpen(false)}
            >
              Men
            </Link>
            <Link 
              to="/collections/all?gender=Women" 
              className="text-gray-700 hover:text-black text-sm font-medium uppercase"
              onClick={() => setNavDrawerOpen(false)}
            >
              Women
            </Link>
            <Link 
              to="/collections/all?category=Football" 
              className="text-gray-700 hover:text-black text-sm font-medium uppercase"
              onClick={() => setNavDrawerOpen(false)}
            >
              Football Gears
            </Link>
            <Link 
              to="/collections/all?brand=Nike" 
              className="text-gray-700 hover:text-black text-sm font-medium uppercase"
              onClick={() => setNavDrawerOpen(false)}
            >
              Nike
            </Link>
            {/* Mobile Feedback Link */}
            <Link 
              to="/feedback" 
              className="text-gray-700 hover:text-black text-sm font-medium uppercase flex items-center"
              onClick={() => setNavDrawerOpen(false)}
            >
              <HiChatBubbleLeftRight className="mr-1 h-4 w-4" />
              Feedback
            </Link>
          </div>
        </div>
      )}

      <CartDrawer drawerOpen={drawerOpen} toggleCartDrawer={toggleCartDrawer} />
    </>
  );
};

export default Navbar;