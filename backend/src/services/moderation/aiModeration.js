/**
 * AI Moderation Service
 * Uses OpenAI API to moderate comments for profanity, spam, and gibberish
 */

const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Timeout for API calls (in milliseconds)
const MODERATION_TIMEOUT = 5000;

/**
 * Moderate a comment using AI
 * @param {string} commentText - The comment text to moderate
 * @returns {Promise<object>} { allowed: boolean, reason: string, confidence: number }
 */
const moderateComment = async (commentText) => {
  if (!process.env.OPENAI_API_KEY) {
    // If no API key, reject to be safe
    return {
      allowed: false,
      reason: 'Moderation service unavailable',
      confidence: 1.0,
    };
  }

  // Escape quotes in comment text to prevent prompt injection
  const escapedComment = commentText.replace(/"/g, '\\"').replace(/\n/g, '\\n');
  
  const prompt = `Analyze this comment for moderation. Check for:
1. Profanity, hate speech, or offensive language
2. Spam, promotional content, or advertising links
3. Gibberish or meaningless text

Comment: "${escapedComment}"

Return JSON only with: {"allowed": boolean, "reason": "string", "confidence": 0.0-1.0}`;

  try {
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Moderation timeout')), MODERATION_TIMEOUT);
    });

    // Create the API call promise
    const apiPromise = openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a content moderation system. Always respond with valid JSON only in this exact format: {"allowed": boolean, "reason": "string", "confidence": number}. Do not include any text before or after the JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 100,
      response_format: { type: 'json_object' },
    });

    // Race between API call and timeout
    const response = await Promise.race([apiPromise, timeoutPromise]);

    // Extract the content
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    // Parse JSON response
    let moderationResult;
    try {
      moderationResult = JSON.parse(content);
    } catch (parseError) {
      // Try to extract JSON from response if it's wrapped in text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        moderationResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from AI');
      }
    }

    // Validate the response structure
    if (typeof moderationResult.allowed !== 'boolean') {
      throw new Error('Invalid moderation response: missing or invalid "allowed" field');
    }

    if (typeof moderationResult.reason !== 'string') {
      throw new Error('Invalid moderation response: missing or invalid "reason" field');
    }

    if (typeof moderationResult.confidence !== 'number' || 
        moderationResult.confidence < 0 || 
        moderationResult.confidence > 1) {
      // Default confidence if invalid
      moderationResult.confidence = moderationResult.allowed ? 0.7 : 0.8;
    }

    return {
      allowed: moderationResult.allowed,
      reason: moderationResult.reason || 'Moderation check completed',
      confidence: moderationResult.confidence,
    };
  } catch (error) {
    // Log error without exposing user content
    console.error('AI moderation error:', error.message);

    // On any error, reject the comment to be safe
    return {
      allowed: false,
      reason: 'Unable to verify comment content',
      confidence: 0.5,
    };
  }
};

module.exports = {
  moderateComment,
};

