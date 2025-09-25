import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const FilterSidebar = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    category: "",
    gender: "",
    color: "",
    size: "",
    material: "",
    brand: "",
    collection: "",
    minPrice: "",
    maxPrice: ""
  });

  // Filter options based on your actual product data
  const categories = ["Football", "Basketball", "Running", "Tennis", "Gym"];
  const genders = ["Men", "Women"];
  const brands = ["Nike", "Adidas", "Puma", "Umbro", "Under Armour", "Reebok", "Babolat", "Manduka", "ToneUp"];
  const collections = [
    "Training Essentials", "Running Essentials", "Court Elite", "Match Essentials",
    "Active Wear", "Elite Collection", "Women Pro Series", "Goalkeeping Essentials",
    "Training Wear", "Court Essentials", "League Wear", "Strength Training",
    "Training Gear", "Performance Gear", "Court Legends"
  ];
  const materials = [
    "Polyester", "Spandex", "Mesh", "Rubber", "Cotton", "Nylon", "Synthetic",
    "Leather", "TPE", "Graphite", "Carbon", "Latex", "Foam", "Steel", "Vinyl"
  ];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const colors = ["Black", "White", "Red", "Blue", "Green", "Gray", "Yellow", "Pink", "Orange", "Purple"];

  useEffect(() => {
    const params = Object.fromEntries([...searchParams]);
    setFilters({
      category: params.category || "",
      gender: params.gender || "",
      color: params.color || "",
      size: params.size || "",
      material: params.material || "",
      brand: params.brand || "",
      collection: params.collection || "",
      minPrice: params.minPrice || "",
      maxPrice: params.maxPrice || ""
    });
  }, [searchParams]);

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    updateURLParams(newFilters);
  };

  const handleClearFilter = (filterType) => {
    const newFilters = { ...filters, [filterType]: "" };
    setFilters(newFilters);
    updateURLParams(newFilters);
  };

  const updateURLParams = (newFilters) => {
    const params = new URLSearchParams();
    
    Object.keys(newFilters).forEach((key) => {
      if (newFilters[key]) {
        params.append(key, newFilters[key]);
      }
    });

    setSearchParams(params);
  };

  const clearAllFilters = () => {
    const emptyFilters = {
      category: "", gender: "", color: "", size: "", 
      material: "", brand: "", collection: "", minPrice: "", maxPrice: ""
    };
    setFilters(emptyFilters);
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="w-64 p-4 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Filters</h2>
        <button
          onClick={clearAllFilters}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Clear All
        </button>
      </div>

      {/* Sport Category Filter */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Sport Category</h3>
          {filters.category && (
            <button
              onClick={() => handleClearFilter('category')}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category} className="flex items-center">
              <input
                type="radio"
                name="category"
                checked={filters.category === category}
                onChange={() => handleFilterChange('category', category)}
                className="mr-2 h-4 w-4 text-blue-500"
              />
              <span className="text-sm">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Gender Filter */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Gender</h3>
          {filters.gender && (
            <button
              onClick={() => handleClearFilter('gender')}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-2">
          {genders.map((gender) => (
            <label key={gender} className="flex items-center">
              <input
                type="radio"
                name="gender"
                checked={filters.gender === gender}
                onChange={() => handleFilterChange('gender', gender)}
                className="mr-2 h-4 w-4 text-blue-500"
              />
              <span className="text-sm">{gender}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Brand</h3>
          {filters.brand && (
            <button
              onClick={() => handleClearFilter('brand')}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-2">
          {brands.map((brand) => (
            <label key={brand} className="flex items-center">
              <input
                type="radio"
                name="brand"
                checked={filters.brand === brand}
                onChange={() => handleFilterChange('brand', brand)}
                className="mr-2 h-4 w-4 text-blue-500"
              />
              <span className="text-sm">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Collection Filter */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Collection</h3>
          {filters.collection && (
            <button
              onClick={() => handleClearFilter('collection')}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-2">
          {collections.map((collection) => (
            <label key={collection} className="flex items-center">
              <input
                type="radio"
                name="collection"
                checked={filters.collection === collection}
                onChange={() => handleFilterChange('collection', collection)}
                className="mr-2 h-4 w-4 text-blue-500"
              />
              <span className="text-sm">{collection}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Size Filter */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Size</h3>
          {filters.size && (
            <button
              onClick={() => handleClearFilter('size')}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => handleFilterChange('size', size)}
              className={`px-2 py-1 text-xs border rounded text-center ${
                filters.size === size
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-gray-300 hover:border-black"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Material Filter */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Material</h3>
          {filters.material && (
            <button
              onClick={() => handleClearFilter('material')}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-2">
          {materials.map((material) => (
            <label key={material} className="flex items-center">
              <input
                type="radio"
                name="material"
                checked={filters.material === material}
                onChange={() => handleFilterChange('material', material)}
                className="mr-2 h-4 w-4 text-blue-500"
              />
              <span className="text-sm">{material}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Color Filter */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Color</h3>
          {filters.color && (
            <button
              onClick={() => handleClearFilter('color')}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => handleFilterChange('color', color)}
              className={`w-6 h-6 rounded-full border-2 cursor-pointer ${
                filters.color === color ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-300"
              }`}
              style={{ backgroundColor: color.toLowerCase() }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Price Range</h3>
          {(filters.minPrice || filters.maxPrice) && (
            <button
              onClick={() => handleClearFilter(['minPrice', 'maxPrice'])}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="price"
              checked={!filters.minPrice && !filters.maxPrice}
              onChange={() => {
                handleFilterChange('minPrice', '');
                handleFilterChange('maxPrice', '');
              }}
              className="mr-2 h-4 w-4 text-blue-500"
            />
            All Prices
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="price"
              checked={filters.maxPrice === "50"}
              onChange={() => {
                handleFilterChange('minPrice', '');
                handleFilterChange('maxPrice', '50');
              }}
              className="mr-2 h-4 w-4 text-blue-500"
            />
            Under $50
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="price"
              checked={filters.minPrice === "50" && filters.maxPrice === "100"}
              onChange={() => {
                handleFilterChange('minPrice', '50');
                handleFilterChange('maxPrice', '100');
              }}
              className="mr-2 h-4 w-4 text-blue-500"
            />
            $50 - $100
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="price"
              checked={filters.minPrice === "100"}
              onChange={() => {
                handleFilterChange('minPrice', '100');
                handleFilterChange('maxPrice', '');
              }}
              className="mr-2 h-4 w-4 text-blue-500"
            />
            Over $100
          </label>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;