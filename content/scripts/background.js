// WebSocket connection
let ws = null;
let isConnected = false;  // Track connection status
const targetUrl = 'https://app.trading212.com/';

// Store WebSocket state (host and port) in local storage for persistence
chrome.runtime.onInstalled.addListener(() => {
    const savedHost = localStorage.getItem('host');
    const savedPort = localStorage.getItem('port');

    if (savedHost && savedPort) {
        openWebSocket(savedHost, savedPort);
    }
});

// Function to open WebSocket connection
function openWebSocket(host, port) {
    const wsUrl = `ws://${host}:${port}`;

    // Create WebSocket connection
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        console.log('Connection to Python server successful!');
        isConnected = true; // Update connection status
        chrome.runtime.sendMessage({ type: 'connectionStatus', status: 'connected' });
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        isConnected = false;
        chrome.runtime.sendMessage({ type: 'connectionStatus', status: 'error' });
    };

    ws.onmessage = (event) => {
        console.log("Received from server:", event.data);
        
        let msgData = JSON.parse(event.data)
        console.log(msgData)
        console.log(msgData.command)

        // Send a message to content script
        chrome.tabs.query({url: targetUrl}, function(tabs) {  
            chrome.tabs.sendMessage(tabs[0].id, msgData , function(response) {
                console.log('Response from content.js:', response.data)
                ws.send(JSON.stringify(response.data));});
            });
    };

    ws.onclose = () => {
        console.log('Connection closed.');
        isConnected = false; // Update connection status
        chrome.runtime.sendMessage({ type: 'connectionStatus', status: 'closed' });
    };
}


// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(request)
    console.log("new message")
    if (request.type === 'connect') {
        const { host, port } = request;
        openWebSocket(host, port);
    }

    if (request.type === 'disconnect') {
        if (ws) {
            ws.close();
            ws = null;
            isConnected = false; // Update connection status
            console.log('Disconnected from WebSocket');
        }
    }

    if (request.type === 'checkConnection') {
        sendResponse({ connected: isConnected });
    }

    if (request.type === 'contentReponse') {
        console.log(request.data)
    }
});
