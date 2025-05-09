import nlp from 'compromise';//chat history topics
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';//text bold,etc
import axios from 'axios';//making API requests to your backend.
import './home.css';
import Navbar from './navbar';

const API_URL = "http://localhost:5000";

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [showHistory, setShowHistory] = useState(false); // chathitory open or not
    const messagesEndRef = useRef(null);//Ref to bottom of messages — used for scroll to bottom.
    const messageRefs = useRef([]); 
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const username=localStorage.getItem("username");
    console.log("user name is",username);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Scroll to the bottom whenever messages update
    useEffect(() => {
        scrollToBottom();
    }, [messages]);


useEffect(() => {
        if (!token) {
            navigate("/login");
        }
    }, [token, navigate]);

    // 🔹 Load chat history from localStorage when component mounts
    const userId = localStorage.getItem("userEmail") || "guest"; // Or however you store identity

    useEffect(() => {
    try {
        const storedMessages = localStorage.getItem(`chatMessages_${userId}`);
        if (storedMessages) {
            setMessages(JSON.parse(storedMessages));
        }
    } catch (error) {
        console.error("❌ Error loading chat history:", error);
    }
    }, [userId]);

    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem(`chatMessages_${userId}`, JSON.stringify(messages));
        }
    }, [messages, userId]);


    const handleUserInput = async (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        const userMessage = { text: userInput, sender: 'user' };
        setMessages((prev) => [...prev, userMessage]);
        setUserInput('');

        try {
            const res = await axios.post(`${API_URL}/chat`, { query: userInput });
            console.log("📊 API Response:", res.data);

            let botMessageText = res.data.message || "No response from the bot.";

            if (Array.isArray(res.data.listResponse)) {
            // Convert response to bullet points
            botMessageText = "<ul>" + res.data.listResponse.map(item => `<li>${item}</li>`).join('') + "</ul>";
        }

        
        // Ensure we only show a user-friendly response, not JSON
        if (res.data.friendlyResponse) {
            botMessageText = res.data.friendlyResponse; // Use formatted response if available
        }

        const botMessage = {
            text: botMessageText,
            sender: 'bot'
        };
        setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
        console.error("❌ Error communicating with chatbot:", error);
        setMessages((prev) => [...prev, { text: "Oops! Something went wrong. Please try again.", sender: 'bot' }]);
    }
};

    const scrollToMessage = (index) => {
        if (messageRefs.current[index]) {
            messageRefs.current[index].scrollIntoView({
                behavior: "smooth",
                block: "start",  
            });
        }
    };

    const handleHistoryClick = (index) => {
        scrollToMessage(index); // Scroll to the clicked message in the chat
    };

    return (
        <div className={`chat-container ${showHistory ? "history-open" : ""}`}>
            {/* Chat History Panel */}
            <div className={`chat-history ${showHistory ? "show" : ""}`}>
            <h3>Chat History</h3>
        {messages
    .filter((msg, index, self) =>
        msg.sender === "user" &&
        self.findIndex(m => m.text === msg.text && m.sender === "user") === index
    )
    .map((msg, index) => {
        const lower = msg.text.toLowerCase();

        // --- Manual Rules First ---
        let shortText = "";
        if (lower.includes("fee structure") && lower.includes("it")) shortText = "Fee: IT";
        else if (lower.includes("fee structure") && lower.includes("cs")) shortText = "Fee: CS";
        else if (lower.includes("fee structure")) shortText = "Fee Structure";
        else if (lower.includes("student")) shortText = "Student Info";
        else if (lower.includes("faculty")) shortText = "Faculty Info";
        else if (lower.includes("event")) shortText = "Event Info";
        else if (lower.includes("details") && lower.includes("all")) shortText = "All Details";

        // --- If no match, use Compromise NLP fallback ---
        if (!shortText) {
        const doc = nlp(msg.text);
        const topic = doc.nouns().out('text') || doc.verbs().out('text') || msg.text.split(" ").slice(0, 4).join(" ");
        shortText = topic ? topic.charAt(0).toUpperCase() + topic.slice(1) : msg.text.slice(0, 5) + "...";
        }

        return (
        <div key={index} className="history-message"
        onClick={() => handleHistoryClick(index)}  // Click event to scroll
        >
            {shortText}
        </div>
        );
    })}
    </div>


            <div className="chat-title">
                <Navbar onToggleHistory={() => setShowHistory(!showHistory)}/>
            </div>
            {/* Main Chat Section */}
            <div className="chat-box">
                <header className="chat-header">
                </header>

                <div className="chat-messages">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.sender}`} ref={(el) => (messageRefs.current[index] = el)}>
                            <ReactMarkdown 
    components={{
  h1: ({ children }) => (
    <h1 style={{ fontSize: '22px', color: '#ffffff', fontWeight: 'bold', marginBottom: '15px' }}>
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 style={{ fontSize: '18px', color: '#ffffff', fontWeight: '600', marginBottom: '10px' }}>
      {children}
    </h2>
  ),
  p: ({ children }) => (
    <p style={{ color: '#ffffff', marginBottom: '12px', lineHeight: '1.6' }}>
      {children}
    </p>
  ),
  li: ({ children }) => (
    <li style={{ color: '#ffffff', marginLeft: '25px', marginBottom: '8px', lineHeight: '1.6' }}>
      {children}
    </li>
  )
}}

>
    {msg.text}
</ReactMarkdown>

{msg.rawData && (
    <pre className="message-data">{JSON.stringify(msg.rawData, null, 2)}</pre>
)}
</div>
))}
<div ref={messagesEndRef}></div>
</div>

<form onSubmit={handleUserInput} className="chat-input">
<input
type="text"
value={userInput}
onChange={(e) => setUserInput(e.target.value)}
placeholder="Ask me anything..."
/>
<button type="submit">Send</button>
</form>
</div>
</div>
    );
};

export default Chatbot;
