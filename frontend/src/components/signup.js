import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
const [username, setUsername] = useState('');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const navigate = useNavigate();

const handleSignup = async (e) => {
    e.preventDefault();

    try {
        const response = await axios.post(
            'http://localhost:5000/signup',
            { username, email, password },  // Ensure the correct key names
            { headers: { 'Content-Type': 'application/json' } }  // Ensure proper headers
        );

        localStorage.setItem('token', response.data.token);
        localStorage.setItem('username',response.data.varname);
        console.log("✅ Signup successful:", response.data);
        alert('Signup successful!');
        navigate('/login');

    } catch (error) {
        console.error("❌ Signup failed:", error.response?.data || error.message);
        alert('Signup failed. Please try again.');
    }
};


return (
<div style={styles.container}>
    <h2 style={styles.heading}>Sign Up</h2>
    <form onSubmit={handleSignup} style={styles.form}>
    <input
        type="text"
        placeholder="Name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        style={styles.input}
    />
    <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={styles.input}
    />
    <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={styles.input}
    />
    <button type="submit" style={styles.button}>
        Sign Up
    </button>
    </form>
</div>
);
};

const styles = {
container: {
display: 'flex',
flexDirection: 'column',
justifyContent: 'center',
alignItems: 'center',
height: '100vh',
backgroundColor: '#f4f4f9',
fontFamily: 'Arial, sans-serif',
},
heading: {
fontSize: '2rem',
marginBottom: '1.5rem',
color: '#333',
},
form: {
display: 'flex',
flexDirection: 'column',
alignItems: 'center',
width: '100%',
maxWidth: '400px',
padding: '2rem',
backgroundColor: '#fff',
borderRadius: '8px',
boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
},
input: {
width: '100%',
padding: '0.75rem',
marginBottom: '1rem',
border: '1px solid #ccc',
borderRadius: '4px',
fontSize: '1rem',
},
button: {
width: '100%',
padding: '0.75rem',
backgroundColor: '#4CAF50',
border: 'none',
borderRadius: '4px',
fontSize: '1rem',
color: '#fff',
cursor: 'pointer',
transition: 'background-color 0.3s',
},
};

export default Signup;
