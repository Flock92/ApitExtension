// Get DOM elements
const hostInput = document.getElementById('hostInput');
const portInput = document.getElementById('portInput');
const connectButton = document.getElementById('connectButton');
const infoBox = document.getElementById('info-box');
const infoText = document.getElementById('info-text');
const ordersList = document.getElementById("orders-list");
const freeFunds = document.getElementById("freeFunds");
const blockedFunds = document.getElementById("blockedFunds");
const result = document.getElementById("result");
const totalFunds = document.getElementById("totalFunds");


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

// Add order to the list
function addOrderToList(orderType, tickerSymbol, targetPrice, stopLoss, takeProfit, orderSize) {
    const orderItem = document.createElement("div");
    orderItem.classList.add("order-item");
    orderItem.innerHTML = `
        <span>${orderType.toUpperCase()} Order: ${tickerSymbol} ${orderSize} @ ${targetPrice}</span>
        <button onclick="closeOrder(this)">Close Order</button>
    `;
    ordersList.appendChild(orderItem);
}

// Close individual order
function closeOrder(button) {
    button.parentElement.remove();
}

// Close all orders
document.getElementById("closeAllOrders").addEventListener("click", function () {
    ordersList.innerHTML = '';  // Clears all orders
});

// Portfolio data update (for example purposes, you should dynamically update these values)
freeFunds.textContent = "$10000";  // Example value
blockedFunds.textContent = "$2000";  // Example value
result.textContent = "$150";  // Example value
totalFunds.textContent = "$30000"; // Example value


// QUICK ORDER FUNCTIONS

// Listen for Quick Order Submission
document.getElementById("submitQuickOrder").addEventListener("click", function () {
    const orderType = document.getElementById("quickOrderType").value;
    const tickerSymbol = document.getElementById("quickTickerSymbol").value;
    const targetPrice = document.getElementById("quickTargetPrice").value;
    const stopLoss = document.getElementById("quickStopLoss").value;
    const takeProfit = document.getElementById("quickTakeProfit").value;
    const orderSize = document.getElementById("quickOrderSize").value;
    const slippage = document.getElementById("quickSlippage").value;

    // Validate inputs
    if (tickerSymbol && orderType && targetPrice && stopLoss && takeProfit && orderSize && slippage) {
        // Add order to quick orders list
        addQuickOrderToList(tickerSymbol, orderType, targetPrice, stopLoss, takeProfit, orderSize, slippage);
    } else {
        alert("Please fill all fields.");
    }
});

// Add Quick Order to the List
function addQuickOrderToList(tickerSymbol, orderType, targetPrice, stopLoss, takeProfit, orderSize, slippage) {
    const quickOrderItem = document.createElement("div");
    quickOrderItem.classList.add("order-item");

    // Create the order button with details
    quickOrderItem.innerHTML = `
        <span>${tickerSymbol} - ${orderSize} @ ${targetPrice} (SL: ${stopLoss}, TP: ${takeProfit}, Slippage: ${slippage}%)</span>
        <button onclick="sendQuickOrderMessage('${tickerSymbol}', ${targetPrice}, ${stopLoss}, ${takeProfit}, ${orderSize}, ${slippage})">Send Order</button>
    `;
    
    // Create the order button with details
    /*quickOrderItem.innerHTML = `
        <span>${tickerSymbol} - ${orderSize} @ ${targetPrice} (SL: ${stopLoss}, TP: ${takeProfit}, Slippage: ${slippage}%)</span>
        <button onclick="sendQuickOrderMessage('${tickerSymbol}', ${targetPrice}, ${stopLoss}, ${takeProfit}, ${orderSize}, ${slippage})">Send Order</button>
    `;*/
    document.getElementById("quick-orders-list").appendChild(quickOrderItem);
}

// Send Message to content.js when order button is clicked
function sendQuickOrderMessage(tickerSymbol, targetPrice, stopLoss, takeProfit, orderSize, slippage) {
    const orderData = {
        tickerSymbol,
        targetPrice,
        stopLoss,
        takeProfit,
        orderSize,
        slippage
    };
    console.log("submitting order")
    // Send WebSocket or message to content.js
    chrome.runtime.sendMessage({ type: 'quickOrder', orderData }, function(response) {
        console.log("Order sent:", response);
    });
}

// Remove Quick Order from the List
function removeQuickOrder(button) {
    button.parentElement.remove();
}

// View python connection settings
document.getElementById("connectionFormHeader").addEventListener("click", function () {
    toggleVisibility("connectionForm");
});

// View Quick Order Form
document.getElementById("quickOrderFormHeader").addEventListener("click", function () {
    toggleVisibility("quickOrderForm");
});

// View Quick Order List
document.getElementById("quickOrdersListHeader").addEventListener("click", function () {
    toggleVisibility("quickOrdersList");
});

// View order form
document.getElementById("orderFormHeader").addEventListener("click", function () {
    toggleVisibility("orderForm");
});

// View order list
document.getElementById("ordersListHeader").addEventListener("click", function () {
    toggleVisibility("ordersList");
});

// View portfolio data
document.getElementById("portfolioHeader").addEventListener("click", function () {
    toggleVisibility("portfolioInfo");
});

// collapse function
function toggleVisibility(id) {
    console.log("running toggle")
    var content = document.getElementById(id);
    if (content.style.display === "none" || content.style.display === "") {
        content.style.display = "block";
    } else {
        content.style.display = "none";
    }
}

