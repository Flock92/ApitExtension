// Define your fetch function
function fetchData(callback) {
    fetch("https://demo.services.trading212.com/rest/v1/accounts", {
        method: 'GET',
        credentials: 'include'  // Include cookies in the request
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        callback(data);  // Pass the data back to the callback
    })
    .catch(error => {
        callback(error.message);  // Pass the error message back to the callback
    });
}

// Example usage
fetchData((result) => {
    if (typeof result === 'string') {
        // Handle error message
        console.error("Error:", result);
    } else {
        // Handle success data
        console.log("Fetched data:", result);
    }
});
