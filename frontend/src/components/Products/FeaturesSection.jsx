import React from "react";
import { HiOutlineCreditCard, HiShoppingBag } from "react-icons/hi";
import { HiArrowPathRoundedSquare } from "react-icons/hi2";

const FeaturesSection = () => {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        
        {/* Feature 1 */}
        <div className="flex flex-col items-center">
          <div className="p-4 bg-yellow-100 rounded-full mb-4">
            <HiShoppingBag className="text-4xl text-yellow-600" />
          </div>
          <h4 className="text-lg font-semibold tracking-tight mb-2">
            FREE INTERNATIONAL SHIPPING
          </h4>
          <p className="text-gray-600 text-sm tracking-tight">
            On all orders over $100.00
          </p>
        </div>

        {/* You can copy and paste this block for more features */}
        

        {/* Feature 1 */}
        <div className="flex flex-col items-center">
          <div className="p-4 bg-yellow-100 rounded-full mb-4">
            <HiOutlineCreditCard className="text-4xl text-yellow-600" />
          </div>
          <h4 className="text-lg font-semibold tracking-tight mb-2">
           Secure Checkout
          </h4>
          <p className="text-gray-600 text-sm tracking-tight">
            100% Secured process
          </p>
        </div>

        {/* Feature 1 */}
        <div className="flex flex-col items-center">
          <div className="p-4 bg-yellow-100 rounded-full mb-4">
<HiArrowPathRoundedSquare className="text-4xl text-yellow-600" />
          </div>
          <h4 className="text-lg font-semibold tracking-tight mb-2">
           45 Days Return
          </h4>
          <p className="text-gray-600 text-sm tracking-tight">
            Money Back Gurantee
          </p>
        </div>


      </div>
    </section>
  );
};

export default FeaturesSection;
