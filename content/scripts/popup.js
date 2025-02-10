/*
// Get DOM elements
const hostInput = document.getElementById('hostInput');
const portInput = document.getElementById('portInput');
const connectButton = document.getElementById('connectButton');
const infoBox = document.getElementById('info-box');
const infoText = document.getElementById('info-text');

// WebSocket connection
let ws = null;

// Load saved host and port values from localStorage when the popup is opened
document.addEventListener('DOMContentLoaded', () => {
    const savedHost = localStorage.getItem('host');
    const savedPort = localStorage.getItem('port');
    
    if (savedHost && savedPort) {
        hostInput.value = savedHost;
        portInput.value = savedPort;
    }
});

// Handle Connect Button Click
connectButton.addEventListener('click', () => {
    const host = hostInput.value.trim();
    const port = portInput.value.trim();

    console.log("button clicked");
    if (!host || !port) {
        showInfo('Please enter a valid host and port.', 'error');
        return;
    }

    // Save the host and port to localStorage
    localStorage.setItem('host', host);
    localStorage.setItem('port', port);

    // Send message to background script to initiate WebSocket connection
    chrome.runtime.sendMessage({ type: 'connect', host, port });

    // Disable the inputs after the connection is successful
    hostInput.readOnly = true;
    portInput.readOnly = true;
});

// Function to display messages in the info box
function showInfo(message, type) {
    infoText.textContent = message;
    infoBox.style.display = 'block';
    infoBox.className = type; // Add class for styling (success or error)
}

// Listen for connection status updates from background script
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'connectionStatus') {
        const status = message.status;

        if (status === 'connected') {
            showInfo('Connection to Python server successful!', 'success');
        } else if (status === 'error') {
            showInfo('Failed to connect to Python server.', 'error');
        } else if (status === 'closed') {
            showInfo('Connection closed.', 'error');
        }
    }
});
*/

// Get DOM elements
const hostInput = document.getElementById('hostInput');
const portInput = document.getElementById('portInput');
const connectButton = document.getElementById('connectButton');
const infoBox = document.getElementById('info-box');
const infoText = document.getElementById('info-text');

// WebSocket connection
let ws = null;

// Load saved host and port values from localStorage when the popup is opened
document.addEventListener('DOMContentLoaded', () => {
    const savedHost = localStorage.getItem('host');
    const savedPort = localStorage.getItem('port');
    
    if (savedHost && savedPort) {
        hostInput.value = savedHost;
        portInput.value = savedPort;
    }

    // Check connection status from background script
    chrome.runtime.sendMessage({ type: 'checkConnection' }, (response) => {
        const isConnected = response.connected;

        if (isConnected) {
            connectButton.textContent = "Disconnect";
            hostInput.readOnly = true;
            portInput.readOnly = true;
            showInfo('Connected to Python server.', 'success');
        } else {
            connectButton.textContent = "Connect";
            hostInput.readOnly = false;
            portInput.readOnly = false;
            showInfo('Disconnected from Python server.', 'error');
        }
    });
});

// Handle Connect/Disconnect Button Click
connectButton.addEventListener('click', () => {
    if (connectButton.textContent === "Connect") {
        const host = hostInput.value.trim();
        const port = portInput.value.trim();

        console.log("button clicked");
        if (!host || !port) {
            showInfo('Please enter a valid host and port.', 'error');
            return;
        }

        // Save the host and port to localStorage
        localStorage.setItem('host', host);
        localStorage.setItem('port', port);

        // Send message to background script to initiate WebSocket connection
        chrome.runtime.sendMessage({ type: 'connect', host, port });

        // Disable the inputs and change button to "Disconnect"
        hostInput.readOnly = true;
        portInput.readOnly = true;
        connectButton.textContent = "Disconnect";
    } else {
        // If the button says "Disconnect", close the connection
        chrome.runtime.sendMessage({ type: 'disconnect' });

        // Enable the inputs again and change button back to "Connect"
        hostInput.readOnly = false;
        portInput.readOnly = false;
        connectButton.textContent = "Connect";

        // Clear any saved connection info if you want to reset
        localStorage.removeItem('host');
        localStorage.removeItem('port');
    }
});

// Function to display messages in the info box
function showInfo(message, type) {
    infoText.textContent = message;
    infoBox.style.display = 'block';
    infoBox.className = type; // Add class for styling (success or error)
}

// Listen for connection status updates from background script
chrome.runtime.onMessage.addListener((message) => {
    console.log(message)
    if (message.type === 'connectionStatus') {
        const status = message.status;

        if (status === 'connected') {
            showInfo('Connection to Python server successful!', 'success');
        } else if (status === 'error') {
            showInfo('Failed to connect to Python server.', 'error');
        } else if (status === 'closed') {
            showInfo('Connection closed.', 'error');
        }
    }
});
