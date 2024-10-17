// Function to start observing the timeline once it's available
function observeTimeline() {
  const target = document.querySelector('div[aria-label="Timeline: Your Home Timeline"]');

  if (target) {
    console.log("Timeline found. Starting to observe tweets...");

    // Observe for changes in the timeline (new tweets loaded dynamically)
    const observer = new MutationObserver(() => {
      readAllTweets();
    });

    observer.observe(target, { childList: true, subtree: true });

    // Process tweets already present on load
    readAllTweets();
  } else {
    console.log("Timeline not found. Retrying...");
    // Retry after a short delay if the timeline is not found
    setTimeout(observeTimeline, 1000); // Retry every second
  }
}

// Utility function to read each tweet and its permalink
function readTweet(tweetElement) {
  const tweetText = tweetElement.querySelector('[data-testid="tweetText"]');
  const tweetLinkElement = tweetElement.querySelector('a[href*="/status/"]');

  if (tweetText && tweetLinkElement) {
    const tweetContent = tweetText.innerText;
    const tweetPermalink = "https://twitter.com" + tweetLinkElement.getAttribute('href');
    
    console.log("Handling Tweet:", tweetPermalink);
    
    // Optionally, send tweet data to the background script
    chrome.runtime.sendMessage({
      tweet: tweetContent,
      permalink: tweetPermalink
    });
  }
}

// Function to read all currently loaded tweets
function readAllTweets() {
  const tweets = document.querySelectorAll('article[data-testid="tweet"]');
  tweets.forEach(readTweet);
}

// Start the process when the content script runs
observeTimeline();
