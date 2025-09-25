import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

import ProductGrid from "./ProductGrid";
import {
  fetchProductDetails,
  fetchSimilarProducts,
} from "../../redux/slices/productsSlice";
import { addToCart } from "../../redux/slices/cartSlice";

const ProductDetails = ({ productId }) => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { selectedProduct, loading, error, similarProducts } = useSelector(
    (state) => state.products
  );
  const { userId, guestId } = useSelector((state) => state.auth);

  const productFetchId = productId || id;

  // Initialize mainImage as null to prevent empty src warning
  const [mainImage, setMainImage] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // Debugging useEffect hooks
  useEffect(() => {
    console.log('🛍️ ProductDetails component mounted');
    console.log('📦 Product ID to fetch:', productFetchId);
    console.log('⭐ Selected Product in state:', selectedProduct);
    console.log('👥 Similar Products in state:', similarProducts);
    console.log('⏳ Loading state:', loading);
    console.log('❌ Error state:', error);
  }, []);

  useEffect(() => {
    console.log('🔄 Selected Product updated:', selectedProduct);
  }, [selectedProduct]);

  useEffect(() => {
    console.log('🔄 Similar Products updated:', {
      count: similarProducts.length,
      products: similarProducts
    });
  }, [similarProducts]);

  useEffect(() => {
    console.log('🔄 Loading state updated:', loading);
  }, [loading]);

  useEffect(() => {
    console.log('🔄 Error state updated:', error);
  }, [error]);

  // Fetch product details and similar products
  useEffect(() => {
    if (productFetchId) {
      console.log('🚀 Fetching product details for ID:', productFetchId);
      dispatch(fetchProductDetails(productFetchId));
      
      console.log('🚀 Fetching similar products for ID:', productFetchId);
      dispatch(fetchSimilarProducts({ id: productFetchId }));
    }
  }, [dispatch, productFetchId]);

  // Set main image when product loads
  useEffect(() => {
    if (selectedProduct?.images?.length > 0) {
      console.log('🖼️ Setting main image:', selectedProduct.images[0].url);
      setMainImage(selectedProduct.images[0].url);
    }
  }, [selectedProduct]);

  const handleQuantityChange = (action) => {
    console.log('🔢 Quantity change:', action, 'Current quantity:', quantity);
    if (action === "plus") setQuantity((prev) => prev + 1);
    if (action === "minus" && quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handleAddToCart = () => {
    console.log('🛒 Add to cart clicked', {
      productId: productFetchId,
      quantity,
      selectedSize,
      selectedColor
    });

    if (!selectedSize || !selectedColor) {
      console.log('❌ Missing size or color selection');
      toast.error("Please select a size and color before adding to cart.", {
        duration: 2000,
      });
      return;
    }

    setIsButtonDisabled(true);
    console.log('⏳ Adding to cart...');

    dispatch(
      addToCart({
        productId: productFetchId,
        quantity,
        size: selectedSize,
        color: selectedColor,
        guestId,
        userId,
      })
    )
      .then(() => {
        console.log('✅ Product added to cart successfully');
        toast.success("Product added to cart!", {
          duration: 1000,
        });
      })
      .catch((error) => {
        console.error('❌ Add to cart failed:', error);
      })
      .finally(() => {
        console.log('🔄 Re-enabling add to cart button');
        setIsButtonDisabled(false);
      });
  };

  // Loading/Error handling
  if (loading && !selectedProduct) {
    console.log('⏳ Loading product details...');
    return <p>Loading...</p>;
  }
  
  if (error) {
    console.error('❌ Product details error:', error);
    return <p>Error: {error}</p>;
  }
  
  if (!selectedProduct) {
    console.log('❓ Product not found in state');
    return (
      <div className="text-center text-red-500 p-10">Product not found</div>
    );
  }

  console.log('🎨 Rendering product details:', selectedProduct.name);

  return (
    <>
      {/* Product Details Section */}
      <div className="flex flex-col md:flex-row items-start gap-8 p-6 max-w-6xl mx-auto bg-white shadow-lg rounded-xl">
        {/* Left: Image Section */}
        <div className="w-full md:w-1/2">
          {mainImage && (
            <img
              src={mainImage}
              alt={selectedProduct.name || "Product"}
              className="w-full h-auto rounded-lg object-cover"
            />
          )}

          <div className="flex gap-3 mt-4">
            {selectedProduct?.images?.map((img, index) => (
              <img
                key={index}
                src={img.url || "https://via.placeholder.com/100"}
                alt={img.altText || selectedProduct.name}
                onClick={() => {
                  console.log('🖼️ Changing main image to:', img.url);
                  setMainImage(img.url);
                }}
                className={`w-20 h-20 cursor-pointer border-2 rounded-lg object-cover ${
                  mainImage === img.url ? "border-blue-600" : "border-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right: Details Section */}
        <div className="w-full md:w-1/2 space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {selectedProduct.name}
          </h2>
          <p className="text-xl text-red-600 font-semibold">
            LKR {selectedProduct.price.toFixed(2)}
            {selectedProduct.discountPrice && (
              <span className="line-through text-gray-500 text-lg ml-2">
                LKR {selectedProduct.discountPrice.toFixed(2)}
              </span>
            )}
          </p>
          <p className="text-gray-600">{selectedProduct.description}</p>

          <div className="text-sm text-gray-700">
            <p>
              <strong>Brand:</strong> {selectedProduct.brand}
            </p>
            <p>
              <strong>Material:</strong> {selectedProduct.material}
            </p>
          </div>

          {/* Color Selection */}
          <div className="mt-4">
            <label className="block font-medium mb-1">Color:</label>
            <div className="flex gap-3">
              {selectedProduct.colors?.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    console.log('🎨 Color selected:', color);
                    setSelectedColor(color);
                  }}
                  className={`w-8 h-8 rounded-full border-2 cursor-pointer transition ${
                    selectedColor === color ? "border-black" : "border-gray-300"
                  }`}
                  style={{ backgroundColor: color.toLowerCase() }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div>
            <label className="block font-medium mb-1">Size:</label>
            <div className="flex gap-2">
              {selectedProduct.sizes?.map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    console.log('📏 Size selected:', size);
                    setSelectedSize(size);
                  }}
                  className={`px-3 py-1 border rounded cursor-pointer transition ${
                    selectedSize === size
                      ? "bg-black text-white border-black"
                      : "bg-white text-black border-gray-300"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block font-medium mb-1">Quantity:</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => {
                const newQuantity = Number(e.target.value);
                console.log('🔢 Quantity changed to:', newQuantity);
                setQuantity(newQuantity);
              }}
              className="p-2 border rounded w-24"
            />
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isButtonDisabled}
            className={`mt-4 px-6 py-3 bg-black text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${
              !isButtonDisabled ? "hover:bg-yellow-600" : ""
            }`}
          >
            {isButtonDisabled ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>

      {/*You may also like Section - with consistent container styling*/}
<div className="container mx-auto mt-12 px-4 sm:px-6">
  <div className="bg-white shadow-lg rounded-xl p-6">
    <h2 className="text-3xl text-center font-bold mb-4">
      You May Also Like
    </h2>
    {similarProducts?.length > 0 ? (
      <>
        <p className="text-center text-sm text-gray-500 mb-6">
          
        </p>
        <ProductGrid products={similarProducts} />
      </>
    ) : loading ? (
      <p className="text-center text-gray-500 py-8">Loading similar products...</p>
    ) : (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-2">No similar products found</p>
        <p className="text-sm text-gray-400">
          Check out our other collections
        </p>
      </div>
    )}
  </div>
</div>
    </>
  );
};

export default ProductDetails;