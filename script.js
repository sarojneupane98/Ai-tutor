const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const micBtn = document.getElementById('mic-btn');

const TYPING_SPEED = 15;

// Initialize marked options for better security/formatting
if (typeof marked !== 'undefined') {
    marked.setOptions({
        breaks: true, // Adds <br> on single line breaks
        gfm: true     // GitHub Flavored Markdown (tables, etc.)
    });
}

window.onload = () => {
    const history = getChatHistory();
    if (history.length === 0) {
        addMessage("नमस्ते! I'm your AI Student Tutor, created by Saroj Neupane. How can I help you learn today?", 'ai-message', false);
    } else {
        history.forEach(msg => renderMessageHTML(msg.text, msg.className));
    }
};

function getChatHistory() {
    return JSON.parse(localStorage.getItem('chat_history')) || [];
}

function saveToLocalStorage(text, className) {
    const history = getChatHistory();
    history.push({ text, className });
    localStorage.setItem('chat_history', JSON.stringify(history));
}

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    const rawHistory = getChatHistory();
    const formattedHistory = rawHistory.slice(-6).map(msg => ({
        role: msg.className === 'user-message' ? 'user' : 'assistant',
        content: msg.text
    }));

    addMessage(text, 'user-message');
    userInput.value = '';
    const loadingId = addLoadingIndicator();

    try {
        const response = await fetch('/.netlify/functions/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, history: formattedHistory }),
        });

        const data = await response.json();
        removeLoadingIndicator(loadingId);

        if (data.reply) {
            typeWriter(data.reply, 'ai-message');
        } else {
            addMessage("AI returned an empty response.", "ai-message");
        }

    } catch (error) {
        removeLoadingIndicator(loadingId);
        addMessage("Network Error. Please check your connection.", 'ai-message');
    }
}

function renderMessageHTML(text, className) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${className}`;
    // Use marked to parse existing history
    const formattedText = typeof marked !== 'undefined' ? marked.parse(text) : text;
    msgDiv.innerHTML = `<div class="avatar"></div><div class="text">${formattedText}</div>`;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function addMessage(text, className, save = true) {
    renderMessageHTML(text, className);
    if (save) saveToLocalStorage(text, className);
}

function typeWriter(text, className) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${className}`;
    msgDiv.innerHTML = `<div class="avatar"></div><div class="text"></div>`;
    chatBox.appendChild(msgDiv);
    
    const textContainer = msgDiv.querySelector('.text');
    let i = 0;

    function type() {
        if (i < text.length) {
            // Append character by character as plain text
            textContainer.textContent += text.charAt(i);
            i++;
            chatBox.scrollTop = chatBox.scrollHeight;
            setTimeout(type, TYPING_SPEED);
        } else {
            // CRITICAL: Once typing is finished, convert the plain text into HTML Markdown
            if (typeof marked !== 'undefined') {
                textContainer.innerHTML = marked.parse(text);
            }
            saveToLocalStorage(text, className);
        }
    }
    type();
}

function addLoadingIndicator() {
    const id = 'loading-' + Date.now();
    const loaderDiv = document.createElement('div');
    loaderDiv.className = `message ai-message`;
    loaderDiv.id = id;
    loaderDiv.innerHTML = `<div class="avatar"></div><div class="text"><div class="typing-dots"><span></span><span></span><span></span></div></div>`;
    chatBox.appendChild(loaderDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return id;
}

function removeLoadingIndicator(id) {
    const loader = document.getElementById(id);
    if (loader) loader.remove();
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
