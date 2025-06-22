import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from './utils/axios';
import { FaPaw, FaFacebook, FaTwitter, FaInstagram, FaEnvelope, FaPhone } from 'react-icons/fa';
import './HomePage.css';
import PetCard from './components/PetCard';

const HomePage = () => {
  const [featuredPets, setFeaturedPets] = useState([]);
  const [recentAds, setRecentAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [featuredResponse, recentResponse] = await Promise.all([
          axios.get('/api/pets/featured').catch(() => ({ data: [] })),
          axios.get('/api/pets/recent').catch(() => ({ data: [] }))
        ]);
        
        setFeaturedPets(featuredResponse.data || []);
        setRecentAds(recentResponse.data || []);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section
        className="hero-section text-white text-center flex flex-col justify-center items-center -m-8" // Use negative margin to fill the padding from Layout
        style={{ backgroundImage: "url('/hero-pets.png')", minHeight: '50vh' }}
      >
        <div className="bg-black bg-opacity-50 p-10 rounded-lg">
          <h1 className="text-5xl font-bold mb-4">Find Your New Best Friend</h1>
          <p className="text-xl mb-8">Browse thousands of pets from shelters and rescues.</p>
          <Link to="/search" className="bg-[#4CAF50] text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-[#388E3C] transition-colors">
            Start Your Search
          </Link>
        </div>
      </section>

      {/* Featured Pets Section */}
      <section className="py-16">
        <div className="mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Featured Pets</h2>
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {featuredPets.map(pet => (
                <PetCard key={pet._id} pet={pet} />
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 bg-white -mx-8 px-8">
        <div className="mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="step">
              <div className="text-5xl text-[#4CAF50] mb-4">1</div>
              <h3 className="text-2xl font-semibold mb-2">Search</h3>
              <p className="text-gray-600">Find your perfect companion by searching our database of pets.</p>
            </div>
            <div className="step">
              <div className="text-5xl text-[#4CAF50] mb-4">2</div>
              <h3 className="text-2xl font-semibold mb-2">Meet</h3>
              <p className="text-gray-600">Arrange a meeting with the pet to see if it's a good match.</p>
            </div>
            <div className="step">
              <div className="text-5xl text-[#4CAF50] mb-4">3</div>
              <h3 className="text-2xl font-semibold mb-2">Adopt</h3>
              <p className="text-gray-600">Complete the adoption process and bring your new friend home.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Recent Ads Section */}
      <section className="py-16">
        <div className="mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Recently Added</h2>
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {recentAds.map(pet => (
                <PetCard key={pet._id} pet={pet} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 -m-8 mt-0 px-8">
        <div className="mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">PetAdopt</h3>
              <p className="text-gray-400">Connecting pets with loving homes. We are dedicated to finding forever families for animals in need.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="hover:text-[#4CAF50]">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-[#4CAF50]">Contact</Link></li>
                <li><Link to="/faq" className="hover:text-[#4CAF50]">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Info</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center"><FaEnvelope className="mr-2"/> contact@petadopt.com</li>
                <li className="flex items-center"><FaPhone className="mr-2"/> +1 (123) 456-7890</li>
              </ul>
              <div className="flex space-x-4 mt-4">
                <a href="#!" className="hover:text-[#4CAF50]"><FaFacebook size={24}/></a>
                <a href="#!" className="hover:text-[#4CAF50]"><FaTwitter size={24}/></a>
                <a href="#!" className="hover:text-[#4CAF50]"><FaInstagram size={24}/></a>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-6 text-center text-gray-500">
            <p>&copy; 2024 PetAdopt. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 