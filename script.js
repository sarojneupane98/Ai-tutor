const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

const TYPING_SPEED = 15; // Adjusted for a smoother feel

// 1. Initial Load: Show history or Welcome Message
window.onload = () => {
    const history = getChatHistory();
    if (history.length === 0) {
        // First-time welcome message
        addMessage("Hello! I'm your AI Student Tutor, created by Saroj Neupane. How can I assist your learning journey today?", 'ai-message', false);
    } else {
        // Render all previous messages from LocalStorage
        history.forEach(msg => {
            renderMessageHTML(msg.text, msg.className);
        });
    }
};

// Helper: Get history from LocalStorage
function getChatHistory() {
    return JSON.parse(localStorage.getItem('chat_history')) || [];
}

// Helper: Save message to LocalStorage
function saveToLocalStorage(text, className) {
    const history = getChatHistory();
    history.push({ text, className });
    localStorage.setItem('chat_history', JSON.stringify(history));
}

// 2. Main Send Function
async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // A. Add User Message to UI and Storage
    addMessage(text, 'user-message');
    userInput.value = '';

    // B. Prepare History for the AI (Context Memory)
    // We send the last 6 messages so the AI remembers the conversation flow
    const historyData = getChatHistory().slice(-6).map(msg => ({
        role: msg.className === 'user-message' ? 'user' : 'assistant',
        content: msg.text
    }));

    // C. Show "Thinking" animation
    const loadingId = addLoadingIndicator();

    try {
        const response = await fetch('/.netlify/functions/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: text,
                history: historyData // This sends the memory to chat.js
            }),
        });

        const data = await response.json();
        removeLoadingIndicator(loadingId);

        if (data.reply) {
            typeWriter(data.reply, 'ai-message');
        } else {
            addMessage("I'm sorry, I encountered an empty response. Please try again.", 'ai-message');
        }

    } catch (error) {
        removeLoadingIndicator(loadingId);
        addMessage("Network Error. Please check your internet connection.", 'ai-message');
        console.error("Fetch Error:", error);
    }
}

// 3. UI Rendering Logic
function renderMessageHTML(text, className) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${className}`;
    
    // Check if 'marked' library is available for professional formatting
    const formattedText = typeof marked !== 'undefined' ? marked.parse(text) : text;
    
    msgDiv.innerHTML = `<div class="avatar"></div><div class="text">${formattedText}</div>`;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function addMessage(text, className, save = true) {
    renderMessageHTML(text, className);
    if (save) saveToLocalStorage(text, className);
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

// 4. The Typewriter Effect (Improved for AI Tutor feel)
function typeWriter(text, className) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${className}`;
    msgDiv.innerHTML = `<div class="avatar"></div><div class="text"></div>`;
    chatBox.appendChild(msgDiv);
    
    const textContainer = msgDiv.querySelector('.text');
    let i = 0;

    function type() {
        if (i < text.length) {
            // We use textContent during typing to avoid breaking HTML tags
            textContainer.textContent += text.charAt(i);
            i++;
            chatBox.scrollTop = chatBox.scrollHeight;
            setTimeout(type, TYPING_SPEED);
        } else {
            // Once finished, we convert the plain text to proper Markdown/HTML
            if (typeof marked !== 'undefined') {
                textContainer.innerHTML = marked.parse(text);
            }
            saveToLocalStorage(text, className);
        }
    }
    type();
}

// 5. Event Listeners
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
