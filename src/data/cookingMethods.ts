import { CookingMethod, categories } from '../types/RecipeTypes';

// Cooking methods with different effects
export const cookingMethods: CookingMethod[] = [
  { 
    id: 'mix', 
    name: 'Mix', 
    emoji: '🥄',
    description: 'Combine ingredients to create new recipes',
    transformations: {}
  },
  { 
    id: 'boil', 
    name: 'Boil', 
    emoji: '♨️',
    description: 'Softens ingredients and extracts flavors',
    transformations: {
      'potato': { id: 'boiled_potato', name: 'Boiled Potato', emoji: '🥔', category: categories.BASIC },
      'egg': { id: 'boiled_egg', name: 'Boiled Egg', emoji: '🥚', category: categories.PROTEIN },
      'pasta_raw': { id: 'pasta', name: 'Pasta', emoji: '🍝', category: categories.GRAIN },
      'cucumber': { id: 'pickled_cucumber', name: 'Pickled Cucumber', emoji: '🥒', category: categories.VEGETABLE }
    }
  },
  { 
    id: 'fry', 
    name: 'Fry', 
    emoji: '🍳',
    description: 'Crisps the outside, adds richness',
    transformations: {
      'egg': { id: 'fried_egg', name: 'Fried Egg', emoji: '🍳', category: categories.PROTEIN },
      'potato': { id: 'fries', name: 'French Fries', emoji: '🍟', category: categories.VEGETABLE },
      'dough': { id: 'fried_dough', name: 'Fried Dough', emoji: '🥯', category: categories.BASIC },
      'cucumber': { id: 'fried_cucumber', name: 'Fried Cucumber', emoji: '🥒', category: categories.VEGETABLE }
    }
  },
  { 
    id: 'bake', 
    name: 'Bake', 
    emoji: '🔥',
    description: 'Slow, even cooking with dry heat',
    transformations: {
      'dough': { id: 'bread', name: 'Bread', emoji: '🍞', category: categories.GRAIN },
      'pizza_base': { id: 'pizza', name: 'Pizza', emoji: '🍕', category: categories.DISH },
      'cake_batter': { id: 'cake', name: 'Cake', emoji: '🍰', category: categories.DESSERT },
      'bread': { id: 'croutons', name: 'Croutons', emoji: '🍞', category: categories.GRAIN }
    }
  },
  { 
    id: 'griddle', 
    name: 'Griddle', 
    emoji: '🥞',
    description: 'Cook flatbreads and pancakes on a hot, flat surface',
    transformations: {
      'dough': { id: 'tortilla', name: 'Tortilla', emoji: '🌮', category: categories.GRAIN }
    }
  },
  { 
    id: 'chop', 
    name: 'Chop', 
    emoji: '🔪',
    description: 'Cuts ingredients into smaller pieces',
    transformations: {
      'tomato': { id: 'diced_tomato', name: 'Diced Tomato', emoji: '🍅', category: categories.VEGETABLE },
      'onion': { id: 'diced_onion', name: 'Diced Onion', emoji: '🧅', category: categories.VEGETABLE },
      'meat': { id: 'diced_meat', name: 'Diced Meat', emoji: '🥩', category: categories.PROTEIN },
      'cucumber': { id: 'diced_cucumber', name: 'Diced Cucumber', emoji: '🥒', category: categories.VEGETABLE },
      'lettuce': { id: 'shredded_lettuce', name: 'Shredded Lettuce', emoji: '🥬', category: categories.VEGETABLE }
    }
  },
  { 
    id: 'blend', 
    name: 'Blend', 
    emoji: '🧂',
    description: 'Combines ingredients into a smooth mixture',
    transformations: {
      'tomato': { id: 'tomato_puree', name: 'Tomato Puree', emoji: '🥫', category: categories.SAUCE },
      'fruit': { id: 'fruit_smoothie', name: 'Fruit Smoothie', emoji: '🥤', category: categories.DRINK },
      'vegetable': { id: 'vegetable_soup', name: 'Vegetable Soup', emoji: '🥣', category: categories.DISH },
      'cucumber': { id: 'cucumber_juice', name: 'Cucumber Juice', emoji: '🥤', category: categories.DRINK }
    }
  }
]; 