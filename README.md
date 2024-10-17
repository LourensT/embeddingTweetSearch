# Search Tweets you've seen with Semantic Embeddings (WIP)

Current state: super minimal prototype. 

<img src="https://github.com/LourensT/histsearch/blob/master/popup.PNG" alt="Pop up preview" width="350"/>

## Setup and install
1. Set `cred.js` in `src` folder with the following content
```js
export const OPENAI_API_KEY = 'sk-<api-key>';
```
2. Go to `chrome://extensions/` and enable developer mode (top right corner)
3. Click on `Load unpacked` and select the `src` folder

## Dev tips

To debug the popup and see console logs, open the popup and right-click on the popup and click on inspect to open the right DevTools.

To debug the chrome.local.storage that the extension uses, you need this extension:
* https://chromewebstore.google.com/detail/storage-area-explorer/ocfjjjjhkpapocigimmppepjgfdecjkb

Then go to 
* `chrome-extension://\<id\>/manifest.json`

and inspect the storage in the right-most tab.

## To do
- [ ] Only add tweets that are actually displayed instead of _all_ that are loaded by timeline
- [ ] Test how replies are handled
- [ ] Test how quoted tweets are handled
- [ ] Test how retweets are handled
- [ ] Include support for replies
- [ ] In the search results show who tweeted it instead of only text, and the cosim score
