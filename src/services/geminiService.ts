import type { Ingredient } from "@/types/RecipeTypes";

export interface AIRecipeResult {
  name: string;
  emoji: string;
  description: string;
  category: string;
}

// Create a unique ID from the dish name
function createIngredientId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 30);
}

// Generate a recipe using Gemini AI via server-side API route
export async function generateRecipeWithAI(
  ingredients: Ingredient[],
  cookingMethod?: string,
  locale: string = "en"
): Promise<Ingredient | null> {
  console.log("[GeminiService] generateRecipeWithAI called");
  console.log("[GeminiService] Ingredients:", ingredients);
  console.log("[GeminiService] Cooking method:", cookingMethod);
  console.log("[GeminiService] Locale:", locale);

  try {
    const requestBody = {
      ingredients: ingredients.map((i) => ({
        name: i.name,
        emoji: i.emoji,
      })),
      cookingMethod,
      locale,
    };
    console.log("[GeminiService] Request body:", requestBody);

    const response = await fetch("/api/generate-recipe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("[GeminiService] Response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[GeminiService] API error:", errorData);
      return null;
    }

    const result: AIRecipeResult = await response.json();
    console.log("[GeminiService] AI Result:", result);

    // Create a new Ingredient from the AI result
    const newIngredient: Ingredient = {
      id: `ai_${createIngredientId(result.name)}`,
      name: result.name,
      emoji: result.emoji,
      category: result.category,
      discovered: true,
      difficulty: 3, // AI-generated recipes are medium-high difficulty
    };

    console.log("[GeminiService] New ingredient created:", newIngredient);
    return newIngredient;
  } catch (error) {
    console.error("[GeminiService] Error:", error);
    return null;
  }
}

// Check if AI generation is available (always true now since it's server-side)
export function isAIGenerationAvailable(): boolean {
  return true;
}
