// src/components/Products/ProductCard.jsx
import React, { useState } from "react";
import { toast } from "sonner";

const ProductCard = ({ product }) => {
  const [mainImage, setMainImage] = useState(
    product.images?.[0]?.url || ""
  );
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast.error("Please select a size and color before adding to cart.", {
        duration: 2000,
      });
      return;
    }

    setIsButtonDisabled(true);
    setTimeout(() => {
      toast.success("Product added successfully", { duration: 2000 });
      setIsButtonDisabled(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col md:flex-row items-start gap-8 p-6 max-w-6xl mx-auto bg-white shadow-lg rounded-xl">
      {/* Left: Image Section */}
      <div className="w-full md:w-1/2">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-auto rounded-lg object-cover"
        />
        <div className="flex gap-3 mt-4">
          {product.images.map((img, index) => (
            <img
              key={index}
              src={img.url}
              alt={img.altText || product.name}
              onClick={() => setMainImage(img.url)}
              className={`w-20 h-20 cursor-pointer border-2 rounded-lg object-cover ${
                mainImage === img.url ? "border-blue-600" : "border-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Right: Details Section */}
      <div className="w-full md:w-1/2 space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
        <p className="text-xl text-red-600 font-semibold">
          ${product.price.toFixed(2)}
          {product.originalPrice && (
            <span className="line-through text-gray-500 text-lg ml-2">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </p>
        <p className="text-gray-600">{product.description}</p>

        <div className="text-sm text-gray-700">
          <p>
            <strong>Brand:</strong> {product.brand}
          </p>
          <p>
            <strong>Material:</strong> {product.material}
          </p>
        </div>

        {/* Color Selection */}
        {product.colors && (
          <div className="mt-4">
            <label className="block font-medium mb-1">Color:</label>
            <div className="flex gap-3">
              {product.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 cursor-pointer transition ${
                    selectedColor === color ? "border-black" : "border-gray-300"
                  }`}
                  style={{ backgroundColor: color.toLowerCase() }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Size Selection */}
        {product.sizes && (
          <div>
            <label className="block font-medium mb-1">Size:</label>
            <div className="flex gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
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
        )}

        {/* Quantity */}
        <div>
          <label className="block font-medium mb-1">Quantity:</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
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
  );
};

export default ProductCard;
