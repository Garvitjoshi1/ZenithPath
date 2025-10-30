// This is your Netlify auth function to handle Firebase auth state and verification
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
    const { idToken } = JSON.parse(event.body);
    
    // Verify the Firebase ID token
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    return {
      statusCode: 200,
      body: JSON.stringify({
        uid,
        email: decodedToken.email,
        verified: decodedToken.email_verified
      })
    };

  } catch (error) {
    console.error('Auth verification error:', error);
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }
};