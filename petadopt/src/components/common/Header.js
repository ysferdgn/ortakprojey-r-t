import React from 'react';
import { FaPaw } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-green-100 p-4 shadow-sm">
      <div className="flex items-center max-w-7xl mx-auto">
        <FaPaw className="text-3xl text-green-700" />
        <Link to="/" className="text-2xl font-bold text-green-800 ml-3">
          PetAdopt
        </Link>
      </div>
    </header>
  );
};

export default Header; 