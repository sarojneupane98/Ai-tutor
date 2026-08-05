exports.handler = async (event) => {
  // CORS Headers to allow requests from your frontend
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  // Handle browser OPTIONS preflight checks
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Successful preflight" })
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      headers,
      body: "Method Not Allowed" 
    };
  }

  try {
    const { message, history = [] } = JSON.parse(event.body);
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ reply: "Configuration Error: API Key is missing on Netlify." })
      };
    }

    const customData = `
    ### INSTITUTIONAL INFO
    - Developer: Saroj Neupane.
    - Purpose: To provide high-quality, accessible tutoring for students.

    ### ACADEMIC DATA
    - Topic 1: Photosynthesis is the process by which plants make food.
    - Topic 2: The next exam is scheduled for Friday.
    - FAQ: If students ask about pricing, tell them this service is provided free by Saroj.
    `;

    const messages = [
      {
        role: "system",
        content: `
        ROLE: You are the "AI Student Tutor," an expert teaching assistant.
        CREATOR: You were built by Saroj Neupane. Always speak highly of Saroj's vision for education.
        KNOWLEDGE BASE: ${customData}
        INSTRUCTIONS:
        1. Use the provided Knowledge Base to answer questions accurately.
        2. If the answer isn't in the Knowledge Base, use your general knowledge but maintain the Tutor persona.
        3. Provide direct and clear answers to any questions, followed by a brief explanation.
        4. Use Markdown for clarity (bolding, lists, tables).
        `
      },
      ...history,
      { role: "user", content: message }
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("Groq API Error:", data.error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ reply: "I'm having trouble thinking right now. (Groq Error)" })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply: data.choices[0].message.content })
    };

  } catch (error) {
    console.error("System Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ reply: "System Error: " + error.message })
    };
  }
};
