const express = require('express');
const { Client } = require('pg');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const rateLimit = require('express-rate-limit');


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(
    cors({
        origin: 'http://localhost:3000',
        methods: ['POST', 'GET'],
        credentials: true,
        allowedHeaders: ['Content-Type']
    })
);

// PostgreSQL client setup
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'college_chatbot',
    password: '9014460045',
    port: 5433,
});

client.connect()
    .then(() => console.log('✅ Connected to PostgreSQL'))
    .catch((err) => console.error('❌ Database connection error:', err.stack));

const JWT_SECRET = 'flfhdgvlaugladugvbgdhhdhj';

// Initialize Google Generative AI
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY is missing in .env file!");
    process.exit(1);
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// **1️⃣ Fetch Database Schema Dynamically**
async function fetchDatabaseSchema() {
    try {
        const query = `SELECT table_name, column_name, data_type 
                       FROM information_schema.columns 
                       WHERE table_schema = 'public'`;
        const result = await client.query(query);
        
        // Group schema data by table name
        const schemaMap = {};
        result.rows.forEach(row => {
            if (!schemaMap[row.table_name]) {
                schemaMap[row.table_name] = [];
            }
            schemaMap[row.table_name].push(`${row.column_name} (${row.data_type})`);
        });

        // Convert schema to a structured description
        let schemaDescription = Object.entries(schemaMap)
            .map(([table, columns]) => `${table}: ${columns.join(', ')}`)
            .join("; ");

        return schemaDescription;
    } catch (error) {
        console.error("❌ Error fetching database schema:", error);
        return "";
    }
}

/**
 * 2️⃣ Generate SQL Query Dynamically Using AI
 */
async function getDatabaseResponse(userQuery) {
    try {
        const schemaDescription = await fetchDatabaseSchema();
        if (!schemaDescription) return { error: "Database schema not available." };

        console.log("📝 Schema Description:\n", schemaDescription);

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash"});

        // **Pass Schema & Define Query Rules**
        const response = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: `You are an AI that generates SQL queries for a PostgreSQL database.
        The database schema is as follows: ${schemaDescription}.
        Generate a **SELECT SQL query** based on this user request: "${userQuery}".

        🔹 **Important Query Rules**:
        1️⃣ **Fetch Relevant Data Only**:
           - Use \`SELECT *\` to return **all columns**.
           - Ensure the query retrieves data from **all relevant tables** based on the request.

        2️⃣ **Handle Case-Insensitive & Partial Matches**:
           - If the query is about a **student**, find the \`student_id\` using \`name ILIKE '%search_term%'\`.
           - If the query is about a **faculty**, find the \`faculty_id\` using \`name ILIKE '%search_term%'\` OR \`department ILIKE '%search_term%'\`.
           - If the query is about an **event**, find the \`event_id\` using \`event_name ILIKE '%search_term%'\`.

        3️⃣ **Ensure Date Formatting as DD-MM-YYYY**:
           - Convert all **date fields** using:
                \`\`\`sql
                TO_CHAR(table_name.date_column, 'DD-MM-YYYY') AS formatted_date_column
                \`\`\`

            **map the departments of BTECH in my database all are shortcuts like CSE,IT,EEE etc. so please be carefull if user enters fullform of a department.map them to shortcuts and then write the query.
        4️⃣ **Optimize Query Structure**:
           - Use **JOINs** when needed to retrieve related data.
           - Avoid unnecessary subqueries if a direct query is more efficient.

           **Fix Common Mistakes**:
   - Ensure there is **no extra nesting of TO_CHAR()**.
   - Only apply **one level of TO_CHAR()** for date formatting.
   - Ensure correct SQL syntax without duplicate column aliases.

            **if  user mention faculty means just fetch from faculty table else fetch details of student if any name mentioned in query.
            **if the user entered query has mentioned faculty then and only fetch details of the mentioned faculty unless and until a faculty is mentioned donot check faculty details.
            **for example:"give me details of sailesh" then fetch student details
            note:
            are u mad i have entered give me sheetal sahu phone number that means she is a student beacuse i didnt mentioned any keyword faculty
            please provide the details which the user mentioned or else give entire data

            Format the following student data strictly in bullet points, each containing:
- Name
- Year
- Roll Number
- Department
- Email

note:
are u mad please provide me the details of particular query if the query includes keyword student then fetch it from student table ,if the query includes the keyword faculty then fetch it from faculty table and if the query contains the keyword events then fetch it from events table and if the query contains keyword rankings then fetch it from the rankings table.

Ensure there are no paragraphs, only bullet points.
WHEN THE USER ENTTERS QUEY CONTAINS FULL FORM OF DEPARTMENT THEN USE SHORTCUTS LIKE CSE,IT,EEE. WHILE GENERATING QUERY
FOR EXAMPLE:"give me fee structure of Information Technology branch per semester"
WRONG QUERY:
"SELECT
  *
FROM fee_structure
WHERE
  program = 'Information Technology' AND period = 'semester';"
RIGHT QUERY:
"SELECT
  *
FROM fee_structure
WHERE
  program ILIKE '%IT%' AND period ILIKE '%semester%';
"

IN THE SAME MANNER U NEED TO CONVERT FULL FORM OF DEPARTMENT TO SHORTCUTS IN SQL QUERY.


        Now generate a **correct and optimized** SQL query following these rules.`
                        }
                    ]
                }
            ]
        });

        console.log("📜 Full AI Response:", JSON.stringify(response, null, 2));

        // **Extract AI-generated SQL query safely**
        let sqlQuery = response?.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

        // Remove markdown formatting (```sql ... ```)
        sqlQuery = sqlQuery.replace(/```sql|```/g, "").trim();

        // **Ensure Correct Date Format**
        sqlQuery = sqlQuery.replace(
    /TO_CHAR\s*\(\s*TO_CHAR\s*\(\s*([\w.]+)\s*,\s*'DD-MM-YYYY'\s*\)\s*,\s*'DD-MM-YYYY'\s*\)/gi,
    "TO_CHAR($1, 'DD-MM-YYYY')"
);


        console.log("✅ Cleaned SQL Query:", sqlQuery);

        // **Execute the SQL query**
        const result = await client.query(sqlQuery);
        const friendly=await generateResponse(result.rows);
        console.log("🤖 Formatted AI Response NEW:", friendly);
        console.log(friendly);
        return { data: result.rows };
    } catch (error) {
        console.error("❌ Database Error:", error);
        return { error: "Sorry, I couldn't fetch the data." };
    }
}


