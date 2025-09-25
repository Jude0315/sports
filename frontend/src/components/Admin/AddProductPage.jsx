import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../../redux/slices/adminProductSlice';
import axios from 'axios';

const AddProductPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.adminProducts);
  
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    countInStock: '',
    sku: '',
    category: '',
    brand: '',
    sizes: [],
    colors: [],
    collections: '',
    material: '',
    gender: '',
    images: [],
    isFeatured: false,
    isPublished: true
  });

  const [sizeInput, setSizeInput] = useState('');
  const [colorInput, setColorInput] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [uploading, setUploading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert string numbers to actual numbers
    const formattedData = {
      ...productData,
      price: Number(productData.price),
      discountPrice: productData.discountPrice ? Number(productData.discountPrice) : undefined,
      countInStock: Number(productData.countInStock),
      sizes: productData.sizes,
      colors: productData.colors
    };
    
    dispatch(createProduct(formattedData))
      .unwrap()
      .then(() => {
        navigate('/admin/products');
      })
      .catch((error) => {
        console.error('Failed to create product:', error);
      });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductData({
      ...productData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const addSize = () => {
    if (sizeInput.trim() && !productData.sizes.includes(sizeInput.trim())) {
      setProductData({
        ...productData,
        sizes: [...productData.sizes, sizeInput.trim()]
      });
      setSizeInput('');
    }
  };

  const removeSize = (sizeToRemove) => {
    setProductData({
      ...productData,
      sizes: productData.sizes.filter(size => size !== sizeToRemove)
    });
  };

  const addColor = () => {
    if (colorInput.trim() && !productData.colors.includes(colorInput.trim())) {
      setProductData({
        ...productData,
        colors: [...productData.colors, colorInput.trim()]
      });
      setColorInput('');
    }
  };

  const removeColor = (colorToRemove) => {
    setProductData({
      ...productData,
      colors: productData.colors.filter(color => color !== colorToRemove)
    });
  };

  const handleSizeInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSize();
    }
  };

  const handleColorInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addColor();
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setProductData((prevData) => ({
        ...prevData,
        images: [...prevData.images, { url: data.imageUrl, altText: "" }],
      }));
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setProductData({
      ...productData,
      images: productData.images.filter((_, i) => i !== index),
    });
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '📝' },
    { id: 'pricing', label: 'Pricing', icon: '💰' },
    { id: 'inventory', label: 'Inventory', icon: '📦' },
    { id: 'attributes', label: 'Attributes', icon: '🎨' },
    { id: 'media', label: 'Media', icon: '🖼️' },
    { id: 'organization', label: 'Organization', icon: '🏷️' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin/products')}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mr-6"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Products
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
              <p className="text-gray-600 mt-1">Create a new product for your store</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${productData.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {productData.isPublished ? 'Published' : 'Draft'}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${productData.isFeatured ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
              {productData.isFeatured ? 'Featured' : 'Standard'}
            </span>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            {tabs.map((tab, index) => (
              <div key={tab.id} className="flex items-center">
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg transform scale-110'
                      : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm">{tab.icon}</span>
                </button>
                {index < tabs.length - 1 && (
                  <div className={`w-16 h-0.5 mx-2 ${activeTab === tab.id ? 'bg-blue-600' : 'bg-gray-300'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            {tabs.map((tab) => (
              <span
                key={tab.id}
                className={`text-xs font-medium ${
                  activeTab === tab.id ? 'text-blue-600' : 'text-gray-500'
                }`}
                style={{ width: `${100 / tabs.length}%`, textAlign: 'center' }}
              >
                {tab.label}
              </span>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Basic Information</h2>
                <p className="text-gray-600">Enter the fundamental details about your product</p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={productData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="e.g., Premium Running Shoes"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={productData.description}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                    placeholder="Describe your product in detail..."
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div className="p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Pricing</h2>
                <p className="text-gray-600">Set your product pricing and discounts</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Regular Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">LKR</span>
                    <input
                      type="number"
                      name="price"
                      value={productData.price}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">LKR</span>
                    <input
                      type="number"
                      name="discountPrice"
                      value={productData.discountPrice}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {productData.discountPrice && productData.price && (
                    <div className="mt-3 text-sm text-green-600">
                      You're offering {((1 - productData.discountPrice / productData.price) * 100).toFixed(0)}% discount
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <div className="p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Inventory</h2>
                <p className="text-gray-600">Manage your product stock and identification</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU (Stock Keeping Unit) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={productData.sku}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="e.g., PROD-001"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="countInStock"
                    value={productData.countInStock}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="e.g., 100"
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Attributes Tab */}
          {activeTab === 'attributes' && (
            <div className="p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Product Attributes</h2>
                <p className="text-gray-600">Define the characteristics of your product</p>
              </div>
              
              {/* Sizes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sizes</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                    onKeyPress={handleSizeInputKeyPress}
                    placeholder="Add size (e.g., S, M, L, XL)"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={addSize}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {productData.sizes.map((size, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center text-sm">
                      {size}
                      <button
                        type="button"
                        onClick={() => removeSize(size)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                  {productData.sizes.length === 0 && (
                    <p className="text-gray-500 text-sm">No sizes added yet</p>
                  )}
                </div>
              </div>

              {/* Colors */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Colors</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    onKeyPress={handleColorInputKeyPress}
                    placeholder="Add color (e.g., Red, Blue, Green)"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={addColor}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {productData.colors.map((color, index) => (
                    <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full flex items-center text-sm">
                      {color}
                      <button
                        type="button"
                        onClick={() => removeColor(color)}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                  {productData.colors.length === 0 && (
                    <p className="text-gray-500 text-sm">No colors added yet</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
                  <input
                    type="text"
                    name="material"
                    value={productData.material}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="e.g., Cotton, Polyester"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    name="gender"
                    value={productData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="">Select Gender</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                    <option value="Kids">Kids</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Media Tab */}
          {activeTab === 'media' && (
            <div className="p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Product Media</h2>
                <p className="text-gray-600">Upload images to showcase your product</p>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                <div className="max-w-md mx-auto">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600 mb-4">Drag & drop images here or click to browse</p>
                  <input
                    type="file"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                  >
                    {uploading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Select Images
                      </>
                    )}
                  </label>
                </div>
              </div>

              {productData.images.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Product Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {productData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.url}
                          alt={image.altText || "Product Image"}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Organization Tab */}
          {activeTab === 'organization' && (
            <div className="p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Organization</h2>
                <p className="text-gray-600">Categorize and organize your product</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={productData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="e.g., Shoes, Apparel"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={productData.brand}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="e.g., Nike, Adidas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Collection</label>
                  <input
                    type="text"
                    name="collections"
                    value={productData.collections}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="e.g., Summer 2023"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Visibility</h3>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isPublished"
                      checked={productData.isPublished}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-gray-700">Publish product</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={productData.isFeatured}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-gray-700">Feature this product</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Navigation and Action Buttons */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex justify-between items-center">
            <div className="flex space-x-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => navigate('/admin/products')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200 flex items-center shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Product...
                  </>
                ) : (
                  'Create Product'
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">Error: {error}</p>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddProductPage;