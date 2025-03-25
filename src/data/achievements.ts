import { Achievement } from '../types/RecipeTypes';

// Initial achievements
export const initialAchievements: Achievement[] = [
  // Basic progression achievements
  { 
    id: 'first_combo', 
    name: 'First Combination', 
    description: 'Create your first new ingredient', 
    achieved: false 
  },
  { 
    id: 'master_chef', 
    name: 'Master Chef', 
    description: 'Create a dish with difficulty level 4', 
    achieved: false 
  },
  { 
    id: 'explorer', 
    name: 'Culinary Explorer', 
    description: 'Discover 5 new ingredients', 
    achieved: false 
  },
  { 
    id: 'gourmet', 
    name: 'Gourmet', 
    description: 'Create items from 5 different categories', 
    achieved: false 
  },
  
  // Discovery milestones
  {
    id: 'novice_chef',
    name: 'Novice Chef',
    description: 'Discover 10 different ingredients',
    achieved: false
  },
  {
    id: 'skilled_chef',
    name: 'Skilled Chef',
    description: 'Discover 25 different ingredients',
    achieved: false
  },
  {
    id: 'expert_chef',
    name: 'Expert Chef',
    description: 'Discover 50 different ingredients',
    achieved: false
  },
  {
    id: 'master_chef_discovery',
    name: 'Master of Ingredients',
    description: 'Discover 75% of all ingredients',
    achieved: false
  },
  {
    id: 'legendary_chef',
    name: 'Legendary Chef',
    description: 'Discover all ingredients',
    achieved: false
  },

  // Cooking method achievements
  {
    id: 'boiling_expert',
    name: 'Boiling Expert',
    description: 'Create 5 different ingredients using the Boil method',
    achieved: false
  },
  {
    id: 'frying_expert',
    name: 'Frying Expert',
    description: 'Create 5 different ingredients using the Fry method',
    achieved: false
  },
  {
    id: 'baking_expert',
    name: 'Baking Expert',
    description: 'Create 5 different ingredients using the Bake method',
    achieved: false
  },
  {
    id: 'chopping_expert',
    name: 'Chopping Expert',
    description: 'Create 5 different ingredients using the Chop method',
    achieved: false
  },
  {
    id: 'blending_expert',
    name: 'Blending Expert',
    description: 'Create 5 different ingredients using the Blend method',
    achieved: false
  },
  {
    id: 'method_master',
    name: 'Method Master',
    description: 'Use all cooking methods at least once',
    achieved: false
  },

  // Category achievements
  {
    id: 'vegetable_fanatic',
    name: 'Vegetable Fanatic',
    description: 'Discover all vegetable ingredients',
    achieved: false
  },
  {
    id: 'protein_powerhouse',
    name: 'Protein Powerhouse',
    description: 'Discover all protein ingredients',
    achieved: false
  },
  {
    id: 'grain_guru',
    name: 'Grain Guru',
    description: 'Discover all grain ingredients',
    achieved: false
  },
  {
    id: 'dairy_devotee',
    name: 'Dairy Devotee',
    description: 'Discover all dairy ingredients',
    achieved: false
  },
  {
    id: 'sauce_specialist',
    name: 'Sauce Specialist',
    description: 'Discover all sauce ingredients',
    achieved: false
  },
  {
    id: 'spice_sage',
    name: 'Spice Sage',
    description: 'Discover all spice ingredients',
    achieved: false
  },

  // Cuisine achievements
  {
    id: 'italian_chef',
    name: 'Italian Chef',
    description: 'Create pizza, pasta, and risotto',
    achieved: false
  },
  {
    id: 'asian_chef',
    name: 'Asian Chef',
    description: 'Create stir fry, fried rice, and sushi',
    achieved: false
  },
  {
    id: 'mexican_chef',
    name: 'Mexican Chef',
    description: 'Create tacos, burritos, and quesadillas',
    achieved: false
  },
  {
    id: 'indian_chef',
    name: 'Indian Chef',
    description: 'Create curry, naan, and curry sauce',
    achieved: false
  },
  {
    id: 'french_chef',
    name: 'French Chef',
    description: 'Create croissant, baguette, and quiche',
    achieved: false
  },
  {
    id: 'international_chef',
    name: 'International Chef',
    description: 'Create dishes from at least 3 different cuisines',
    achieved: false
  },

  // Special achievements
  {
    id: 'breakfast_baron',
    name: 'Breakfast Baron',
    description: 'Create pancakes, fried eggs, and boiled eggs',
    achieved: false
  },
  {
    id: 'lunch_lord',
    name: 'Lunch Lord',
    description: 'Create sandwich, salad, and soup',
    achieved: false
  },
  {
    id: 'dinner_duke',
    name: 'Dinner Duke',
    description: 'Create pasta, curry, and stew',
    achieved: false
  },
  {
    id: 'dessert_deity',
    name: 'Dessert Deity',
    description: 'Create all dessert items',
    achieved: false
  },
  {
    id: 'drink_director',
    name: 'Drink Director',
    description: 'Create all drink items',
    achieved: false
  },

  // Difficulty achievements
  {
    id: 'complexity_novice',
    name: 'Complexity Novice',
    description: 'Create 10 items with difficulty 2',
    achieved: false
  },
  {
    id: 'complexity_adept',
    name: 'Complexity Adept',
    description: 'Create 8 items with difficulty 3',
    achieved: false
  },
  {
    id: 'complexity_expert',
    name: 'Complexity Expert',
    description: 'Create 5 items with difficulty 4',
    achieved: false
  },

  // Themed achievements
  {
    id: 'veggie_victory',
    name: 'Veggie Victory',
    description: 'Create vegetable soup, salad, and stir fry',
    achieved: false
  },
  {
    id: 'carb_connoisseur',
    name: 'Carb Connoisseur',
    description: 'Create bread, pasta, and rice dishes',
    achieved: false
  },
  {
    id: 'sweet_tooth',
    name: 'Sweet Tooth',
    description: 'Create cake, ice cream, and fruit smoothie',
    achieved: false
  },
  {
    id: 'protein_perfect',
    name: 'Protein Perfect',
    description: 'Create dishes with chicken, fish, and meat',
    achieved: false
  },

  // Fun achievements
  {
    id: 'cucumber_king',
    name: 'Cucumber King',
    description: 'Create all cucumber-based items',
    achieved: false
  },
  {
    id: 'bread_baron',
    name: 'Bread Baron',
    description: 'Create bread, sandwich, and croutons',
    achieved: false
  },
  {
    id: 'pizza_perfectionist',
    name: 'Pizza Perfectionist',
    description: 'Create dough, pizza base, and pizza',
    achieved: false
  },
  {
    id: 'salad_superstar',
    name: 'Salad Superstar',
    description: 'Create all types of salads',
    achieved: false
  },
  {
    id: 'dairy_dream',
    name: 'Dairy Dream',
    description: 'Create dishes using milk, cheese, and butter',
    achieved: false
  },

  // Speedrun achievements
  {
    id: 'rapid_chef',
    name: 'Rapid Chef',
    description: 'Create 5 new ingredients in under 2 minutes',
    achieved: false
  },
  {
    id: 'speed_cooker',
    name: 'Speed Cooker',
    description: 'Create a difficulty 4 dish in under 5 minutes',
    achieved: false
  },

  // Challenge achievements
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Create a difficulty 3+ dish using only basic ingredients',
    achieved: false
  },
  {
    id: 'ingredient_master',
    name: 'Ingredient Master',
    description: 'Create 3 different recipes using the same ingredient',
    achieved: false
  },
  {
    id: 'perfect_cycle',
    name: 'Perfect Cycle',
    description: 'Use the output of one recipe as the input for another',
    achieved: false
  },
  {
    id: 'foodie',
    name: 'Foodie',
    description: 'Discover 10 different dishes',
    achieved: false
  },
]; 