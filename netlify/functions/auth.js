// This is your Netlify auth function to handle Firebase auth state and verification
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Initialize Firebase Admin once
let app;
if (!app) {
  app = initializeApp();
}

exports.handler = async function(event, context) {
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders
    };
  }
  
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Get the Authorization header
    const authHeader = event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { 
        statusCode: 401, 
        headers: corsHeaders,
        body: JSON.stringify({ error: 'No token provided' }) 
      };
    }

    // Extract and verify the token
    const idToken = authHeader.split('Bearer ')[1];
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idToken);

    // Return the decoded token info
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        uid: decodedToken.uid,
        email: decodedToken.email,
        email_verified: decodedToken.email_verified
      })
    };

  } catch (error) {
    console.error('Auth verification error:', error);

    if (error.code === 'auth/id-token-expired') {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Token expired' })
      };
    }

    if (error.code === 'auth/id-token-revoked') {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Token revoked' })
      };
    }

    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Invalid token' })
    };
  }
};