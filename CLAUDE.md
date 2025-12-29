# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server with Turbopack
npm run build     # Production build
npm run lint      # Run ESLint
npm run start     # Start production server
```

## Architecture

**Infinite Meal** is a Next.js 15 recipe crafting game with internationalization (7 languages) using next-intl.

### Key Structure

- **src/app/[locale]/**: Locale-prefixed pages (Next.js App Router with dynamic locale segment)
- **src/components/AdvancedRecipeCrafting.tsx**: Main game component (2000+ lines) - contains all game logic, state management, UI, and persistence
- **src/data/**: Game data files
  - `ingredients.ts`: Ingredient definitions with categories, emojis, difficulty levels
  - `recipes.ts`: Recipe combinations (2-3 ingredients → result)
  - `cookingMethods.ts`: Cooking methods (boil, fry, bake, chop, blend, griddle) with transformations
  - `achievements.ts`: Achievement definitions
- **src/types/RecipeTypes.ts**: TypeScript interfaces (Ingredient, Recipe, CookingMethod, Achievement)
- **src/locales/{locale}/common.json**: Translation files (en, es, fr, de, it, nl, tr)
- **src/i18n.ts**: Locale configuration and message loading
- **src/middleware.ts**: Locale detection and routing

### State Persistence

Game progress persists via localStorage with cookie fallback. Uses global keys (`global_game_ingredients`, `global_game_achievements`) shared across all locales.

### Internationalization

- Uses `next-intl` with the `next-intl/plugin` in next.config.ts
- All routes prefixed with locale (e.g., `/en/recipes`, `/tr/about`)
- Translations accessed via `useTranslations` hook
- Locale detection from browser's Accept-Language header

### Game Mechanics

1. **Mixing**: Combine 2-3 ingredients to create new items (via `recipes.ts`)
2. **Cooking Methods**: Transform single ingredients (e.g., potato → fries via fry)
3. **Discoveries**: Track discovered ingredients per session
4. **Achievements**: Unlock based on discovery milestones and cooking actions

### Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json)
