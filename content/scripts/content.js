// Check if the flag already exists (meaning the script is already running)
if (window.contentScriptInjected) {
    console.log("Content script is already running.");
} else {
    // Set a flag to indicate the script has been injected
    window.contentScriptInjected = true;
    console.log("Injecting content script for the first time.");
    // Your content script logic goes here
}

// Define your fetch function

// GET ACCOUNT DATA
async function fetchAccounts(mode, callback) {
    fetch(`https://${mode}.services.trading212.com/rest/v1/accounts`, {
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

// GET ACCOUNT SUMMARY
async function fetchSummary(mode, callback) {
    fetch(`https://${mode}.services.trading212.com/rest/trading/v1/cfd/accounts/summary`, {
        method: "POST",  // Confirm if this should be GET or POST
        credentials: "include",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0",
            "Accept": "application/json",
            "Accept-Language": "en-GB,en;q=0.5",
            "X-Trader-Client": "application=WC4,version=7.60.0,dUUID=9dd18de2-6f08-43f4-866b-96ad946936f1,accountId=20434246",
            "Content-Type": "application/json",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-site",
            "Priority": "u=4"
        },
        referrer: "https://app.trading212.com/",
        mode: "cors",
        body: "[]"
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

// OPEN POSITION
async function openPosition(mode, notify, quantity, limitDistance, stopDistance, instrumentCode, targetPrice, callback) {
    fetch(`https://${mode}.services.trading212.com/rest/v2/trading/open-positions`, {
        headers: {
          "accept": "application/json",
          "accept-language": "en-GB,en;q=0.9,en-US;q=0.8",
          "content-type": "application/json",
          "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\", \"Microsoft Edge\";v=\"132\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
          "x-trader-client": "application=WC4,version=7.62.0,dUUID=38fbb038-cccf-4559-9e21-fb2ac2cc4c6a,accountId=20434246"
        },
        referrer: "https://app.trading212.com/",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: `{\"notify\":\"${notify}\",\"quantity\":${quantity},\"limitDistance\":${limitDistance},\"stopDistance\":${stopDistance},\"instrumentCode\":\"${instrumentCode}\",\"targetPrice\":${targetPrice}}`,
        method: "POST",
        mode: "cors",
        credentials: "include"
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

// CLOSE MULTIPLE POSITIONS (add psotions ID's example "97fe5f24-0c72-455d-92f5-ebb205f55b00%2C525a4096-e560-43e4-83bf-3b08ff35106d")
function ClossAllProfit(mode, positions, callback) {
    fetch(`https://"${mode}".services.trading212.com/rest/v2/trading/open-positions/close-all/${positions}`, {
        "headers": {
          "accept": "application/json",
          "accept-language": "en-GB,en;q=0.9,en-US;q=0.8",
          "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\", \"Microsoft Edge\";v=\"132\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
          "x-trader-client": "application=WC4,version=7.63.0,dUUID=38fbb038-cccf-4559-9e21-fb2ac2cc4c6a,accountId=20434246"
        },
        "referrer": "https://app.trading212.com/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "DELETE",
        "mode": "cors",
        "credentials": "include"
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


console.log("content.js running")


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("received message from background")
    console.log(request)
    console.log(request.command)

    async function handler(request) {
        
        switch (request.command) {

            // Call get account function and return response
            case 'get_account':
                await fetchAccounts(request.mode, (result) => {
                    if (typeof result === 'string') {
                        // Handle error message
                        console.error("Error:", result);
                    } else {
                        // Handle success data
                        // console.log("Fetched data:", result);
                        sendResponse({type: 'contentReponse', data: result});
                    }
                });
                
                break;
            
            // call fetch_summary function and return response
            case 'get_summary':
                console.log("switch is working on get summary")
                await fetchSummary(request.mode, (result) => {
                    if (typeof result === 'string') {
                        // Handle error message
                        console.error("Error:", result);
                    } else {
                        // Handle success data
                        // console.log("Fetched data:", result);
                        sendResponse({type: 'contentReponse', data: result});
                    } 
                });

                break;

            case 'open_position':
                let orderData = JSON.parse(JSON.stringify(request.data))
                console.log(orderData.targetPrice)
                await openPosition(request.mode, orderData.notify, orderData.quantity, 
                    orderData.limitDistance, orderData.stopDistance, 
                    orderData.instrumentCode, orderData.targetPrice, (result) => {
                        if (typeof result === 'string') {
                            // Handle error message
                            console.error("Error:", result);
                        } else {
                            // Handle success data
                            // console.log("Fetched data:", result);
                            sendResponse({type: 'contentReponse', data: result});
                        } 
                });

                return;
        }
    };

    handler(request);

    return true;
})
