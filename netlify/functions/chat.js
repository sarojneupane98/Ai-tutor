exports.handler = async (event) => {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

    try {
        const { message } = JSON.parse(event.body);
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return { statusCode: 500, body: JSON.stringify({ reply: "API Key missing in Netlify." }) };
        }

        // Updated URL: removed the extra 'models/' part from the path
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: message }]
                }]
            })
        });

        const data = await response.json();

        // Debugging: If Google returns an error, show it
        if (data.error) {
            return { 
                statusCode: 500, 
                body: JSON.stringify({ reply: "Google says: " + data.error.message }) 
            };
        }

        // Correct path to the text response
        const aiResponse = data.candidates[0].content.parts[0].text;

        return {
            statusCode: 200,
            body: JSON.stringify({ reply: aiResponse }),
        };

    } catch (error) {
        return { 
            statusCode: 500, 
            body: JSON.stringify({ reply: "System Error: " + error.message }) 
        };
    }
};
