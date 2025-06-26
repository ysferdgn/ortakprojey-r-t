import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from './utils/axios';
import { FaPaw, FaFacebook, FaTwitter, FaInstagram, FaEnvelope, FaPhone, FaHome } from 'react-icons/fa';
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
      {/* Page Title */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <FaHome className="text-4xl text-gray-500 dark:text-gray-400" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Ana Sayfa - Sahiplendirme İlanları</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Yeni bir dost arıyorsan, aşağıdaki ilanlara göz atabilirsin.</p>
          </div>
        </div>
      </div>

      {/* Recent Ads Section */}
      <section>
        <div className="mx-auto">
          {loading ? (
            <div className="text-center dark:text-gray-300">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {recentAds.map(pet => (
                <PetCard key={pet._id} pet={pet} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage; 