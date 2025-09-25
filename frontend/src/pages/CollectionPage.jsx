import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaFilter } from "react-icons/fa";
import FilterSidebar from "../components/Products/FilterSidebar";
import SortOptions from "../components/Products/SortOptions";
import ProductGrid from "../components/Products/ProductGrid";
import { fetchProductsByFilters } from "../redux/slices/productsSlice";

const CollectionPage = () => {
  const { collection: routeCollection } = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const { products, loading, error } = useSelector((state) => state.products);
  const queryParams = Object.fromEntries([...searchParams]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Determine collection: default to "all" if no specific collection
  const collection = routeCollection ? routeCollection.toLowerCase() : "all";

  useEffect(() => {
    console.log("🔄 useEffect triggered");
    console.log("📌 Collection param from route:", routeCollection);
    console.log("📌 Computed collection to fetch:", collection);
    console.log("📌 Query params:", queryParams);

    const fetchData = async () => {
      setLocalLoading(true);
      console.log("🚀 Dispatching fetchProductsByFilters...");

      try {
        const result = await dispatch(fetchProductsByFilters({ collection, ...queryParams }));

        if (fetchProductsByFilters.fulfilled.match(result)) {
          console.log("✅ Products fetched successfully");
          console.log("📦 Number of products fetched:", result.payload?.length ?? 0);
        } else if (fetchProductsByFilters.rejected.match(result)) {
          console.error("❌ Fetch rejected:", result.error);
        }
      } catch (err) {
        console.error("💥 Dispatch error:", err);
      } finally {
        setLocalLoading(false);
        console.log("🏁 Dispatch finished");
      }
    };

    fetchData();
  }, [dispatch, collection, searchParams]);

  // Debug effect for products state changes
  useEffect(() => {
    console.log("📦 Products state updated:", {
      count: products?.length ?? 0,
      loading,
      error,
    });
  }, [products, loading, error]);

  const isLoading = loading || localLoading;

  if (isLoading) {
    console.log("⏳ Showing loading state...");
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-lg mb-2">Loading products...</p>
          <p className="text-sm text-gray-500">Collection: {collection || "All"}</p>
          <div className="mt-4 w-16 h-1 bg-blue-200 mx-auto rounded-full">
            <div className="h-1 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("❌ Showing error state:", error);
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-2">Error loading products</p>
          <p className="text-gray-600 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  console.log("✅ Rendering products grid with", products?.length ?? 0, "products");

  return (
    <div className="flex flex-col lg:flex-row relative min-h-screen">
      {/* Mobile Filter Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-20 right-4 z-50 bg-white border p-3 rounded-full shadow-lg flex items-center justify-center mb-4"
      >
        <FaFilter className="text-lg" />
        <span className="sr-only">Filters</span>
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-50 bg-white w-64 h-full shadow-lg transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:block ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-4 lg:hidden">
            <h3 className="text-lg font-semibold">Filters</h3>
            <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          <FilterSidebar />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 lg:px-6">
        {/* Header */}
        <div className="py-6 border-b">
          <h1 className="text-3xl font-bold text-gray-900 uppercase mb-2">
            {collection === "all" ? "ALL Collection" : `${collection} Collection`}
          </h1>
          <p className="text-gray-600">
            {products?.length ?? 0} product{products?.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Sort Options */}
        <div className="py-4">
          <SortOptions />
        </div>

        {/* Products Grid */}
        <div className="py-6">
          <ProductGrid products={products} loading={isLoading} error={error} />
        </div>

        
      </div>
    </div>
  );
};

export default CollectionPage;
