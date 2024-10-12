import { OPENAI_API_KEY } from './cred.js';

function handleResponse(embeddingRes, pageInfo) {
  console.log('API Response for URL:', pageInfo.url);
  
  const embedding = embeddingRes.data[0].embedding;

  // Store data
  chrome.storage.local.get(["embeddedWebPages"], (result) => {
        const embeddedWebPages = result.embeddedWebPages || [];
        embeddedWebPages.push({embedding: embedding, URL: pageInfo.url } );

        chrome.storage.local.set({ embeddedWebPages }, () => {
          if (chrome.runtime.lastError) {
            console.error("Error saving embedding:", chrome.runtime.lastError);
          } else {
            console.log("Embedding successfully saved to chrome.storage.local");
          }
        });
      });
}


async function fetchEmbeddings( pageInfo ) {
  console.log('fetchEmbeddings called', pageInfo.url);
  const url = 'https://api.openai.com/v1/embeddings';
  
  const requestOptions = {
    method: 'POST', // This is a POST request, not GET
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      input: pageInfo.content,
      model: "text-embedding-3-small"
    })
  };

  try {
    console.log('Fetching embeddings for URL:', pageInfo.url);
    const response = await fetch(url, requestOptions);

    // Check if response is OK
    if (!response.ok) {
      console.error('API Error:', response.status, response.statusText);
      return;
    }

    // Check if the response is JSON
    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      handleResponse(data, pageInfo);
    } else {
      // Handle non-JSON response
      const text = await response.text();
      console.error('Unexpected response format:', text);
    }

  } catch (error) {
    console.error('Error fetching embeddings:', error);
  }
}


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    console.log(OPENAI_API_KEY)

    console.log("Listener called for URL: ", tab.url);

    chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: extractPageData
    }, (result) => {
      if (chrome.runtime.lastError) {
        console.error("Script injection failed: ", chrome.runtime.lastError.message);
      } else {
        console.log("Script injection succeeded!");
      }
    });
  }
});


function extractPageData() {

  console.log("Extract Page Data")

  // TODO actually extract the relevant text
  const pageInfo = {
    title: document.title,
    url: window.location.href,
    content: document.body.innerText.slice(0, 500)  // example: first 500 characters
  };

  // Send data to background script
  chrome.runtime.sendMessage({ action: "storeData", data: pageInfo });
};


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in background script:", message);
  if (message.action === "storeData") {
      fetchEmbeddings(message.data);
  }
});