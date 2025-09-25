import React from "react";
import { Link } from "react-router-dom";

const ProductGrid = ({ products, loading, error }) => {
  console.log('📦 ProductGrid rendered with:', {
    productsCount: products?.length || 0,
    products: products,
    loading: loading,
    error: error
  });

  if (loading) {
    console.log('⏳ ProductGrid: Loading state');
    return <p className="text-center mt-6">Loading...</p>;
  }

  if (error) {
    console.error('❌ ProductGrid: Error state', error);
    
    // SAFELY extract error message
    const errorMessage = 
      (error && typeof error === 'object' && error.message) ? error.message :
      (typeof error === 'string') ? error :
      'An error occurred while loading products';
    
    return <p className="text-center mt-6 text-red-500">Error: {errorMessage}</p>;
  }

  if (!products || products.length === 0) {
    console.log('🔍 ProductGrid: No products found', {
      products: products,
      productsType: typeof products,
      isArray: Array.isArray(products)
    });
    return <p className="text-center mt-6 text-gray-500">No products found.</p>;
  }

  console.log('✅ ProductGrid: Rendering products', {
    count: products.length,
    firstProduct: products[0]
  });

  return (
    <div className="px-4 sm:px-8 md:px-12 lg:px-20 xl:px-32">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, index) => {
          console.log(`📊 Product ${index}:`, {
            id: product._id,
            name: product.name,
            price: product.price,
            image: product.images?.[0]?.url,
            hasImages: !!product.images?.length
          });
          
          return (
            <Link
              key={product._id}
              to={`/product/${product._id}`}
              className="block transition-transform hover:scale-105"
            >
              <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg">
                <div className="w-full aspect-square mb-4 overflow-hidden">
                  <img
                    src={product.images?.[0]?.url || "https://via.placeholder.com/500"}
                    alt={product.images?.[0]?.altText || product.name}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      console.error('🖼️ Image failed to load for product:', product._id);
                      e.target.src = "https://via.placeholder.com/500";
                    }}
                  />
                </div>
                <h3 className="text-sm mb-1 font-semibold">{product.name}</h3>
                <p className="text-gray-500 font-medium text-sm tracking-tighter">
                  LKR {product.price}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ProductGrid;