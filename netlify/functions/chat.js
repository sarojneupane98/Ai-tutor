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
