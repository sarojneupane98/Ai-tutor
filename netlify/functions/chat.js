exports.handler = async (event) => {
    // Only allow POST requests
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { message } = JSON.parse(event.body);
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return { statusCode: 500, body: JSON.stringify({ reply: "Config Error: API Key is missing in Netlify." }) };
        }

        // The exact URL format required for Gemini 1.5 Flash
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: message }]
                }]
            })
        });

        const data = await response.json();

        // Check if Google returned an error message
        if (data.error) {
            return { 
                statusCode: 500, 
                body: JSON.stringify({ reply: "Google Error: " + data.error.message }) 
            };
        }

        // Navigate the JSON response to get the text
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
