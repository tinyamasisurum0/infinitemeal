import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { checkLimits, clientIp, RULES } from "@/lib/server/rateLimit";
import {
  parseAiIngredients,
  parseCookingMethod,
  validLocale,
} from "@/lib/server/recipeValidation";

// gemini-2.0-flash was shut down by Google on 2026-06-01; gemini-3.6-flash is
// its listed replacement. Override with GEMINI_MODEL without a code change.
const DEFAULT_MODEL = "gemini-3.6-flash";

// Language names for prompt
const languageNames: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  nl: "Dutch",
  tr: "Turkish",
};

const CATEGORIES = [
  "Mixed Items",
  "Dish",
  "Dessert",
  "Drink",
  "Sauce",
  "Basic Ingredient",
];

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
      enum: CATEGORIES,
      description: "The category this result belongs to",
    },
  },
  required: ["name", "emoji", "description", "category"],
};

export async function POST(request: NextRequest) {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("[API] API key not configured");
    return NextResponse.json({ error: "AI is not available" }, { status: 503 });
  }

  const ip = clientIp(request);
  const limit = await checkLimits([
    { rule: RULES.aiPerMinute(), id: ip },
    { rule: RULES.aiPerDay(), id: ip },
    { rule: RULES.aiGlobalDay(), id: "all" },
  ]);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const ingredients = parseAiIngredients(body.ingredients);
  const cookingMethod = parseCookingMethod(body.cookingMethod);
  if (!ingredients || cookingMethod === null) {
    return NextResponse.json({ error: "Invalid ingredients" }, { status: 400 });
  }
  const language = languageNames[validLocale(body.locale)];

  const ingredientNames = ingredients.map((i) => `${i.emoji} ${i.name}`.trim());
  const methodText = cookingMethod
    ? `using the "${cookingMethod}" cooking method`
    : "by combining them";

  const prompt = `You are a creative culinary expert. Given these ingredients: ${ingredientNames.join(", ")}, ${methodText}, what dish or food item would result?

Consider real-world cuisine from around the globe. Be creative but realistic - the result should be something that makes culinary sense.

IMPORTANT: Respond in ${language}. The dish name, description, and all text must be in ${language}.

Respond with the most likely and interesting culinary result.`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeResponseSchema,
        maxOutputTokens: 512,
      },
    });

    const text = response.text;
    if (!text) {
      console.error("[API] No text in Gemini response");
      return NextResponse.json({ error: "No response from AI" }, { status: 502 });
    }

    const parsed = JSON.parse(text);
    // Clamp what we pass back to the browser.
    const result = {
      name: String(parsed.name ?? "").slice(0, 80),
      emoji: String(parsed.emoji ?? "🍽️").slice(0, 16),
      description: String(parsed.description ?? "").slice(0, 300),
      category: CATEGORIES.includes(parsed.category) ? parsed.category : "Dish",
    };
    if (!result.name) {
      return NextResponse.json({ error: "No response from AI" }, { status: 502 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Gemini API error:", error);
    return NextResponse.json({ error: "Failed to generate recipe" }, { status: 500 });
  }
}
