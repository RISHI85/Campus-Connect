import React from 'react';
import Profile from './profile.jsx';
import './navbar.css'; // Assuming your custom styles

const Navbar = ({ onToggleHistory }) => {
  return (
    <div className="navbar">
      {/* Left side: Logo and Clock */}
      <div className="navbar-left">
        <button className="clock-button" onClick={onToggleHistory}>🕘</button>
        <img src="image.png" className="imagelogo" alt="Campus Connect Logo" />
        
        <h1 className="logo-text">Campus Connect</h1>
      </div>

      {/* Right side: Profile */}
      <div className="navbar-right">
        <Profile />
      </div>
    </div>
  );
};

export default Navbar;
