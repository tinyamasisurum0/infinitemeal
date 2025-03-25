// Type definitions for the recipe system

export interface Ingredient {
  id: string;
  name: string;
  emoji: string;
  category: string;
  discovered: boolean;
  difficulty: number;
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
}

export interface DiscoveryItem extends Ingredient {
  method?: string;
}

export interface AdvancedRecipeCraftingProps {
  onDarkModeChange?: (isDarkMode: boolean) => void;
  initialDarkMode?: boolean;
}

// Define recipe categories
export const categories = {
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