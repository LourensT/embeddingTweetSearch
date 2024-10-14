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

function getEmbeddedWebPages(callback) {
    chrome.storage.local.get(["embeddedWebPages"], (result) => {
        const embeddedWebPages = result.embeddedWebPages || [];
        callback(embeddedWebPages);
    });
}

function performSearch() {
    console.log('performing search');
    const paragraphInput = document.getElementById('paragraphInput').value.trim();

    if (paragraphInput) {
        fetchEmbeddings({ content: paragraphInput, url: "Typed Paragraph" })
            .then(embeddingResp => {
                const embedding = embeddingResp.data[0].embedding;

                // Fetch embedded web pages using a callback
                getEmbeddedWebPages(embeddedWebPages => {
                    const similarities = [];
                    embeddedWebPages.forEach(page => {
                        similarities.push(cosinesim(embedding, page.embedding));
                    });

                    // Process similarities, find top results, and display them
                    const numResults = Math.min(3, embeddedWebPages.length);
                    const indices = similarities.map((e, i) => i)
                        .sort((a, b) => similarities[a] - similarities[b])
                        .slice(0, numResults);

                    const results = indices.map(index => ({
                        title: embeddedWebPages[index].title,
                        url: embeddedWebPages[index].URL
                    }));

                    console.log('Results from search:', results);

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