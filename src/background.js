import { fetchEmbeddings } from './embedder.js';

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   if (changeInfo.status === 'complete' && tab.url && tab.url.includes('x.com')) {
//     chrome.scripting.executeScript({
//       target: { tabId: tabId },
//       files: ['content.js']
//     });
//   }
// });


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.tweet) {
    console.log("Background received tweet permalink:", message.permalink);

    // check if tweet is already embedded
    chrome.storage.local.get(["embeddedTweets"], (result) => {
      const embeddedTweets = result.embeddedTweets || {};
      if (message.permalink in embeddedTweets) {
        console.log("Tweet already embedded:", message.permalink);
        return;
      }
    });

    fetchEmbeddings(message.tweet).then(embeddingResp => {
            handleResponse(embeddingResp, message.tweet, message.permalink);
        }
    )}
});


function handleResponse(embeddingRes, text, url) {

  // if notdefined
  if (!embeddingRes || !embeddingRes.data || embeddingRes.data.length === 0) {
    console.error('Embedding response is undefined');
    return;
  }
  
  const embedding = embeddingRes.data[0].embedding;

  // Store data
  chrome.storage.local.get(["embeddedTweets"], (result) => {
        const embeddedTweets = result.embeddedTweets || {};
        embeddedTweets[url] = {embedding: embedding, text: text};

        chrome.storage.local.set({ embeddedTweets }, () => {
          if (chrome.runtime.lastError) {
            console.error("Error saving embedding:", chrome.runtime.lastError);
          }
        });
      });
}
