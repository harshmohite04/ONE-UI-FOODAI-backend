import express from 'express';
import { Configuration, OpenAIApi } from 'openai';
import { User } from '../models/user';

const router = express.Router();

// Initialize OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Chat endpoint
router.post('/message', async (req, res) => {
  try {
    const { message, userId } = req.body;

    // Get user preferences
    const user = await User.findById(userId);
    const userContext = user ? {
      dietaryRestrictions: user.dietaryRestrictions,
      favoriteCuisines: user.favoriteCuisines,
      priceRange: user.priceRange,
      lastOrder: user.lastOrder,
    } : {};

    // Create system message with user context
    const systemMessage = {
      role: 'system',
      content: `You are a food delivery AI assistant. User preferences: ${JSON.stringify(userContext)}`
    };

    // Create user message
    const userMessage = {
      role: 'user',
      content: message
    };

    // Get AI response
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [systemMessage, userMessage],
      temperature: 0.7,
      max_tokens: 150,
    });

    const aiResponse = completion.data.choices[0].message?.content;

    // Update user preferences based on the message
    if (user) {
      // Extract entities and update preferences
      const entities = extractEntities(message);
      if (entities.dietary) {
        user.dietaryRestrictions = [...new Set([...user.dietaryRestrictions, entities.dietary])];
      }
      if (entities.price) {
        user.priceRange.max = entities.price;
      }
      await user.save();
    }

    res.json({ response: aiResponse });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to extract entities
function extractEntities(message: string) {
  const entities = {
    cuisine: '',
    price: 0,
    dietary: '',
    action: '',
  };

  // Extract cuisine types
  const cuisines = ['indian', 'chinese', 'italian', 'mexican', 'thai'];
  cuisines.forEach(cuisine => {
    if (message.toLowerCase().includes(cuisine)) {
      entities.cuisine = cuisine;
    }
  });

  // Extract price
  const priceMatch = message.match(/₹\s*(\d+)/);
  if (priceMatch) {
    entities.price = parseInt(priceMatch[1]);
  }

  // Extract dietary preferences
  const dietary = ['vegetarian', 'vegan', 'gluten-free'];
  dietary.forEach(diet => {
    if (message.toLowerCase().includes(diet)) {
      entities.dietary = diet;
    }
  });

  // Extract action
  const actions = ['order', 'track', 'find', 'recommend', 'search'];
  actions.forEach(action => {
    if (message.toLowerCase().includes(action)) {
      entities.action = action;
    }
  });

  return entities;
}

export const chatRouter = router; 