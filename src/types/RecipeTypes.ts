// Type definitions for the recipe system

export interface Ingredient {
  id: string;
  name: string;
  emoji: string;
  category: string;
  discovered: boolean;
  difficulty: number;
  description?: string;
}

export interface Transformation {
  id: string;
  name: string;
  emoji: string;
  category: string;
}

export interface CookingMethod {
  id: string;
  name: string;
  emoji: string;
  description: string;
  transformations: Record<string, Transformation>;
}

export interface Recipe {
  ingredients: string[];
  result: string;
  difficulty: number;
  description: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  achieved: boolean;
}

export interface RecipeHint extends Recipe {
  knownCount: number;
  knownIngredients: string[];
  unknownCount: number;
  almostThere: boolean;
}

export interface DiscoveryItem extends Ingredient {
  method?: string;
}

export interface AdvancedRecipeCraftingProps {
  onDarkModeChange?: (isDarkMode: boolean) => void;
  initialDarkMode?: boolean;
}

export interface DailyChallenge {
  id: string;
  type: 'discover' | 'difficulty' | 'category';
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  category?: string;
  difficulty?: number;
}

// Define recipe categories
export const categories = {
  MIXED_ITEMS: 'Mixed Items',
  BASIC: 'Basic Ingredient',
  VEGETABLE: 'Vegetable',
  PROTEIN: 'Protein',
  GRAIN: 'Grain',
  DAIRY: 'Dairy',
  SAUCE: 'Sauce',
  SPICE: 'Spice',
  DISH: 'Dish',
  DESSERT: 'Dessert',
  DRINK: 'Drink'
}; 