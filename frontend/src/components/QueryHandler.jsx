import React, { useState } from "react";
import DataDisplay from "./DataDisplay"; // Ensure correct import path

const QueryHandler = () => {
    const [query, setQuery] = useState("");
    const [viewPreference, setViewPreference] = useState("paragraph");

    const handleQuerySubmit = () => {
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes("clear") || lowerQuery.includes("concise")) {
            setViewPreference("bullets");
        } else if (lowerQuery.includes("table") || lowerQuery.includes("detailed")) {
            setViewPreference("table");
        } else {
            setViewPreference("paragraph");
        }
    };

    return (
        <div>
            <h1>Student Details</h1>
            <input
                type="text"
                placeholder="Enter query..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <button onClick={handleQuerySubmit}>Search</button>

            {/* Pass the dynamically set viewPreference */}
            <DataDisplay 
                data={[
                    {
                        name: "P.sai Rishi",
                        Year: 3,
                        Roll_Number: "22341A1280",
                        Department: "Computer Science",
                        Email: "22341A1280@gmrit.edu.in",
                    }
                ]} 
                entity="Student" 
                viewPreference={viewPreference} 
            />
        </div>
    );
};

export default QueryHandler;
