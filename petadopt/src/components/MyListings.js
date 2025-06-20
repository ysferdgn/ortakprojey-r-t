import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaPaw, FaDog, FaCat, FaDove } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      console.log('Fetching my listings...');
      const response = await axios.get('/api/pets/my-listings');
      console.log('Listings response:', response.data);
      setListings(response.data);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setError('Failed to load your listings: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/pets/${id}`);
      setListings(listings.filter(listing => listing._id !== id));
      setShowDeleteModal(false);
      setSelectedListing(null);
    } catch (error) {
      console.error('Error deleting listing:', error);
      setError('Failed to delete listing: ' + (error.response?.data?.message || error.message));
    }
  };

  const confirmDelete = (listing) => {
    setSelectedListing(listing);
    setShowDeleteModal(true);
  };

  const getPetIcon = (type) => {
    switch (type) {
      case 'dog':
        return <FaDog className="text-[#4CAF50]" />;
      case 'cat':
        return <FaCat className="text-[#4CAF50]" />;
      case 'bird':
        return <FaDove className="text-[#4CAF50]" />;
      default:
        return <FaPaw className="text-[#4CAF50]" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Pet Listings</h1>
          <Link
            to="/add-pet"
            className="px-4 py-2 bg-[#4CAF50] text-white rounded-md hover:bg-[#388E3C] flex items-center gap-2"
          >
            <FaPlus />
            Add New Listing
          </Link>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {listings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <FaPaw className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Listings Yet</h3>
            <p className="text-gray-600 mb-4">Start by adding your first pet listing</p>
            <Link
              to="/add-pet"
              className="px-4 py-2 bg-[#4CAF50] text-white rounded-md hover:bg-[#388E3C] flex items-center gap-2 mx-auto inline-flex"
            >
              <FaPlus />
              Add New Listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div key={listing._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="relative">
                  <img
                    src={listing.images && listing.images.length > 0 ? listing.images[0] : '/placeholder-pet.jpg'}
                    alt={listing.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTIwQzExMC40NTcgMTIwIDEyMCAxMTAuNDU3IDEyMCAxMDBDMTIwIDg5LjU0MjkgMTEwLjQ1NyA4MCAxMDAgODBDODkuNTQyOSA4MCA4MCA4OS41NDI5IDgwIDEwMEM4MCAxMTAuNDU3IDg5LjU0MjkgMTIwIDEwMCAxMjBaIiBmaWxsPSIjOENBRjUwIi8+CjxwYXRoIGQ9Ik0xMDAgMTQwQzExMC40NTcgMTQwIDEyMCAxMzAuNDU3IDEyMCAxMjBDMTIwIDEwOS41NDMgMTEwLjQ1NyAxMDAgMTAwIDEwMEM4OS41NDI5IDEwMCA4MCAxMDkuNTQzIDgwIDEyMEM4MCAxMzAuNDU3IDg5LjU0MjkgMTQwIDEwMCAxNDBaIiBmaWxsPSIjOENBRjUwIi8+Cjwvc3ZnPgo=';
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    {getPetIcon(listing.type)}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{listing.name}</h3>
                      <p className="text-gray-600">{listing.breed} • {listing.age} years old</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => window.location.href = `/pets/${listing._id}/edit`}
                        className="p-2 text-[#4CAF50] hover:text-[#388E3C]"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => confirmDelete(listing)}
                        className="p-2 text-red-500 hover:text-red-600"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{listing.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Status: <span className={listing.status === 'available' ? 'text-green-600' : 'text-gray-600'}>
                        {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                      </span>
                    </span>
                    <Link
                      to={`/pets/${listing._id}`}
                      className="text-[#4CAF50] hover:text-[#388E3C] text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedListing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Listing</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the listing for {selectedListing.name}? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedListing(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(selectedListing._id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings; 