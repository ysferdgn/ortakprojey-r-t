import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaBars, FaTimes, FaHome, FaDog, FaUser, FaSignOutAlt, 
  FaSignInAlt, FaUserPlus, FaListAlt, FaPlusCircle, FaBookOpen, FaSearch, FaEnvelope
} from 'react-icons/fa';
import Header from './Header';

const Sidebar = ({ isExpanded, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = user 
    ? [
        { icon: <FaHome />, text: 'Ana Sayfa', path: '/' },
        { icon: <FaSearch />, text: 'Hayvan Ara', path: '/search' },
        { icon: <FaEnvelope />, text: 'Mesajlar', path: '/messages' },
        { icon: <FaListAlt />, text: 'İlanlarım', path: '/my-listings' },
        { icon: <FaPlusCircle />, text: 'İlan Ekle', path: '/add-pet' },
        { icon: <FaUser />, text: 'Profil', path: '/profile' },
        { icon: <FaBookOpen />, text: 'Rehber', path: '/pet-guide' },
      ]
    : [
        { icon: <FaHome />, text: 'Ana Sayfa', path: '/' },
        { icon: <FaSearch />, text: 'Hayvan Ara', path: '/search' },
        { icon: <FaBookOpen />, text: 'Rehber', path: '/pet-guide' },
        { icon: <FaSignInAlt />, text: 'Giriş Yap', path: '/signin' },
        { icon: <FaUserPlus />, text: 'Kayıt Ol', path: '/signup' },
      ];

  return (
    <div className={`fixed top-0 left-0 h-full bg-green-700 text-white transition-all duration-300 ease-in-out z-50 ${isExpanded ? 'w-64' : 'w-20'}`}>
      <div className="flex items-center justify-between p-4 h-16 border-b border-green-600">
        {isExpanded && <span className="text-2xl font-bold">PetAdopt</span>}
        <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-green-600">
            {isExpanded ? <FaTimes /> : <FaBars />}
        </button>
      </div>
      <nav className="mt-4">
        <ul>
          {navItems.map((item, index) => (
            <li key={index} className="px-4 py-2">
              <Link to={item.path} className="flex items-center p-2 rounded-md hover:bg-green-600">
                <div className="w-12 flex justify-center">{item.icon}</div>
                {isExpanded && <span className="ml-4">{item.text}</span>}
              </Link>
            </li>
          ))}
          {user && (
             <li className="px-4 py-2 absolute bottom-4 w-full">
               <button onClick={handleLogout} className="flex items-center p-2 w-full rounded-md hover:bg-green-600">
                <div className="w-12 flex justify-center"><FaSignOutAlt /></div>
                {isExpanded && <span className="ml-4">Çıkış Yap</span>}
               </button>
             </li>
          )}
        </ul>
      </nav>
    </div>
  );
};

const Layout = ({ children }) => {
  const [isSidebarExpanded, setSidebarExpanded] = useState(false);

  const toggleSidebar = () => {
    setSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      <Sidebar isExpanded={isSidebarExpanded} toggleSidebar={toggleSidebar} />
      <div className={`transition-all duration-300 ease-in-out ${isSidebarExpanded ? 'ml-64' : 'ml-20'}`}>
        <Header />
        <main>
            <div className="p-8">
                {children}
            </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 