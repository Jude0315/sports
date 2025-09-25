import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import Hero from "../components/Layout/Hero";
import GenderCollectionSection from "../components/Products/GenderCollectionSection";
import NewArrivals from "../components/Products/NewArrivals";
import ProductGrid from "../components/Products/ProductGrid";
import FeaturedCollection from "../components/Products/FeaturedCollection";
import FeaturesSection from "../components/Products/FeaturesSection";
import ProductDetails from "../components/Products/ProductDetails";

import { fetchProductsByFilters, fetchBestSeller } from "../redux/slices/productsSlice";

const Home = () => {
  const dispatch = useDispatch();
  const { 
    products, 
    loading, 
    error, 
    bestSellerProduct, 
    bestSellerLoading, 
    bestSellerError 
  } = useSelector((state) => state.products);

  // Debugging useEffect hooks
  useEffect(() => {
    console.log('🏠 Home component mounted');
    console.log('📦 Products in Redux state:', products);
    console.log('⭐ Best Seller in Redux state:', bestSellerProduct);
    console.log('⏳ Products Loading state:', loading);
    console.log('⏳ Best Seller Loading state:', bestSellerLoading);
    console.log('❌ Products Error state:', error);
    console.log('❌ Best Seller Error state:', bestSellerError);
  }, []);

  useEffect(() => {
    console.log('🔄 Products state updated:', {
      count: products.length,
      products: products
    });
  }, [products]);

  useEffect(() => {
    console.log('🔄 Best Seller state updated:', bestSellerProduct);
  }, [bestSellerProduct]);

  useEffect(() => {
    console.log('🔄 Products Loading state updated:', loading);
  }, [loading]);

  useEffect(() => {
    console.log('🔄 Best Seller Loading state updated:', bestSellerLoading);
  }, [bestSellerLoading]);

  useEffect(() => {
    console.log('🔄 Products Error state updated:', error);
  }, [error]);

  useEffect(() => {
    console.log('🔄 Best Seller Error state updated:', bestSellerError);
  }, [bestSellerError]);

  useEffect(() => {
    console.log('🚀 Dispatching product fetches...');
    
    // Fetch Men MMA Wears
    dispatch(fetchProductsByFilters({ 
      gender: "Men", 
      category: "Football", 
      limit: 8 
    }));

    // Fetch Best Seller
    dispatch(fetchBestSeller());
  }, [dispatch]);

  // Helper function to extract error message
  const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (typeof error === 'object') return JSON.stringify(error);
    return 'An unknown error occurred';
  };

  return (
    <div>
      <Hero />
      <GenderCollectionSection />
      <NewArrivals />

      {/* Best Seller Section */}
      <div className="container mx-auto mt-12">
        <h2 className="text-3xl text-center font-bold mb-8">Best Seller</h2>
        {bestSellerLoading ? (
          <p className="text-center text-gray-500">Loading best seller product...</p>
        ) : bestSellerError ? (
          <div className="text-center">
            <p className="text-red-500 mb-2">
              Error loading best seller: {getErrorMessage(bestSellerError)}
            </p>
            <p className="text-sm text-gray-500">
              Please try refreshing the page or check back later.
            </p>
          </div>
        ) : bestSellerProduct ? (
          <ProductDetails productId={bestSellerProduct._id} />
        ) : (
          <p className="text-center text-gray-500">No best seller product available at the moment.</p>
        )}
      </div>

      {/* Football Gears Section */}
      <div className="container mx-auto mt-12">
        <h3 className="text-3xl text-center font-bold mb-8">
          Football Gears for Men
        </h3>
        <ProductGrid products={products} loading={loading} error={error} />
      </div>

      <FeaturedCollection />
      <FeaturesSection />
    </div>
  );
};

export default Home;