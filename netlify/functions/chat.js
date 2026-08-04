const fetch = require('node-fetch'); // Ensure node-fetch is available if using older Node versions

exports.handler = async (event) => {
    // 1. Safety Check: Only allow POST requests
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        // 2. Parse Incoming Data (Current Message + Chat History)
        const { message, history } = JSON.parse(event.body);
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            return { 
                statusCode: 500, 
                body: JSON.stringify({ reply: "Configuration Error: API Key is missing." }) 
            };
        }

        // 3. YOUR CUSTOM KNOWLEDGE BASE
        // Paste your textbooks, notes, or specific facts here.
        const customData = `
        ### INSTITUTIONAL INFO
        - Developer: Saroj Neupane.
        - Purpose: To provide high-quality, accessible tutoring for students.
        
        ### ACADEMIC DATA (Paste your notes below)
        - Topic 1: [Example: Photosynthesis is the process by which plants make food.]
        - Topic 2: [Example: The next exam is scheduled for Friday.]
        - FAQ: If students ask about pricing, tell them this service is provided free by Saroj.
        `;

        // 4. PREPARE THE MESSAGES ARRAY
        // We start with the System Prompt, then add History, then the new User Message.
        const messages = [
            { 
                role: "system", 
                content: `
                ROLE: You are the "AI Student Tutor," an expert teaching assistant.
                CREATOR: You were built by Saroj Neupane. Always speak highly of Saroj's vision for education.
                
                KNOWLEDGE BASE:
                ${customData}

                INSTRUCTIONS:
                1. Use the provided Knowledge Base to answer questions accurately.
                2. If the answer isn't in the Knowledge Base, use your general knowledge but maintain the Tutor persona.
                3. provide direct and clear answers to any questions. Then give a brief explanation of the answer.
                4. Use Markdown for clarity (bolding, lists, tables).
                `
            },
            // Spread the history array (contains previous user/assistant exchanges)
            ...history, 
            { role: "user", content: message }
        ];

        // 5. CALL GROQ API
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: messages,
                temperature: 0.7, // Balanced between creative and factual
                max_tokens: 1024,
                top_p: 1
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("Groq API Error:", data.error);
            return { 
                statusCode: 500, 
                body: JSON.stringify({ reply: "I'm having trouble thinking right now. (Groq Error)" }) 
            };
        }

        // 6. RETURN THE RESPONSE
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                reply: data.choices[0].message.content 
            }),
        };

    } catch (error) {
        console.error("System Error:", error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ reply: "System Error: " + error.message }) 
        };
    }
};
