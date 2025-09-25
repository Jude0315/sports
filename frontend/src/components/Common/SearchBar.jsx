import React, { useState } from 'react';
import { HiMagnifyingGlass, HiMiniXMark } from 'react-icons/hi2';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { setFilters } from '../../redux/slices/productsSlice'; // Adjust path as needed
import { fetchProductsByFilters } from '../../redux/slices/productsSlice'; // Adjust path as needed

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();


  const handleSearchToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSearch = (e)=>{

    e.preventDefault();
    dispatch(setFilters({ search: searchTerm }));
    dispatch(fetchProductsByFilters({ search: searchTerm }));
    navigate(`/collections/all?search=${searchTerm}`);
    
    setIsOpen(false);
  }

  return (
    <div className="relative z-50">
      {isOpen ? (
        <form 
  onSubmit={handleSearch}
  className="fixed top-0 left-0 w-full h-24 bg-white flex items-center justify-center shadow-md transition-all duration-300"
>
  <div className="relative w-1/2">
    <input
      type="text"
      placeholder="Search"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="bg-gray-100 px-4 py-2 pl-4 pr-12 rounded-lg focus:outline-none w-full placeholder:text-gray-700"
    />
    
    {/*  Submit button without onClick */}
    <button
      type="submit"
      className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
    >
      <HiMagnifyingGlass className="h-5 w-5" />
    </button>
  </div>

  {/*  Don't close the form on submit */}
  {/* Keep close button separate */}
  <button
    type="button"
    onClick={handleSearchToggle}
    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
  >
    <HiMiniXMark className="h-6 w-6" />
  </button>
</form>

      ) : (
        <button onClick={handleSearchToggle}>
          <HiMagnifyingGlass className="h-6 w-6 text-gray-800" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
