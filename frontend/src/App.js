import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/login';
import Signup from './components/signup';
import Home from './components/Home';
import "./App.css";
import EditDetails from './components/EditDetails';





const App = () => {
  console.log(LandingPage, Login, Signup, Home);
  return (
    <Router>
      
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/edit-details" element={<EditDetails />} />
      </Routes>
      
    </Router>
  );
};

export default App;
