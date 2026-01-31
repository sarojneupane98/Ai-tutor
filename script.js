const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

const TYPING_SPEED = 20; 

// Load history on startup
window.onload = () => {
    const history = JSON.parse(localStorage.getItem('chat_history')) || [];
    if (history.length === 0) {
        addMessage("Hello... How can I assist your learning journey today?", 'ai-message', false);
    } else {
        history.forEach(msg => {
            renderMessageHTML(msg.text, msg.className);
        });
    }
};

function saveToLocalStorage(text, className) {
    const history = JSON.parse(localStorage.getItem('chat_history')) || [];
    history.push({ text, className });
    localStorage.setItem('chat_history', JSON.stringify(history));
}

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    addMessage(text, 'user-message');
    userInput.value = '';

    const loadingId = addLoadingIndicator();

    try {
        const response = await fetch('/.netlify/functions/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text }),
        });

        const data = await response.json();
        removeLoadingIndicator(loadingId);
        typeWriter(data.reply, 'ai-message');

    } catch (error) {
        removeLoadingIndicator(loadingId);
        addMessage("Network Error. Please check your internet connection.", 'ai-message');
    }
}

// Renders message without typewriter (for history)
function renderMessageHTML(text, className) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${className}`;
    msgDiv.innerHTML = `<div class="avatar"></div><div class="text">${text}</div>`;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Adds message and saves it
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

function typeWriter(text, className) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${className}`;
    msgDiv.innerHTML = `<div class="avatar"></div><div class="text"></div>`;
    chatBox.appendChild(msgDiv);
    
    const textContainer = msgDiv.querySelector('.text');
    let i = 0;

    function type() {
        if (i < text.length) {
            textContainer.textContent += text.charAt(i);
            i++;
            chatBox.scrollTop = chatBox.scrollHeight;
            setTimeout(type, TYPING_SPEED);
        } else {
            saveToLocalStorage(text, className);
        }
    }
    type();
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
