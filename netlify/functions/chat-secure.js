// Secure chat function that requires authentication
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

// Initialize Firebase Admin once
let app;
if (!app) {
  app = initializeApp();
}

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Get the Authorization header
    const authHeader = event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { statusCode: 401, body: JSON.stringify({ error: 'No token provided' }) };
    }

    // Extract and verify the token
    const idToken = authHeader.split('Bearer ')[1];
    const auth = getAuth();
    await auth.verifyIdToken(idToken);

    // Get the message from the frontend's request
    const { message, systemPrompt } = JSON.parse(event.body);
    
    // Get the secret API key from Netlify's environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const payload = {
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: message }] }]
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const result = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result),
    };

  } catch (error) {
    if (error.code === 'auth/id-token-expired') {
      return { statusCode: 401, body: JSON.stringify({ error: 'Token expired' }) };
    }
    if (error.code && error.code.startsWith('auth/')) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Authentication failed' }) };
    }
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get response from AI.' }),
    };
  }
};