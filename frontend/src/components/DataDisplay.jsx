import React from "react";
import "./DataDisplay.css";
import ReactMarkdown from "react-markdown";

const DataDisplay = ({ data = [], entity = "Data" }) => {
    return (
        <div className="data-container">
            <h2>{entity} Details</h2>
            {data.length === 0 ? (
                <p>No data available.</p>
            ) : (
                <div className="paragraph-view">
                    {data.map((item, index) => (
                        <p key={index}>
                            <ReactMarkdown>
                                {Object.entries(item)
                                    .map(([key, value]) => `**${key.replace("_", " ")}**: ${value}`)
                                    .join("\n\n")}
                            </ReactMarkdown>
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DataDisplay;
