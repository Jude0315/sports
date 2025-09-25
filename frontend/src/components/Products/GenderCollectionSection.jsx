import React from 'react';
import WomensCollectionImage from "../../assets/womens-collection.webp";
import MensCollectionImage from "../../assets/mens-collection.webp";
import { Link } from 'react-router-dom';

const GenderCollectionSection = () => {
  return (
    <section className='py-16 px-4'>
      <div className='max-w-7xl mx-auto flex flex-col md:flex-row gap-8'>
        
        {/* Women's Collection */}
        <div className="relative flex-1 rounded-xl overflow-hidden shadow-lg">
          <img 
            src={WomensCollectionImage} 
            alt="Women's Collection" 
            className="w-full h-[450px] object-cover" 
          />
          <div className="absolute bottom-6 left-6 bg-white bg-opacity-90 p-4 rounded-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Women's Collection</h2>
            <Link 
              to="/collections/all?gender=Women" 
              className="text-gray-900 underline font-medium"
            >
              Shop Now
            </Link>
          </div>
        </div>

        {/* Men's Collection */}
        <div className="relative flex-1 rounded-xl overflow-hidden shadow-lg">
          <img 
            src={MensCollectionImage} 
            alt="Men's Collection" 
            className="w-full h-[450px] object-cover" 
          />
          <div className="absolute bottom-6 left-6 bg-white bg-opacity-90 p-4 rounded-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Men's Collection</h2>
            <Link 
              to="/collections/all?gender=Men" 
              className="text-gray-900 underline font-medium"
            >
              Shop Now
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};

export default GenderCollectionSection;
