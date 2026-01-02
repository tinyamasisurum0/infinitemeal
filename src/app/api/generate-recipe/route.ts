import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

// Response schema for structured JSON output
const recipeResponseSchema = {
  type: Type.OBJECT,
  properties: {
    name: {
      type: Type.STRING,
      description: "The name of the resulting dish or ingredient",
    },
    emoji: {
      type: Type.STRING,
      description: "A single emoji that best represents this dish",
    },
    description: {
      type: Type.STRING,
      description: "A brief description of the dish (max 100 characters)",
    },
    category: {
      type: Type.STRING,
      enum: [
        "Mixed Items",
        "Dish",
        "Dessert",
        "Drink",
        "Sauce",
        "Basic Ingredient",
      ],
      description: "The category this result belongs to",
    },
  },
  required: ["name", "emoji", "description", "category"],
};

export async function POST(request: NextRequest) {
  console.log("[API] generate-recipe called");

  try {
    const apiKey = process.env.API_KEY;
    console.log("[API] API_KEY exists:", !!apiKey);

    if (!apiKey) {
      console.error("[API] API key not configured");
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { ingredients, cookingMethod } = body;
    console.log("[API] Received ingredients:", ingredients);
    console.log("[API] Cooking method:", cookingMethod);

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      console.error("[API] Invalid ingredients");
      return NextResponse.json(
        { error: "Invalid ingredients" },
        { status: 400 }
      );
    }

    // Always initialize GoogleGenAI inside the function scope
    const ai = new GoogleGenAI({ apiKey });

    const ingredientNames = ingredients.map(
      (i: { emoji: string; name: string }) => `${i.emoji} ${i.name}`
    );
    const methodText = cookingMethod
      ? `using the "${cookingMethod}" cooking method`
      : "by combining them";

    const prompt = `You are a creative culinary expert. Given these ingredients: ${ingredientNames.join(", ")}, ${methodText}, what dish or food item would result?

Consider real-world cuisine from around the globe. Be creative but realistic - the result should be something that makes culinary sense.

Respond with the most likely and interesting culinary result.`;

    console.log("[API] Sending prompt to Gemini...");

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeResponseSchema,
      },
    });

    console.log("[API] Gemini response received");
    const text = response.text;
    console.log("[API] Response text:", text);

    if (!text) {
      console.error("[API] No text in response");
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    const result = JSON.parse(text);
    console.log("[API] Parsed result:", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Gemini API error:", error);
    return NextResponse.json(
      { error: "Failed to generate recipe", details: String(error) },
      { status: 500 }
    );
  }
}
