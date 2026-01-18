const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { message } = JSON.parse(event.body);
        
        // Initialize with your API Key
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // Use "gemini-pro" which is the most compatible name for the v1 API
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();
        
        return {
            statusCode: 200,
            body: JSON.stringify({ reply: text }),
        };
    } catch (error) {
        console.error("AI Bridge Error:", error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ reply: "Connection failed: " + error.message }) 
        };
    }
};
