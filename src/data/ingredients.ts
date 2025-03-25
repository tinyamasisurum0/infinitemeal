import { Ingredient, categories } from '../types/RecipeTypes';

// Define basic starter ingredients that should be discovered at the beginning
export const BASIC_STARTER_INGREDIENTS = [
  'tomato', 'onion', 'cucumber', 'lettuce', 'egg', 
  'cheese', 'flour', 'water', 'meat', 'potato', 
  'salt', 'fruit', 'rice', 'milk', 'noodles', 'soy_sauce',
  'butter', 'sugar', 'chicken', 'fish', 'carrot', 'bell_pepper',
  'herbs', 'spices', 'chocolate', 'cream', 'syrup', 'yogurt',
  'chickpeas', 'lemon', 'coffee_beans', 'ice', 'cabbage', 'oil'
];

// Helper function to determine if an ingredient should be discovered initially
const isDiscoveredInitially = (id: string): boolean => {
  return BASIC_STARTER_INGREDIENTS.includes(id);
};

// Initial ingredients data
export const initialIngredients: Ingredient[] = [
  // Basic ingredients
  { id: 'tomato', name: 'Tomato', emoji: '🍅', category: categories.VEGETABLE, discovered: isDiscoveredInitially('tomato'), difficulty: 1 },
  { id: 'onion', name: 'Onion', emoji: '🧅', category: categories.VEGETABLE, discovered: isDiscoveredInitially('onion'), difficulty: 1 },
  { id: 'cucumber', name: 'Cucumber', emoji: '🥒', category: categories.VEGETABLE, discovered: isDiscoveredInitially('cucumber'), difficulty: 1 },
  { id: 'lettuce', name: 'Lettuce', emoji: '🥬', category: categories.VEGETABLE, discovered: isDiscoveredInitially('lettuce'), difficulty: 1 },
  { id: 'egg', name: 'Egg', emoji: '🥚', category: categories.PROTEIN, discovered: isDiscoveredInitially('egg'), difficulty: 1 },
  { id: 'cheese', name: 'Cheese', emoji: '🧀', category: categories.DAIRY, discovered: isDiscoveredInitially('cheese'), difficulty: 1 },
  { id: 'flour', name: 'Flour', emoji: '🌾', category: categories.GRAIN, discovered: isDiscoveredInitially('flour'), difficulty: 1 },
  { id: 'water', name: 'Water', emoji: '💧', category: categories.BASIC, discovered: isDiscoveredInitially('water'), difficulty: 1 },
  { id: 'meat', name: 'Meat', emoji: '🥩', category: categories.PROTEIN, discovered: isDiscoveredInitially('meat'), difficulty: 1 },
  { id: 'potato', name: 'Potato', emoji: '🥔', category: categories.VEGETABLE, discovered: isDiscoveredInitially('potato'), difficulty: 1 },
  { id: 'salt', name: 'Salt', emoji: '🧂', category: categories.SPICE, discovered: isDiscoveredInitially('salt'), difficulty: 1 },
  { id: 'fruit', name: 'Fruit', emoji: '🍎', category: categories.BASIC, discovered: isDiscoveredInitially('fruit'), difficulty: 1 },
  
  // Additional ingredients
  { id: 'rice', name: 'Rice', emoji: '🍚', category: categories.GRAIN, discovered: isDiscoveredInitially('rice'), difficulty: 1 },
  { id: 'noodles', name: 'Noodles', emoji: '🍜', category: categories.GRAIN, discovered: isDiscoveredInitially('noodles'), difficulty: 1 },
  { id: 'soy_sauce', name: 'Soy Sauce', emoji: '🫙', category: categories.SAUCE, discovered: isDiscoveredInitially('soy_sauce'), difficulty: 1 },
  { id: 'milk', name: 'Milk', emoji: '🥛', category: categories.DAIRY, discovered: isDiscoveredInitially('milk'), difficulty: 1 },
  { id: 'butter', name: 'Butter', emoji: '🧈', category: categories.DAIRY, discovered: isDiscoveredInitially('butter'), difficulty: 1 },
  { id: 'sugar', name: 'Sugar', emoji: '🍯', category: categories.SPICE, discovered: isDiscoveredInitially('sugar'), difficulty: 1 },
  { id: 'chicken', name: 'Chicken', emoji: '🍗', category: categories.PROTEIN, discovered: isDiscoveredInitially('chicken'), difficulty: 1 },
  { id: 'fish', name: 'Fish', emoji: '🐟', category: categories.PROTEIN, discovered: isDiscoveredInitially('fish'), difficulty: 1 },
  { id: 'carrot', name: 'Carrot', emoji: '🥕', category: categories.VEGETABLE, discovered: isDiscoveredInitially('carrot'), difficulty: 1 },
  { id: 'bell_pepper', name: 'Bell Pepper', emoji: '🫑', category: categories.VEGETABLE, discovered: isDiscoveredInitially('bell_pepper'), difficulty: 1 },
  
  // Existing complex items
  { id: 'dough', name: 'Dough', emoji: '🥟', category: categories.BASIC, discovered: isDiscoveredInitially('dough'), difficulty: 2 },
  { id: 'pasta_raw', name: 'Raw Pasta', emoji: '📏', category: categories.GRAIN, discovered: isDiscoveredInitially('pasta_raw'), difficulty: 2 },
  { id: 'tomato_sauce', name: 'Tomato Sauce', emoji: '🥫', category: categories.SAUCE, discovered: isDiscoveredInitially('tomato_sauce'), difficulty: 2 },
  { id: 'pizza_base', name: 'Pizza Base', emoji: '🫓', category: categories.BASIC, discovered: isDiscoveredInitially('pizza_base'), difficulty: 3 },
  { id: 'cake_batter', name: 'Cake Batter', emoji: '🥣', category: categories.BASIC, discovered: isDiscoveredInitially('cake_batter'), difficulty: 3 },
  { id: 'bread', name: 'Bread', emoji: '🍞', category: categories.GRAIN, discovered: isDiscoveredInitially('bread'), difficulty: 3 },
  { id: 'pasta', name: 'Pasta', emoji: '🍝', category: categories.GRAIN, discovered: isDiscoveredInitially('pasta'), difficulty: 3 },
  { id: 'pizza', name: 'Pizza', emoji: '🍕', category: categories.DISH, discovered: isDiscoveredInitially('pizza'), difficulty: 4 },
  { id: 'cake', name: 'Cake', emoji: '🍰', category: categories.DESSERT, discovered: isDiscoveredInitially('cake'), difficulty: 4 },
  { id: 'fruit_smoothie', name: 'Fruit Smoothie', emoji: '🥤', category: categories.DRINK, discovered: isDiscoveredInitially('fruit_smoothie'), difficulty: 2 },
  { id: 'salad', name: 'Salad', emoji: '🥗', category: categories.DISH, discovered: isDiscoveredInitially('salad'), difficulty: 2 },
  { id: 'sandwich', name: 'Sandwich', emoji: '🥪', category: categories.DISH, discovered: isDiscoveredInitially('sandwich'), difficulty: 3 },
  { id: 'soup', name: 'Soup', emoji: '🍲', category: categories.DISH, discovered: isDiscoveredInitially('soup'), difficulty: 3 },
  { id: 'stew', name: 'Stew', emoji: '🥘', category: categories.DISH, discovered: isDiscoveredInitially('stew'), difficulty: 4 },
  { id: 'spaghetti', name: 'Spaghetti', emoji: '🍝', category: categories.DISH, discovered: isDiscoveredInitially('spaghetti'), difficulty: 4 },
  { id: 'croutons', name: 'Croutons', emoji: '🍞', category: categories.GRAIN, discovered: isDiscoveredInitially('croutons'), difficulty: 2 },
  { id: 'caesar_dressing', name: 'Caesar Dressing', emoji: '🫗', category: categories.SAUCE, discovered: isDiscoveredInitially('caesar_dressing'), difficulty: 3 },
  { id: 'greek_salad', name: 'Greek Salad', emoji: '🥗', category: categories.DISH, discovered: isDiscoveredInitially('greek_salad'), difficulty: 3 },
  { id: 'caesar_salad', name: 'Caesar Salad', emoji: '🥗', category: categories.DISH, discovered: isDiscoveredInitially('caesar_salad'), difficulty: 4 },
  { id: 'cucumber_sandwich', name: 'Cucumber Sandwich', emoji: '🥪', category: categories.DISH, discovered: isDiscoveredInitially('cucumber_sandwich'), difficulty: 2 },
  
  // New complex items
  // Asian Cuisine
  { id: 'rice_noodles', name: 'Rice Noodles', emoji: '🍜', category: categories.GRAIN, discovered: isDiscoveredInitially('rice_noodles'), difficulty: 2 },
  { id: 'stir_fry', name: 'Stir Fry', emoji: '🥘', category: categories.DISH, discovered: isDiscoveredInitially('stir_fry'), difficulty: 3 },
  { id: 'fried_rice', name: 'Fried Rice', emoji: '🍚', category: categories.DISH, discovered: isDiscoveredInitially('fried_rice'), difficulty: 3 },
  { id: 'sushi', name: 'Sushi', emoji: '🍱', category: categories.DISH, discovered: isDiscoveredInitially('sushi'), difficulty: 4 },
  { id: 'ramen', name: 'Ramen', emoji: '🍜', category: categories.DISH, discovered: isDiscoveredInitially('ramen'), difficulty: 4 },
  
  // Mexican Cuisine
  { id: 'tortilla', name: 'Tortilla', emoji: '🌮', category: categories.GRAIN, discovered: isDiscoveredInitially('tortilla'), difficulty: 2 },
  { id: 'taco', name: 'Taco', emoji: '🌮', category: categories.DISH, discovered: isDiscoveredInitially('taco'), difficulty: 3 },
  { id: 'burrito', name: 'Burrito', emoji: '🌯', category: categories.DISH, discovered: isDiscoveredInitially('burrito'), difficulty: 4 },
  { id: 'quesadilla', name: 'Quesadilla', emoji: '🧀', category: categories.DISH, discovered: isDiscoveredInitially('quesadilla'), difficulty: 3 },
  
  // Indian Cuisine
  { id: 'curry_sauce', name: 'Curry Sauce', emoji: '🥘', category: categories.SAUCE, discovered: isDiscoveredInitially('curry_sauce'), difficulty: 2 },
  { id: 'naan', name: 'Naan', emoji: '🫓', category: categories.GRAIN, discovered: isDiscoveredInitially('naan'), difficulty: 3 },
  { id: 'curry', name: 'Curry', emoji: '🍛', category: categories.DISH, discovered: isDiscoveredInitially('curry'), difficulty: 4 },
  
  // Italian Cuisine
  { id: 'pasta_sauce', name: 'Pasta Sauce', emoji: '🍝', category: categories.SAUCE, discovered: isDiscoveredInitially('pasta_sauce'), difficulty: 2 },
  { id: 'lasagna', name: 'Lasagna', emoji: '🍝', category: categories.DISH, discovered: isDiscoveredInitially('lasagna'), difficulty: 4 },
  { id: 'risotto', name: 'Risotto', emoji: '🍚', category: categories.DISH, discovered: isDiscoveredInitially('risotto'), difficulty: 4 },
  
  // Desserts
  { id: 'ice_cream', name: 'Ice Cream', emoji: '🍦', category: categories.DESSERT, discovered: isDiscoveredInitially('ice_cream'), difficulty: 3 },
  { id: 'pancakes', name: 'Pancakes', emoji: '🥞', category: categories.DESSERT, discovered: isDiscoveredInitially('pancakes'), difficulty: 2 },
  { id: 'waffles', name: 'Waffles', emoji: '🧇', category: categories.DESSERT, discovered: isDiscoveredInitially('waffles'), difficulty: 3 },
  
  // Drinks
  { id: 'milkshake', name: 'Milkshake', emoji: '🥤', category: categories.DRINK, discovered: isDiscoveredInitially('milkshake'), difficulty: 2 },
  { id: 'hot_chocolate', name: 'Hot Chocolate', emoji: '☕', category: categories.DRINK, discovered: isDiscoveredInitially('hot_chocolate'), difficulty: 2 },
  
  // Existing transformed cucumber items
  { id: 'pickled_cucumber', name: 'Pickled Cucumber', emoji: '🥒', category: categories.VEGETABLE, discovered: isDiscoveredInitially('pickled_cucumber'), difficulty: 2 },
  { id: 'fried_cucumber', name: 'Fried Cucumber', emoji: '🥒', category: categories.VEGETABLE, discovered: isDiscoveredInitially('fried_cucumber'), difficulty: 2 },
  { id: 'diced_cucumber', name: 'Diced Cucumber', emoji: '🥒', category: categories.VEGETABLE, discovered: isDiscoveredInitially('diced_cucumber'), difficulty: 2 },
  { id: 'cucumber_juice', name: 'Cucumber Juice', emoji: '🥤', category: categories.DRINK, discovered: isDiscoveredInitially('cucumber_juice'), difficulty: 2 },
  { id: 'shredded_lettuce', name: 'Shredded Lettuce', emoji: '🥬', category: categories.VEGETABLE, discovered: isDiscoveredInitially('shredded_lettuce'), difficulty: 2 },

  // New additional ingredients
  { id: 'herbs', name: 'Herbs', emoji: '🌿', category: categories.SPICE, discovered: isDiscoveredInitially('herbs'), difficulty: 1 },
  { id: 'spices', name: 'Spices', emoji: '🌶️', category: categories.SPICE, discovered: isDiscoveredInitially('spices'), difficulty: 1 },
  { id: 'chocolate', name: 'Chocolate', emoji: '🍫', category: categories.BASIC, discovered: isDiscoveredInitially('chocolate'), difficulty: 1 },
  { id: 'cream', name: 'Cream', emoji: '🥄', category: categories.DAIRY, discovered: isDiscoveredInitially('cream'), difficulty: 1 },
  { id: 'syrup', name: 'Syrup', emoji: '🍯', category: categories.BASIC, discovered: isDiscoveredInitially('syrup'), difficulty: 1 },
  { id: 'yogurt', name: 'Yogurt', emoji: '🥛', category: categories.DAIRY, discovered: isDiscoveredInitially('yogurt'), difficulty: 1 },
  { id: 'chickpeas', name: 'Chickpeas', emoji: '🫘', category: categories.PROTEIN, discovered: isDiscoveredInitially('chickpeas'), difficulty: 1 },
  { id: 'lemon', name: 'Lemon', emoji: '🍋', category: categories.BASIC, discovered: isDiscoveredInitially('lemon'), difficulty: 1 },
  { id: 'coffee_beans', name: 'Coffee Beans', emoji: '☕', category: categories.BASIC, discovered: isDiscoveredInitially('coffee_beans'), difficulty: 1 },
  { id: 'ice', name: 'Ice', emoji: '🧊', category: categories.BASIC, discovered: isDiscoveredInitially('ice'), difficulty: 1 },
  { id: 'cabbage', name: 'Cabbage', emoji: '🥬', category: categories.VEGETABLE, discovered: isDiscoveredInitially('cabbage'), difficulty: 1 },
  { id: 'oil', name: 'Oil', emoji: '🫙', category: categories.BASIC, discovered: isDiscoveredInitially('oil'), difficulty: 1 },
  
  // French Cuisine
  { id: 'crepe', name: 'Crepe', emoji: '🥞', category: categories.DESSERT, discovered: isDiscoveredInitially('crepe'), difficulty: 2 },
  { id: 'baguette', name: 'Baguette', emoji: '🥖', category: categories.GRAIN, discovered: isDiscoveredInitially('baguette'), difficulty: 3 },
  { id: 'croissant', name: 'Croissant', emoji: '🥐', category: categories.DESSERT, discovered: isDiscoveredInitially('croissant'), difficulty: 4 },
  { id: 'french_toast', name: 'French Toast', emoji: '🍞', category: categories.DESSERT, discovered: isDiscoveredInitially('french_toast'), difficulty: 3 },
  { id: 'quiche', name: 'Quiche', emoji: '🥧', category: categories.DISH, discovered: isDiscoveredInitially('quiche'), difficulty: 4 },
  
  // Breakfast Items
  { id: 'omelette', name: 'Omelette', emoji: '🍳', category: categories.DISH, discovered: isDiscoveredInitially('omelette'), difficulty: 3 },
  { id: 'scrambled_eggs', name: 'Scrambled Eggs', emoji: '🍳', category: categories.DISH, discovered: isDiscoveredInitially('scrambled_eggs'), difficulty: 2 },
  { id: 'breakfast_burrito', name: 'Breakfast Burrito', emoji: '🌯', category: categories.DISH, discovered: isDiscoveredInitially('breakfast_burrito'), difficulty: 4 },
  
  // Mediterranean Dishes  
  { id: 'hummus', name: 'Hummus', emoji: '🫘', category: categories.DISH, discovered: isDiscoveredInitially('hummus'), difficulty: 3 },
  { id: 'tzatziki', name: 'Tzatziki', emoji: '🥗', category: categories.SAUCE, discovered: isDiscoveredInitially('tzatziki'), difficulty: 2 },
  { id: 'falafel', name: 'Falafel', emoji: '🧆', category: categories.DISH, discovered: isDiscoveredInitially('falafel'), difficulty: 3 },
  { id: 'pita', name: 'Pita', emoji: '🫓', category: categories.GRAIN, discovered: isDiscoveredInitially('pita'), difficulty: 2 },
  
  // Seafood Dishes
  { id: 'fish_and_chips', name: 'Fish and Chips', emoji: '🍟', category: categories.DISH, discovered: isDiscoveredInitially('fish_and_chips'), difficulty: 4 },
  { id: 'fish_taco', name: 'Fish Taco', emoji: '🌮', category: categories.DISH, discovered: isDiscoveredInitially('fish_taco'), difficulty: 3 },
  { id: 'seafood_pasta', name: 'Seafood Pasta', emoji: '🍝', category: categories.DISH, discovered: isDiscoveredInitially('seafood_pasta'), difficulty: 4 },
  
  // Additional Drinks
  { id: 'lemonade', name: 'Lemonade', emoji: '🍋', category: categories.DRINK, discovered: isDiscoveredInitially('lemonade'), difficulty: 2 },
  { id: 'coffee', name: 'Coffee', emoji: '☕', category: categories.DRINK, discovered: isDiscoveredInitially('coffee'), difficulty: 2 },
  { id: 'iced_coffee', name: 'Iced Coffee', emoji: '☕', category: categories.DRINK, discovered: isDiscoveredInitially('iced_coffee'), difficulty: 3 },
  
  // Additional Desserts
  { id: 'chocolate_cake', name: 'Chocolate Cake', emoji: '🍰', category: categories.DESSERT, discovered: isDiscoveredInitially('chocolate_cake'), difficulty: 4 },
  { id: 'cookie', name: 'Cookie', emoji: '🍪', category: categories.DESSERT, discovered: isDiscoveredInitially('cookie'), difficulty: 2 },
  { id: 'donut', name: 'Donut', emoji: '🍩', category: categories.DESSERT, discovered: isDiscoveredInitially('donut'), difficulty: 3 }
]; 