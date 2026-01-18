const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // Add user message to screen
    addMessage(text, 'user-message');
    userInput.value = '';

    // Show loading state
    const loadingId = addMessage("Thinking...", 'ai-message');

    try {
        // We call the Netlify function here
        const response = await fetch('/.netlify/functions/chat', {
            method: 'POST',
            body: JSON.stringify({ message: text }),
        });

        const data = await response.json();
        
        // Replace loading text with real answer
        updateMessage(loadingId, data.reply);
    } catch (error) {
        updateMessage(loadingId, "I'm having trouble connecting. Please check your Netlify settings.");
    }
}

function addMessage(text, className) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${className}`;
    msgDiv.innerText = text;
    const id = Date.now();
    msgDiv.setAttribute('data-id', id);
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return id;
}

function updateMessage(id, newText) {
    const msgDiv = document.querySelector(`[data-id="${id}"]`);
    if (msgDiv) msgDiv.innerText = newText;
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
