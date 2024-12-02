import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import '../styles/Home.css'; // Ensure this path is correct
import logoSchool from '../assets/logoSchool.png'; // Replace with your actual school logo path
import logoUSTP from '../assets/logoUSTP.png';     // Replace with your actual USTP logo path

const Home = () => {
  const [showMenu, setShowMenu] = useState(false);

  // Function to toggle popup menu visibility
  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="menu-icon" onClick={toggleMenu}>☰</div>
        <h1>Home</h1>
      </header>

      <div className={`side-menu ${showMenu ? 'active' : ''}`}>
        <button className="close-btn" onClick={toggleMenu}>Close</button>
        <ul>
          <li><Link to="/record" onClick={toggleMenu}>Record</Link></li>
          <li><Link to="/Attendance" onClick={toggleMenu}>Attendance</Link></li>
          <li><Link to="/Student" onClick={toggleMenu}>Student</Link></li>
          <li><Link to="/Profile" onClick={toggleMenu}>Profile</Link></li>
        </ul>
      </div>

      <div className="home-content">
        <h2>QR-Based Attendance with Parental SMS Alert</h2>
        
        {/* Add logos here */}
        <div className="logo-container">
          <img src={logoSchool} alt="logoSchool" className="logo" />
          <img src={logoUSTP} alt="logoUSTP" className="logo" />
        </div>

        {/* Add your other content here */}
      </div>
    </div>
  );
};

export default Home;

