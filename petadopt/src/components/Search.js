import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FaSearch, FaFilter, FaPaw, FaDog, FaCat, FaDove, FaHome } from 'react-icons/fa';
import axios from '../utils/axios';

const useQuery = () => new URLSearchParams(useLocation().search);

const Search = () => {
  const query = useQuery();
  const location = useLocation();
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Her zaman URL'den oku
  const filters = {
    type: query.get('type') || '',
    breed: query.get('breed') || '',
    age: query.get('age') || '',
    gender: query.get('gender') || '',
    size: query.get('size') || '',
    search: query.get('search') || ''
  };

  useEffect(() => {
    setLoading(true);
    // Sadece dolu olanları gönder
    const params = {};
    Object.keys(filters).forEach(key => {
      if (filters[key]) params[key] = filters[key];
    });
    axios.get('/api/pets/search', { params })
      .then(res => setPets(res.data))
      .finally(() => setLoading(false));
  }, [location.search]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const params = new URLSearchParams(location.search);
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    navigate(`${location.pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(location.search);
    const searchValue = e.target.elements.search.value;
    if (searchValue) {
      params.set('search', searchValue);
    } else {
      params.delete('search');
    }
    navigate(`${location.pathname}?${params.toString()}`);
  };

  const getPetIcon = (type) => {
    switch (type) {
      case 'dog': return <FaDog className="text-[#4CAF50]" />;
      case 'cat': return <FaCat className="text-[#4CAF50]" />;
      case 'bird': return <FaDove className="text-[#4CAF50]" />;
      default: return <FaPaw className="text-[#4CAF50]" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Find Your Perfect Pet</h1>
            <p className="mt-2 text-gray-600">Search through our database of pets available for adoption</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 bg-[#4CAF50] text-white rounded-md hover:bg-[#388E3C] transition-colors text-lg font-medium"
            title="Ana Menüye Dön"
          >
            <FaHome className="text-2xl" />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                name="search"
                defaultValue={filters.search}
                placeholder="Search by name, breed, or description..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md flex items-center gap-2 hover:bg-gray-50"
          >
            <FaFilter />
            Filters
          </button>
        </form>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                >
                  <option value="">All Types</option>
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="bird">Bird</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <select
                  name="age"
                  value={filters.age}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                >
                  <option value="">Any Age</option>
                  <option value="puppy">Puppy/Kitten (0-1 year)</option>
                  <option value="young">Young (1-3 years)</option>
                  <option value="adult">Adult (3-7 years)</option>
                  <option value="senior">Senior (7+ years)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                <select
                  name="size"
                  value={filters.size}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                >
                  <option value="">Any Size</option>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading pets...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => (
              <div key={pet._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <Link to={`/pets/${pet._id}`}>
                  <img
                    src={pet.images && pet.images.length > 0 ? pet.images[0] : '/placeholder-pet.jpg'}
                    alt={pet.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src='/placeholder-pet.jpg'; }}
                  />
                </Link>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{pet.name}</h3>
                    {getPetIcon(pet.type)}
                  </div>
                  <p className="text-gray-600 mb-2">{pet.breed} • {pet.age} years old</p>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{pet.description}</p>
                  <Link
                    to={`/pets/${pet._id}`}
                    className="w-full block text-center px-4 py-2 bg-[#4CAF50] text-white rounded-md hover:bg-[#388E3C] transition-colors"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && pets.length === 0 && (
          <div className="text-center py-12">
            <FaPaw className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No pets found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search; 