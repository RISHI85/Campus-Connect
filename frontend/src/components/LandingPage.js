import React from 'react';
import { Link } from 'react-router-dom';
import'./lp.css';

const LandingPage = () => {
return (
<div>
    <header className="landing-header">
    <h1>Campus Connect</h1>
    <p>Your Intelligent College Chatbot for Seamless Query Resolution!</p>
    <div className="cta-buttons">
        <Link to="/login">
        <button className="cta-button login">Login</button>
        </Link>
        <Link to="/signup">
        <button className="cta-button signup">Sign Up</button>
        </Link>
    </div>
    </header>

    <section className="body-content">
    <h2>Why Use a College Chatbot?</h2>
    <p>
        Campus Connect is here to provide instant, 24/7 support for students, parents, and staff. 
        It answers queries about admissions, fees, class schedules, events, faculty, placements, and more, helping you get the information you need quickly and efficiently.
    </p>

    <div className="features">
        <div className="feature">
        <img
            src="https://himinternationalschool.org/wp-content/uploads/2021/03/ADMI-1-300x240.jpg"
            alt="Admissions"
        />
        <h3>Admission Queries</h3>
        <p>Get all the information you need about the admission process, deadlines, and eligibility criteria.</p>
        </div>
        <div className="feature">
        <img
            src="https://assets.website-files.com/5e6bef9160e290b99b7644b5/637f4d9efea234d231dd5565_The%20ultimate%20guide%20to%20note-taking%20in%20class%20-%20infographic-p-800.png"
            alt="Fees and Payments"
        />
        <h3>Fees & Payments</h3>
        <p>Learn about tuition fees, payment options, scholarships, and financial aid available for students.</p>
        </div>
        <div className="feature">
        <img
            src="https://th.bing.com/th/id/OIP.1Htjq09baSS7iJ8ixYvA3gAAAA?rs=1&pid=ImgDetMain"
            alt="Campus Facilities"
        />
        <h3>Campus Facilities</h3>
        <p>Get details about hostel facilities, classrooms, libraries, and other amenities available on campus.</p>
        </div>
        <div className="feature">
        <img
            src="https://th.bing.com/th/id/OIP.pajfk1koPXzdivKa_yVbBQHaFj?w=800&h=600&rs=1&pid=ImgDetMain"
            alt="Events & Results"
        />
        <h3>Events & Results</h3>
        <p>Stay updated with academic timetables, exam schedules, event dates, and result announcements.</p>
        </div>
    </div>
    </section>
</div>
);
};

export default LandingPage;
