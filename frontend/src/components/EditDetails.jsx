import React, { useState, useEffect } from "react";
import "./EditDetails.css";
import axios from "axios";

const EditProfile = () => {
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    mobile: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Token:", token);
        const response = await axios.get("http://localhost:5000/user-details", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Check for each field and only set data if available
        setUserData({
          username: response.data.username || "",  // Empty if not available
          email: response.data.email || "",        // Empty if not available
          mobile: response.data.mobile || "",      // Empty if not available
        });
      } catch (error) {
        console.error("Error fetching user details:", error);
        if (error.response) {
          console.error("Response error:", error.response.data);
          console.error("Response status:", error.response.status);
        } else if (error.request) {
          console.error("Request error:", error.request);
        } else {
          console.error("Error message:", error.message);
        }
      }
    };
    fetchUserDetails();
  }, []);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:5000/update-user", userData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="edit-box">
      <div className="profile-pic">
        <img src="/profile_image.png" alt="Profile" />
      </div>
      <h2 className='heading'>Edit Profile</h2>
      <label>Username</label>
      <input
        type="text"
        name="username"
        value={userData.username}
        onChange={handleChange}
        disabled={!isEditing}
      />
      <label>Email</label>
      <input
        type="email"
        name="email"
        value={userData.email}
        onChange={handleChange}
        disabled={!isEditing}
      />
      <label>Mobile Number</label>
      <input
        type="text"
        name="mobile"
        value={userData.mobile}
        onChange={handleChange}
        disabled={!isEditing}
      />

      {!isEditing ? (
        <button className="edit-btn" onClick={() => setIsEditing(true)}>
          Edit
        </button>
      ) : (
        <button className="save-btn" onClick={handleSave}>
          Save
        </button>
      )}
    </div>
  );
};

export default EditProfile;
