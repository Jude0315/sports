import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import login from '../assets/login.webp';
import { loginUser } from '../redux/slices/authSlice';
import { mergeCart } from '../redux/slices/cartSlice';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hasLoggedIn, setHasLoggedIn] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get auth and cart state from Redux
  const { user, guestId, loading, error } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  
  // Get redirect parameter (though we'll redirect to profile instead)
  const redirect = new URLSearchParams(location.search).get("redirect") || "/";

  // Handle redirect after successful login - ALWAYS go to profile page
  useEffect(() => {
    if (user && hasLoggedIn) {
      // Merge cart if needed, then redirect to profile
      if (cart?.products?.length > 0 && guestId) {
        dispatch(mergeCart({
          guestId, 
          userId: user._id 
        })).unwrap().then(() => {
          navigate('/profile'); // Always go to profile page
        }).catch((error) => {
          console.error('Cart merge failed:', error);
          navigate('/profile'); // Still go to profile even if merge fails
        });
      } else {
        navigate('/profile'); // Always go to profile page
      }
    }
  }, [user, guestId, cart, navigate, dispatch, hasLoggedIn]);

  // If user is already logged in, redirect to profile immediately
  useEffect(() => {
    if (user && !hasLoggedIn) {
      navigate('/profile');
    }
  }, [user, navigate, hasLoggedIn]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password })).then(() => {
      setHasLoggedIn(true);
    });
  };

  return (
    <div className="flex h-screen">
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <form 
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white p-8 rounded-lg shadow-md border"
        >
          <div className="flex justify-center mb-6">
            <h2 className="text-xl font-medium">JS SPORTS</h2>
          </div>
          <h2 className="text-2xl font-bold text-center mb-4">Hey there! </h2>
          <p className="text-center mb-6">
            Enter Your Username and Password to Login
          </p>

          {/* Error message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter your email address"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white p-2 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <p className="mt-6 text-center text-sm">
            Don't have an account?{' '}
            <Link 
              to={`/register?redirect=${encodeURIComponent(redirect)}`} 
              className="text-blue-500 hover:underline"
            >
              Register
            </Link>
          </p>
        </form>
      </div>

      <div className="hidden md:flex w-1/2 h-full items-center justify-center">
        <img
          src={login}
          alt="Login illustration"
          className="object-cover h-full w-full"
        />
      </div>
    </div>
  );
};

export default Login;