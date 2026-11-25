import 'server-only';

/** Shape checks for recipe data that arrives from the browser. */
const CATEGORIES = new Set([
  'Mixed Items',
  'Dish',
  'Dessert',
  'Drink',
  'Sauce',
  'Basic Ingredient',
]);

const LOCALES = new Set(['en', 'es', 'fr', 'de', 'it', 'nl', 'tr']);

export interface RecipeResult {
  id: string;
  name: string;
  emoji: string;
  category: string;
  difficulty: number;
  description: string;
}

export interface RecipeInput {
  ingredients: string[];
  result: RecipeResult;
}

function str(v: unknown, max: number, min = 1): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s.length >= min && s.length <= max ? s : null;
}

export function validLocale(v: unknown): string {
  return typeof v === 'string' && LOCALES.has(v) ? v : 'en';
}

export function parseRecipe(raw: unknown): RecipeInput | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const ingredients = r.ingredients;
  if (!Array.isArray(ingredients) || ingredients.length < 1 || ingredients.length > 5) return null;
  const ids = ingredients.map((i) => str(i, 80));
  if (ids.some((i) => i === null)) return null;

  const res = r.result as Record<string, unknown> | undefined;
  if (!res || typeof res !== 'object') return null;
  const id = str(res.id, 80);
  const name = str(res.name, 80);
  const emoji = str(res.emoji, 16);
  const category = typeof res.category === 'string' ? res.category : 'Dish';
  const difficulty = Number(res.difficulty ?? 3);
  const description = res.description === undefined ? '' : str(res.description, 300, 0);
  if (!id || !name || !emoji || description === null) return null;
  if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 10) return null;

  return {
    ingredients: ids as string[],
    result: {
      id,
      name,
      emoji,
      category: CATEGORIES.has(category) ? category : 'Dish',
      difficulty,
      description,
    },
  };
}

/** Ingredients sent to the AI route: [{ name, emoji }], 1–3 items. */
export function parseAiIngredients(raw: unknown): Array<{ name: string; emoji: string }> | null {
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > 3) return null;
  const out: Array<{ name: string; emoji: string }> = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') return null;
    const name = str((item as Record<string, unknown>).name, 60);
    const emoji = str((item as Record<string, unknown>).emoji, 16, 0) ?? '';
    if (!name) return null;
    // Strip characters that could be used to break out of the prompt.
    out.push({ name: name.replace(/["`\n\r]/g, ' '), emoji });
  }
  return out;
}

export function parseCookingMethod(raw: unknown): string | undefined | null {
  if (raw === undefined || raw === null || raw === '') return undefined;
  const m = str(raw, 30);
  return m && /^[\p{L}\p{N} _-]+$/u.test(m) ? m : null;
}
