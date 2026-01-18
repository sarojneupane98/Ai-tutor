const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
    // Only allow POST requests (sending data)
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { message } = JSON.parse(event.body);
        
        // This connects to the secret key we will set in Netlify later
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(message);
        const response = await result.response;
        
        return {
            statusCode: 200,
            body: JSON.stringify({ reply: response.text() }),
        };
    } catch (error) {
        console.error("AI Bridge Error:", error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ reply: "I'm having trouble thinking right now. Please check my API connection." }) 
        };
    }
};
