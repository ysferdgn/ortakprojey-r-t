import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa';

const PetCard = ({ pet }) => {
  const { user, savedPets, toggleSavedPet, loading } = useAuth();
  const navigate = useNavigate();

  const isSaved = user ? savedPets.includes(pet._id) : false;

  const handleSaveClick = (e) => {
    e.preventDefault(); // Prevent navigating when clicking the save button
    if (!user) {
      navigate('/signin');
      return;
    }
    toggleSavedPet(pet._id);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 h-full flex flex-col">
      <div className="flex-grow">
        <Link to={`/pets/${pet._id}`} className="block">
          <div className="relative h-48">
            <img
              src={pet.images[0] || '/placeholder-pet.jpg'}
              alt={pet.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                pet.status === 'available' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                pet.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {pet.status.charAt(0).toUpperCase() + pet.status.slice(1)}
              </span>
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">{pet.name}</h3>
            <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
              <span className="mr-2">{pet.breed}</span>
              <span className="mx-2">•</span>
              <span>{pet.age} years old</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{pet.description}</p>
          </div>
        </Link>
      </div>
      <div className="p-4 pt-0 flex items-center gap-2">
        <Link
          to={`/pets/${pet._id}`}
          className="flex-grow text-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors duration-300"
        >
          View Details
        </Link>
        {user && (
          <button
            onClick={handleSaveClick}
            disabled={loading}
            className={`p-2 rounded-md transition-colors duration-300 text-2xl ${
              isSaved
                ? 'text-green-600 hover:text-green-700'
                : 'text-gray-400 hover:text-green-500'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save for later'}
          >
            {isSaved ? <FaBookmark /> : <FaRegBookmark />}
          </button>
        )}
      </div>
    </div>
  );
};

export default PetCard; 