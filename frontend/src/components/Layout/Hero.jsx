import React from 'react';
import { Link } from 'react-router-dom'; // ✅ Add this
import heroImg from "../../assets/view-football-shoes.jpg";

const Hero = () => {
  return (
    <section className='relative'>
      {/* Background Image */}
      <img
        src={heroImg}
        alt="Football shoes"
        className='w-full h-[400px] md:h-[600px] lg:h-[750px] object-cover'
      />

      {/* Black Overlay */}
      <div className='absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center'>
        <div className='text-center text-white p-6'>
          <h1 className='text-4xl md:text-9xl font-bold tracking-tighter uppercase mb-4'>
            Fearless <br /> Performance
          </h1>
          <p className='text-sm tracking-tighter md:text-lg mb-6'>
            Unleash the beast inside you!, with fast island wide shipping
          </p>
          <Link
            to="a"
            className="bg-white text-gray-950 px-6 py-2 rounded-sm text-lg"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
