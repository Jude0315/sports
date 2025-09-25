import React, { useRef, useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import axios from "axios";

const NewArrivals = () => {
  const [newArrivals, setNewArrivals] = useState([]);
  const scrollRef = useRef(null);

  // Fetch new arrivals from backend
  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/new-arrivals`
        );
        setNewArrivals(response.data);
      } catch (error) {
        console.error("Failed to fetch new arrivals:", error);
      }
    };
    fetchNewArrivals();
  }, []);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <section>
      <div className="container mx-auto text-center mb-10 relative px-4">
        <h2 className="text-3xl font-bold mb-4">Explore the New Arrivals</h2>
        <p className="text-lg text-gray-600 mb-8">
          Discover the latest styles straight off the runway — freshly added to
          keep your wardrobe on the cutting edge of sporting fashion.
        </p>

        {/* Scroll Buttons */}
        <div className="absolute right-4 top-0 flex space-x-2 mb-2 z-10">
          <button
            onClick={scrollLeft}
            className="p-2 rounded border bg-white text-black hover:bg-gray-100 shadow"
          >
            <FiChevronLeft className="text-2xl" />
          </button>
          <button
            onClick={scrollRight}
            className="p-2 rounded border bg-white text-black hover:bg-gray-100 shadow"
          >
            <FiChevronRight className="text-2xl" />
          </button>
        </div>

        {/* Scrollable Product List */}
        <div ref={scrollRef} className="relative overflow-x-auto scrollbar-hide px-12">
          <div className="flex space-x-6">
            {newArrivals.length > 0 ? (
              newArrivals.map((product) => (
                <Link to={`/product/${product._id}`} key={product._id}>
                  <div className="flex-shrink-0 w-64 h-72 rounded-2xl overflow-hidden relative group cursor-pointer">
                    <img
                      src={product.images?.[0]?.url}
                      alt={product.images?.[0]?.altText || product.name}
                      className="w-full h-full object-cover rounded-2xl transition duration-300 group-hover:blur-sm"
                    />
                    <div className="absolute bottom-3 left-3 bg-white bg-opacity-90 backdrop-blur-md p-3 rounded-lg text-center w-[90%] opacity-0 group-hover:opacity-100 transition duration-300">
                      <p className="font-semibold text-gray-900">{product.name}</p>
                      <p className="text-gray-700">${product.price}</p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-500">No new arrivals available.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
