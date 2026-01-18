exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { message } = JSON.parse(event.body);
        const apiKey = process.env.GEMINI_API_KEY;
        
        // This is the direct URL to Google's AI
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }]
            })
        });

        const data = await response.json();
        
        // Extract the text from Google's specific data structure
        const aiResponse = data.candidates[0].content.parts[0].text;

        return {
            statusCode: 200,
            body: JSON.stringify({ reply: aiResponse }),
        };
    } catch (error) {
        console.error("Direct API Error:", error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ reply: "Connection failed. Please check the API Key in Netlify." }) 
        };
    }
};
