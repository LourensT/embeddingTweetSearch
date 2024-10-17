import { fetchEmbeddings } from './embedder.js';

document.addEventListener('DOMContentLoaded', function () {
    const searchButton = document.getElementById('searchButton');
    searchButton.addEventListener('click', function () {
        // make loading spinner visible
        document.getElementById('loading').classList.remove('hidden');
        performSearch();
        // make loading spinner invisible
        document.getElementById('loading').classList.add('hidden');   
    });
});

function getEmbeddedTweets(callback) {
    chrome.storage.local.get(["embeddedTweets"], (result) => {
        const embeddedTweets = result.embeddedTweets || [];
        callback(embeddedTweets);
    });
}

function performSearch() {
    console.log('performing search');
    const paragraphInput = document.getElementById('paragraphInput').value.trim();

    if (paragraphInput) {
        fetchEmbeddings(paragraphInput)
            .then(embeddingResp => {
                const embedding = embeddingResp.data[0].embedding;

                // Fetch embedded web pages using a callback
                getEmbeddedTweets(embeddedTweets => {
                    console.log('Embedded tweets');
                    const similarities = {};
                    // set cutoff to minimum similarity
                    for (const [url, tweet] of Object.entries(embeddedTweets)) {
                        similarities[url] = cosinesim(embedding, tweet.embedding);
                    }
                    console.log('Similarities:', similarities);


                    const entries = Object.entries(similarities);
                    console.log('length:', embeddedTweets.length);

                    let numResults;
                    if(Object.keys(embeddedTweets).length < 3){
                        numResults = Object.keys(embeddedTweets).length;
                    } else {
                        numResults = 3;
                    }
                    
                    entries.sort((a, b) => b[1] - a[1]);

                    // Get the top 3 entries
                    const topThree = entries.slice(0, numResults);
                    console.log('Top three:', topThree);
                    const results = topThree.map(top => ({
                        title: embeddedTweets[top[0]].text.slice(0, 50) + '...',
                        url: top[0]
                    }));
                    displayResults(results);
                });
            })
            .catch(error => {
                console.error('Error fetching embeddings:', error);
            });
    } else {
        alert('Please enter a paragraph to search.');
    }
}

function displayResults(results) {
    const resultsList = document.getElementById('resultsList');
    resultsList.innerHTML = ''; // Clear previous results
    // counter
    var counter = 1;
    results.forEach(result => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = result.url;
        link.target = '_blank'; // Open link in a new tab
        // content should be is counter ... title
        link.textContent = counter + ". " + result.title;
        listItem.appendChild(link);
        resultsList.appendChild(listItem);
    });

    const resultsDiv = document.getElementById('results');
    resultsDiv.classList.remove('hidden');
}


function cosinesim(A, B) {
    var dotproduct = 0;
    var mA = 0;
    var mB = 0;

    for(var i = 0; i < A.length; i++) {
        dotproduct += A[i] * B[i];
        mA += A[i] * A[i];
        mB += B[i] * B[i];
    }

    mA = Math.sqrt(mA);
    mB = Math.sqrt(mB);
    var similarity = dotproduct / (mA * mB);

    return similarity;
}