import express from 'express';
import { User } from '../models/user';

const router = express.Router();

// Create new user
router.post('/', async (req, res) => {
  try {
    const user = new User();
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
});

// Get user preferences
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user' });
  }
});

// Update user preferences
router.put('/:userId', async (req, res) => {
  try {
    const { dietaryRestrictions, favoriteCuisines, priceRange } = req.body;
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (dietaryRestrictions) user.dietaryRestrictions = dietaryRestrictions;
    if (favoriteCuisines) user.favoriteCuisines = favoriteCuisines;
    if (priceRange) user.priceRange = priceRange;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error updating user' });
  }
});

// Update last order
router.post('/:userId/order', async (req, res) => {
  try {
    const { restaurant, items } = req.body;
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.lastOrder = {
      restaurant,
      items,
      timestamp: new Date(),
    };

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error updating order' });
  }
});

export const userRouter = router; 