app.get('/gmrit-rankings', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT year, ranking_body, rank FROM rankings
       WHERE college_name = 'GMRIT'
       ORDER BY year ASC, ranking_body ASC`
    );

    if (result.rows.length > 0) {
      res.json({
        message: "Here are GMRIT's rankings for the last 3 years:",
        data: result.rows
      });
    } else {
      res.json({
        message: "Sorry, no rankings found for GMRIT."
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});




app.post('/login', async (req, res) => {
    try {
        console.log("🔍 Incoming Login Request:", req.body);

        const { email, password } = req.body;

        if (!email || !password) {
            console.log("❌ Missing Fields");
            return res.status(400).json({ error: "Email and password are required" });
        }

        const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            console.log("❌ User Not Found");
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = result.rows[0];
        const varname=user.username;
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log("❌ Invalid Password");
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '365d' });
        console.log("✅ Login Token:", token);

        res.cookie('authToken', token, {
            httpOnly: true,
            secure: false,  // Change to `true` in production with HTTPS
            sameSite: 'Lax',
            maxAge: 365 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({ message: "Login successful", token ,varname});
        
    } catch (error) {
        console.error('❌ Login Error:', error);
        return res.status(500).json({ error: "Login failed" });
    }
});

app.post('/signup', async (req, res) => {
  try {
    console.log("🔍 Incoming Signup Request:", req.body);

    const { username, email, password } = req.body;  // Use `username` instead of `name`
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery = `
      INSERT INTO users (username, email, password) 
      VALUES ($1, $2, $3) RETURNING id, username, email
    `;

    const result = await client.query(insertQuery, [username, email, hashedPassword]);

    const user = result.rows[0];

    const varname= user.name;

    const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    console.log("✅ Signup Token:", token);

    res.status(201).json({ message: 'Signup successful', token, varname });

  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.post('/logout', (req, res) => {
    res.clearCookie('authToken');
    res.json({ message: "Logged out successfully" });
});

const verifyToken = (req, res, next) => {
    const token = req.cookies.authToken;

    if (!token) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: "Invalid token" });
        }
        req.user = decoded;
        next();
    });
};

/**
 * 3️⃣ Generate Chatbot Response
 */
async function generateResponse(message) {
    console.log("i am triggered generateResponsege")
    console.log("message sent AIII",message);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const response = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [{ 
                        text:  `Convert the following structured information into a well-written, user-friendly, and natural English response:\n\n${message}\n\n
                        🔹 Write in a conversational and professional tone.
                        🔹 Avoid structured or list-based formatting.
                        🔹 Integrate the details naturally into readable English sentences.
                        ** if the message contains multiple users or records it should be displayed as a well formatted tables or in bullet points fr each data seperately.
                        **Provide the requested details in a **structured and user-friendly** format.  
                            - By default, display the data in **bullet points**, where each item has a **title as a heading** followed by its attributes.  
                            - If the user asks for a **table format**, then return the response in **table format** with clearly defined columns. 
                            
                            Convert the following structured information into **Markdown** format.  
                        - Use **bold** for headings.  
                        - Use bullet points (**-**) for listing attributes.  
                        - If multiple records exist, display them separately.
                        DONT INCLUDE THESE TYPE OF INFORMATION IN THE RESPONSE"Okay, here's the converted information, presented in a conversational and professional tone using Markdown, formatted as requested"

                        
                           `
                    }]
                }
            ]
        });
        console.log("🎯 Full AI Response Object:", JSON.stringify(response, null, 2));

        // ✅ Extract the actual text response from AI
        const aiResponse = response?.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!aiResponse) {
            console.error("❌ No valid AI response.");
            return "Error: No response from AI.";
        }

        console.log("🤖 Formatted AI Response:", aiResponse);
        return aiResponse;
    } catch (error) {
        console.error("❌ Error generating chatbot response:", error);
        return "Error: Unable to generate a response at this time.";
    }
}

/**
 * 4️⃣ /chat Route for Any Query
 */


app.post("/chat", async (req, res) => {
    const userQuery = req.body.query;
    console.log("💬 User Query:", userQuery);
    
    if (!userQuery) {
        return res.status(400).json({ error: "Query is required" });
    }
    
    try {
        // Get database response
        const dbResponse = await getDatabaseResponse(userQuery);
        
        if (dbResponse.error) {
            return res.status(500).json({ error: dbResponse.error });
        }

        console.log("📊 Query Result (Before Filtering):", dbResponse.data);

        // **Ensure dbResponse.data is an array before filtering**
        let filteredData = Array.isArray(dbResponse.data)
            ? dbResponse.data.map(item => {
                let { createdAt, created_at, Created_At, ...rest } = item;
                return rest;
            })
            : dbResponse.data;

        console.log("🔍 Filtered Data (After Removing Created At):", filteredData);

        // Generate AI response
        const aiResponse = await generateResponse(`Here is the data: ${JSON.stringify(filteredData)}`);
        console.log("🤖 AI Response:", aiResponse);

        return res.json({
            success: true,
            data: filteredData, // Send only relevant data
            message: aiResponse
        });

    } catch (error) {
        console.error("❌ Error in chatbot API:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});



//for editing details

app.get("/user-details", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    const userId = decoded.userId;

    const user = await pool.query("SELECT username, email, mobile FROM users WHERE id = $1", [userId]);

    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user.rows[0]);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.put("/update-user", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        console.error("Unauthorized access attempt - No token");
        return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    console.log("Decoded token:", decoded); // Verify token
    const userId = decoded.userId;

    const { username, email, mobile } = req.body;

    if (username) {
      await pool.query("UPDATE users SET username = $1 WHERE id = $2", [username, userId]);
    }
    if (email) {
      await pool.query("UPDATE users SET email = $1 WHERE id = $2", [email, userId]);
    }
    if (mobile) {
      await pool.query("UPDATE users SET mobile = $1 WHERE id = $2", [mobile, userId]);
    }

    res.json({ message: "User updated successfully!" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});