// This is your new secure "back office" function: netlify/functions/chat.js

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Get the message from the frontend's request
  const { message, systemPrompt } = JSON.parse(event.body);
  
  // Get the secret API key from Netlify's environment variables
  const apiKey = process.env.GEMINI_API_KEY;
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  // Configuration: allow enforcement toggle and custom redirect message
  const enforceMentalOnly = (process.env.MENTAL_ENFORCEMENT || 'true').toLowerCase() === 'true';
  const redirectMessage = process.env.MENTAL_REDIRECT_MSG || "I can see you've been working really hard in your domain — it might be a good time to take a moment for your mental peace. If you'd like, we can talk about how you're feeling or techniques to relax and recharge.";

  // Basic mental-wellness intent detection (keyword-based). If not detected and enforcement is enabled,
  // return the empathetic redirect message instead of calling the external API.
  const wellnessKeywords = [
    'mental', 'mental health', 'anxiety', 'depression', 'stress', 'burnout', 'therapy', 'therapist',
    'counselor', 'mindfulness', 'meditation', 'self-care', 'self care', 'well-being', 'wellbeing',
    'suicide', 'suicidal', 'panic', 'lonely', 'loneliness', 'cope', 'coping', 'overwhelmed', 'sad', 'sadness',
    'happy', 'happiness', 'mood', 'feel', 'feeling', "i'm feeling", "i feel"
  ];

  const lowerMsg = (message || '').toLowerCase();

  const isWellness = wellnessKeywords.some(k => lowerMsg.includes(k));

  // Safety: if message references imminent self-harm, escalate with crisis resources (non-judgmental)
  const crisisKeywords = ['suicide', 'suicidal', 'kill myself', 'end my life', 'want to die'];
  const isCrisis = crisisKeywords.some(k => lowerMsg.includes(k));

  if (enforceMentalOnly && !isWellness && !isCrisis) {
    // Return a deterministic redirect reply so the frontend can display it as the chatbot's response
    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: redirectMessage,
        metadata: { reason: 'non_mental_topic', enforced: true }
      })
    };
  }

  if (isCrisis) {
    const crisisReply = process.env.MENTAL_CRISIS_MSG || "I'm really sorry you're feeling this way. I can't provide emergency help, but if you're in immediate danger please contact your local emergency services right now. If you can, consider reaching out to a trusted person or a crisis hotline in your country — you don't have to go through this alone.";
    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: crisisReply,
        metadata: { reason: 'crisis_detected', enforced: true }
      })
    };
  }

  const payload = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ parts: [{ text: message }] }]
  };

  try {
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
      body: JSON.stringify(result),
    };

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get response from AI.' }),
    };
  }
};