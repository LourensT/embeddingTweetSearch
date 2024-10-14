import { fetchEmbeddings } from './embedder.js';

function handleResponse(embeddingRes, pageInfo) {
  console.log('Handling API Response for URL:', pageInfo.url);

  // if notdefined
  if (!embeddingRes || !embeddingRes.data || embeddingRes.data.length === 0) {
    console.error('Embedding response is undefined');
    return;
  }
  
  const embedding = embeddingRes.data[0].embedding;

  // Store data
  chrome.storage.local.get(["embeddedWebPages"], (result) => {
        const embeddedWebPages = result.embeddedWebPages || [];
        embeddedWebPages.push({embedding: embedding, URL: pageInfo.url, title: pageInfo.title } );

        chrome.storage.local.set({ embeddedWebPages }, () => {
          if (chrome.runtime.lastError) {
            console.error("Error saving embedding:", chrome.runtime.lastError);
          } else {
            console.log("Embedding successfully saved to chrome.storage.local");
          }
        });
      });
}


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
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
  // TODO actually extract the relevant text / permalinks of relevant content
  const pageInfo = {
    title: document.title,
    url: window.location.href,
    content: document.body.innerText.slice(0, 500)  // example: first 500 characters
  };

  // Check if content is already stored.

  // Send data to background script
  chrome.runtime.sendMessage({ action: "storeData", data: pageInfo });
};


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in background script:", message);
  if (message.action === "storeData") {
      fetchEmbeddings(message.data).then(embeddingResp => {
        handleResponse(embeddingResp, message.data);
      }
  )}
});