import React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { deleteProduct, fetchAdminProducts } from "../../redux/slices/adminProductSlice";
import * as XLSX from 'xlsx';

const ProductManagement = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector(
    (state) => state.adminProducts
  );
  const [isClient, setIsClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchAdminProducts());
    setIsClient(true);
  }, [dispatch]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete the product?")) {
      dispatch(deleteProduct(id));
    }
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Enhanced Excel Report with multiple worksheets
  const generateExcelReport = () => {
    // Use filtered products for the report if search is active, otherwise all products
    const productsToExport = searchTerm ? filteredProducts : products;
    
    // Prepare data for main products worksheet
    const reportData = productsToExport.map(product => ({
      'Product Name': product.name,
      'Price': product.price,
      'Discount Price': product.discountPrice || 'N/A',
      'SKU': product.sku,
      'Stock Quantity': product.countInStock || 0,
      'Category': product.category || 'N/A',
      'Brand': product.brand || 'N/A',
      'Status': (product.countInStock || 0) < 10 ? 'Low Stock' : 'In Stock',
      'Rating': product.rating || 'No ratings',
      'Reviews': product.numReviews || 0,
      'Featured': product.isFeatured ? 'Yes' : 'No',
      'Published': product.isPublished ? 'Yes' : 'No',
      'Created Date': product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Add main products worksheet
    const wsData = XLSX.utils.json_to_sheet(reportData);
    XLSX.utils.book_append_sheet(wb, wsData, "Products Data");

    // Create summary data
    const totalProducts = productsToExport.length;
    const lowStockCount = productsToExport.filter(p => (p.countInStock || 0) < 10).length;
    const outOfStockCount = productsToExport.filter(p => (p.countInStock || 0) === 0).length;
    const featuredCount = productsToExport.filter(p => p.isFeatured).length;
    const unpublishedCount = productsToExport.filter(p => !p.isPublished).length;
    const avgPrice = productsToExport.reduce((sum, p) => sum + p.price, 0) / totalProducts;
    
    const summaryData = [
      ['Product Report Summary', ''],
      ['Report Date', new Date().toLocaleDateString()],
      ['Total Products', totalProducts],
      ['Low Stock Items (<10)', lowStockCount],
      ['Out of Stock Items', outOfStockCount],
      ['Featured Products', featuredCount],
      ['Unpublished Products', unpublishedCount],
      ['Average Price', `LKR ${avgPrice.toFixed(2)}`],
      [''],
      ['Stock Status Distribution', 'Count'],
      ['In Stock', totalProducts - lowStockCount - outOfStockCount],
      ['Low Stock', lowStockCount],
      ['Out of Stock', outOfStockCount]
    ];
    
    // Add summary worksheet
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

    // Create category distribution data
    const categories = {};
    productsToExport.forEach(product => {
      const category = product.category || 'Uncategorized';
      categories[category] = (categories[category] || 0) + 1;
    });
    
    const categoryData = [['Category', 'Number of Products']];
    Object.entries(categories).forEach(([category, count]) => {
      categoryData.push([category, count]);
    });
    
    // Add categories worksheet
    const wsCategories = XLSX.utils.aoa_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(wb, wsCategories, "Categories");

    // Generate Excel file
    XLSX.writeFile(wb, `Advanced_Product_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // PDF Report Generation
  const generatePDFReport = () => {
    if (!isClient) return;
    
    // Use filtered products for the report if search is active, otherwise all products
    const productsToExport = searchTerm ? filteredProducts : products;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups for this site to generate PDF reports');
      return;
    }

    const totalProducts = productsToExport.length;
    const lowStockCount = productsToExport.filter(p => (p.countInStock || 0) < 10).length;
    const featuredCount = productsToExport.filter(p => p.isFeatured).length;
    const unpublishedCount = productsToExport.filter(p => !p.isPublished).length;
    const avgPrice = productsToExport.reduce((sum, p) => sum + p.price, 0) / totalProducts;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Product Management Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { margin-bottom: 30px; }
          .summary-grid { 
            display: grid; 
            grid-template-columns: repeat(2, 1fr); 
            gap: 15px; 
            margin-bottom: 20px;
          }
          .summary-item { 
            border: 1px solid #ddd; 
            padding: 15px; 
            border-radius: 5px;
            text-align: center;
          }
          .summary-number { font-size: 24px; font-weight: bold; }
          .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .table th, .table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          .table th { background-color: #f8f9fa; }
          .footer { margin-top: 30px; text-align: center; color: #666; font-size: 14px; }
          .low-stock { color: #dc3545; }
          .normal-stock { color: #28a745; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Product Management Report</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          ${searchTerm ? `<p>Filtered by search term: "${searchTerm}"</p>` : ''}
        </div>
        
        <div class="summary">
          <h2>Summary</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-number">${totalProducts}</div>
              <div>Total Products</div>
            </div>
            <div class="summary-item">
              <div class="summary-number low-stock">${lowStockCount}</div>
              <div>Low Stock Items</div>
            </div>
            <div class="summary-item">
              <div class="summary-number">${featuredCount}</div>
              <div>Featured Products</div>
            </div>
            <div class="summary-item">
              <div class="summary-number">${unpublishedCount}</div>
              <div>Unpublished Products</div>
            </div>
          </div>
          <p><strong>Average Price:</strong> LKR ${avgPrice.toFixed(2)}</p>
        </div>
        
        <h2>Product Details</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Price</th>
              <th>SKU</th>
              <th>Stock</th>
              <th>Category</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${productsToExport.map(product => `
              <tr>
                <td>${product.name}</td>
                <td>LKR ${product.price}</td>
                <td>${product.sku}</td>
                <td class="${(product.countInStock || 0) < 10 ? 'low-stock' : 'normal-stock'}">
                  ${product.countInStock || 0}
                </td>
                <td>${product.category || 'N/A'}</td>
                <td>${(product.countInStock || 0) < 10 ? 'Low Stock' : 'In Stock'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>This report was generated from the Product Management System</p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
  
  if (error) return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-semibold">Error:</p>
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Product Management</h2>
          <p className="text-gray-600 mt-1">Manage your product inventory and listings</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          
          
          <button
            onClick={generateExcelReport}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 极 01-2 2z" />
            </svg>
            Excel Report
          </button>
          
          <button
            onClick={generatePDFReport}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg font极ium transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m4 4h6a2 2 0 002-2极-4a2 2 0 00-2-2h-6a2 2 0 00-2 2v4a2 2 0 002 2zm0-8V5a2 2 0 012-2h6a2 2 0 012 2v8h-10z" />
            </svg>
            PDF Report
          </button>

          
          
          <Link
            to="/admin/products/add"
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </Link>
        </div>
      </div>

      {/* Search Bar and Stats Cards */}
      <div className="mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search products by name, SKU, category or brand..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{filteredProducts.length}</div>
            <div className="text-sm text-gray-600">Total Products</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-red-600">
              {filteredProducts.filter(p => (p.countInStock || 0) < 10).length}
            </div>
            <div className="text-sm text-gray-600">Low Stock</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {filteredProducts.filter(p => p.isFeatured).length}
            </div>
            <div className="text-sm text-gray-600">Featured</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">
              {filteredProducts.filter(p => !p.isPublished).length}
            </div>
            <div className="text-sm text-gray-600">Unpublished</div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-4 text-left text-xs font-semib极 text-gray-600 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.images?.[0]?.url ? (
                          <img 
                            src={product.images[0].url} 
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900 text-sm line-clamp-1">
                            {product.name}
                            {(product.countInStock || 0) < 10 && (
                              <span className="ml-2 text-red-500" title="Low Stock">
                                ⚠️
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{product.brand}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">LKR {product.price}</span>
                        {product.discountPrice && (
                          <span className="text-sm text-green-600 line-through">
                            LKR {product.discountPrice}
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {product.sku}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${
                        (product.countInStock || 0) < 10 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {product.countInStock || 0}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{product.category}</span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        (product.countInStock || 0) < 10 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {(product.countInStock || 0) < 10 ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/products/${product._id}/edit`}
                          className="inline-flex items-center px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors duration-200 text-sm font-medium"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors duration-200 text-sm font-medium"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2极7m16 0v5a2 2 0 01-2 2H6a2 2 极 01-2-2v-5m16 0h-16" />
                      </svg>
                      <p className="text-lg font-medium">
                        {searchTerm ? 'No products found matching your search' : 'No products found'}
                      </p>
                      <p className="mt-1">
                        {searchTerm ? 'Try a different search term' : 'Get started by adding your first product'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;