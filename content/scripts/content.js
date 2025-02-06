// Define your fetch function
function fetchAccounts(callback) {
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

function fetchSummary(callback) {
    fetch("https://demo.services.trading212.com/rest/trading/v1/cfd/accounts/summary", {
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

function openPosition(callback) {
    fetch("https://demo.services.trading212.com/rest/v2/trading/open-positions", {
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
        body: "{\"notify\":\"NONE\",\"quantity\":900,\"limitDistance\":0.0125,\"stopDistance\":0.0125,\"instrumentCode\":\"GBPUSD\",\"targetPrice\":1.24954}",
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


console.log("content.js running")
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("received message from background")
    console.log(request)
    if (request.command === 'get_account') {
        fetchAccounts((result) => {
            if (typeof result === 'string') {
                // Handle error message
                console.error("Error:", result);
            } else {
                // Handle success data
                // console.log("Fetched data:", result);
                sendResponse({type: 'contentReponse', data: result});
            }
        });
    };

    if (request.command === 'get_summary') {
        fetchSummary((result) => {
            if (typeof result === 'string') {
                // Handle error message
                console.error("Error:", result);
            } else {
                // Handle success data
                // console.log("Fetched data:", result);
                sendResponse({type: 'contentReponse', data: result});
            }
        });
    };

    if (request.command === 'open_position') {
        openPosition((result) => {
            if (typeof result === 'string') {
                // Handle error message
                console.error("Error:", result);
            } else {
                // Handle success data
                // console.log("Fetched data:", result);
                sendResponse({type: 'contentReponse', data: result});
            }
        });
    };

    return true;
})
