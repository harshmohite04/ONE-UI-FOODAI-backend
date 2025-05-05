import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  dietaryRestrictions: {
    type: [String],
    default: [],
  },
  favoriteCuisines: {
    type: [String],
    default: [],
  },
  priceRange: {
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 1000,
    },
  },
  lastOrder: {
    restaurant: String,
    items: [String],
    timestamp: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const User = mongoose.model('User', userSchema); 