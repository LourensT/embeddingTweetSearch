import { OPENAI_API_KEY } from './cred.js';

export async function fetchEmbeddings( some_text ) {
  const url = 'https://api.openai.com/v1/embeddings';
  
  const requestOptions = {
    method: 'POST', // This is a POST request, not GET
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      input: some_text,
      model: "text-embedding-3-small"
    })
  };

  try {
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
      return data;
    } else {
      // Handle non-JSON response
      const text = await response.text();
      console.error('Unexpected response format:', text);
    }
  } catch (error) {
    console.error('Error fetching embeddings:', error);
  }
}

