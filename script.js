const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Typewriter speed in milliseconds
const TYPING_SPEED = 20; 

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // 1. Add User Message
    addMessage(text, 'user-message', 'ME');
    userInput.value = '';

    // 2. Add AI Loading State (Bouncing Dots)
    const loadingId = addLoadingIndicator();

    try {
        const response = await fetch('/.netlify/functions/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text }),
        });

        const data = await response.json();
        
        // 3. Remove Loading and start Typewriter
        removeLoadingIndicator(loadingId);
        typeWriter(data.reply, 'ai-message', 'AI');

    } catch (error) {
        removeLoadingIndicator(loadingId);
        addMessage("Critical error: Unable to reach the Neural Interface.", 'ai-message', 'AI');
    }
}

function addMessage(text, className, avatarText) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${className}`;
    msgDiv.innerHTML = `
        <div class="avatar">${avatarText}</div>
        <div class="text">${text}</div>
    `;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function addLoadingIndicator() {
    const id = 'loading-' + Date.now();
    const loaderDiv = document.createElement('div');
    loaderDiv.className = `message ai-message`;
    loaderDiv.id = id;
    loaderDiv.innerHTML = `
        <div class="avatar">AI</div>
        <div class="text">
            <div class="typing-dots"><span></span><span></span><span></span></div>
        </div>
    `;
    chatBox.appendChild(loaderDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return id;
}

function removeLoadingIndicator(id) {
    const loader = document.getElementById(id);
    if (loader) loader.remove();
}

function typeWriter(text, className, avatarText) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${className}`;
    msgDiv.innerHTML = `<div class="avatar">${avatarText}</div><div class="text"></div>`;
    chatBox.appendChild(msgDiv);
    
    const textContainer = msgDiv.querySelector('.text');
    let i = 0;

    function type() {
        if (i < text.length) {
            textContainer.textContent += text.charAt(i);
            i++;
            chatBox.scrollTop = chatBox.scrollHeight;
            setTimeout(type, TYPING_SPEED);
        }
    }
    type();
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
