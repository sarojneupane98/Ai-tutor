exports.handler = async (event) => {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

    try {
        const { message } = JSON.parse(event.body);
        const apiKey = process.env.GEMINI_API_KEY;

        // ERROR CHECK 1: Is the key missing?
        if (!apiKey) {
            return { statusCode: 500, body: JSON.stringify({ reply: "Error: GEMINI_API_KEY is missing in Netlify settings." }) };
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }]
            })
        });

        const data = await response.json();

        // ERROR CHECK 2: Did Google send an error?
        if (data.error) {
            return { statusCode: 500, body: JSON.stringify({ reply: "Google Error: " + data.error.message }) };
        }

        const aiResponse = data.candidates[0].content.parts[0].text;
        return { statusCode: 200, body: JSON.stringify({ reply: aiResponse }) };

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ reply: "System Error: " + error.message }) };
    }
};
