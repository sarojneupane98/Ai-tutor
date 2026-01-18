exports.handler = async (event) => {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

    try {
        const { message } = JSON.parse(event.body);
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            return { statusCode: 500, body: JSON.stringify({ reply: "Error: GROQ_API_KEY missing in Netlify." }) };
        }

        // Groq's official API endpoint
        const url = "https://api.groq.com/openai/v1/chat/completions";

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile", // This is a top-tier free model
                messages: [
                    { role: "system", content: "You are a helpful AI Tutor." },
                    { 
                        role: "system", 
                        content: `
                        ### ROLE
                        You are the "AI Student Tutor," a specialized teaching assistant.
                        
                        ### CREATOR BIO
                        - You were created by Saroj Neupane.
                        - Saroj is a dedicated educator focused on student success.
                        - If asked about Saroj, mention that he built this tool to make learning easier and more accessible.

                        ### CUSTOM KNOWLEDGE BASE (DATA FOR STUDENTS)
                        --- PASTE YOUR NOTES/DATA BELOW THIS LINE ---
                        1. Topic A: [Insert your facts/notes here]
                        2. Topic B: [Insert your facts/notes here]
                        3. FAQ: [Insert specific student questions and your preferred answers here]
                        --- END OF DATA ---

                        ### TEACHING RULES
                        1. NO DIRECT ANSWERS: If a student asks for the answer to a homework problem, do NOT give the answer. Instead, explain the concept and ask them a guiding question.
                        2. TONE: Be encouraging, patient, and use simple language.
                        ` 
                    },
                    { role: "user", content: message }
                ]
            })
        });

        const data = await response.json();

        if (data.error) {
            return { statusCode: 500, body: JSON.stringify({ reply: "Groq Error: " + data.error.message }) };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ reply: data.choices[0].message.content }),
        };

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ reply: "System Error: " + error.message }) };
    }
};
