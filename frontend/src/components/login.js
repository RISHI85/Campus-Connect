import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const navigate = useNavigate();

useEffect(() => {
const token = localStorage.getItem('token');
if (token) {
    navigate('/home'); // Redirect to home if already logged in
}
}, [navigate]);

const handleLogin = async (e) => {
    e.preventDefault();

    try {
        const response = await axios.post(
            'http://localhost:5000/login',
            { email, password },
            { headers: { 'Content-Type': 'application/json' } }  // Ensure proper headers
        );

        const token = response.data.token;

        if (token) {
            localStorage.setItem('token', token);
            localStorage.setItem('username',response.data.varname);
            console.log("✅ Login successful:", response.data);
            navigate('/home');
        } else {
            console.error("❌ No token received from the backend.");
        }

    } catch (error) {
        console.error("❌ Login failed:", error.response?.data || error.message);
        alert('Login failed. Please check your credentials.');
    }
};


return (
<div style={styles.container}>
    <h2 style={styles.heading}>Login</h2>
    <form onSubmit={handleLogin} style={styles.form}>
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
        Login
    </button>
    </form>
    <button
    onClick={() => navigate('/signup')}
    style={styles.signupButton}
    >
    No account yet? Create now!
    </button>
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
backgroundColor: '#f4f7fc', // Matches the Landing page background
fontFamily: 'Arial, sans-serif',
padding: '20px',
},
heading: {
fontSize: '2.5rem',
marginBottom: '1.5rem',
color: '#2c3e50', // Darker shade for contrast
fontWeight: 'bold',
},
form: {
display: 'flex',
flexDirection: 'column',
alignItems: 'center',
width: '100%',
maxWidth: '400px',
padding: '2rem',
backgroundColor: '#fff',
borderRadius: '10px',
boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
},
input: {
width: '100%',
padding: '0.75rem',
marginBottom: '1rem',
border: '1px solid #ddd',
borderRadius: '8px',
fontSize: '1rem',
transition: 'border-color 0.3s ease-in-out',
},
button: {
width: '100%',
padding: '0.75rem',
backgroundColor: '#4CAF50',
border: 'none',
borderRadius: '8px',
fontSize: '1rem',
fontWeight: 'bold',
color: '#fff',
cursor: 'pointer',
transition: 'background-color 0.3s, transform 0.2s',
},
buttonHover: {
backgroundColor: '#45a049',
},
signupButton: {
marginTop: '1rem',
padding: '0.75rem',
backgroundColor: '#3498db', // Matches Landing page's "Sign Up" button
border: 'none',
borderRadius: '8px',
fontSize: '1rem',
fontWeight: 'bold',
color: '#fff',
cursor: 'pointer',
transition: 'background-color 0.3s, transform 0.2s',
},
link: {
textDecoration: 'underline',
color: '#3498db',
cursor: 'pointer',
marginTop: '1rem',
fontSize: '0.9rem',
},
inputFocus: {
borderColor: '#3498db',
},
};


export default Login;
