'use client';

import { useTranslations } from 'next-intl';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Recipe {
  name: string;
  emoji: string;
  ingredients: string[];
  difficulty: number;
  description: string;
}

interface RecipeSection {
  title: string;
  recipes: Recipe[];
}

const RecipesPage = () => {
  const params = useParams();
  const locale = params.locale as string;
  const [darkMode, setDarkMode] = useState(false);
  
  // Initialize dark mode from localStorage or system preferences
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(savedDarkMode === 'true');
    } else {
      const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDarkMode);
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  const allRecipes: RecipeSection[] = [
    {
      title: "Basic Recipes",
      recipes: [
        { name: "Dough", emoji: "🥟", ingredients: ["flour", "water"], difficulty: 2, description: "Mix flour and water to create basic dough" },
        { name: "Raw Pasta", emoji: "📏", ingredients: ["flour", "egg"], difficulty: 2, description: "Combine flour and egg to make raw pasta dough" },
        { name: "Tomato Sauce", emoji: "🥫", ingredients: ["tomato", "onion"], difficulty: 2, description: "Tomatoes and onions make the base for a simple sauce" },
        { name: "Pizza Base", emoji: "🫓", ingredients: ["dough", "tomato_sauce"], difficulty: 3, description: "Spread tomato sauce on dough for a pizza base" },
        { name: "Cake Batter", emoji: "🥣", ingredients: ["flour", "egg", "fruit"], difficulty: 3, description: "Mix flour, eggs and fruit for a simple cake batter" },
        { name: "Pizza", emoji: "🍕", ingredients: ["pizza_base", "cheese"], difficulty: 4, description: "Add cheese and your favorite toppings to the pizza base for a delicious pizza" },
        { name: "Sandwich", emoji: "🥪", ingredients: ["bread", "cheese"], difficulty: 3, description: "Place cheese between slices of bread for a simple sandwich" },
        { name: "Spaghetti", emoji: "🍝", ingredients: ["pasta", "tomato_sauce"], difficulty: 4, description: "Combine pasta with tomato sauce to make spaghetti" },
        { name: "Salad", emoji: "🥗", ingredients: ["diced_tomato", "diced_onion"], difficulty: 2, description: "Mix diced vegetables to create a simple salad" }
      ]
    },
    {
      title: "Asian Cuisine",
      recipes: [
        { name: "Fried Rice", emoji: "🍚", ingredients: ["rice", "egg"], difficulty: 3, description: "Stir-fry rice with eggs for a classic fried rice" },
        { name: "Stir Fry", emoji: "🥘", ingredients: ["rice_noodles", "soy_sauce"], difficulty: 3, description: "Stir-fry noodles with soy sauce for a quick Asian dish" },
        { name: "Sushi", emoji: "🍱", ingredients: ["rice", "fish"], difficulty: 4, description: "Roll rice and fish in seaweed for traditional sushi" },
        { name: "Ramen", emoji: "🍜", ingredients: ["noodles", "chicken"], difficulty: 4, description: "Combine noodles with chicken in a rich broth for ramen" }
      ]
    },
    {
      title: "Mexican Cuisine",
      recipes: [
        { name: "Tortilla", emoji: "🌮", ingredients: ["flour", "water"], difficulty: 2, description: "Mix flour and water to create tortilla dough" },
        { name: "Taco", emoji: "🌮", ingredients: ["tortilla", "meat"], difficulty: 3, description: "Fill tortilla with meat and toppings for a taco" },
        { name: "Burrito", emoji: "🌯", ingredients: ["tortilla", "rice", "meat"], difficulty: 4, description: "Wrap rice and meat in a tortilla for a hearty burrito" },
        { name: "Quesadilla", emoji: "🧀", ingredients: ["tortilla", "cheese"], difficulty: 3, description: "Fill tortilla with cheese and fold for a quesadilla" }
      ]
    },
    {
      title: "Indian Cuisine",
      recipes: [
        { name: "Curry Sauce", emoji: "🥘", ingredients: ["tomato", "onion", "spices"], difficulty: 2, description: "Simmer tomatoes and onions with spices for curry sauce" },
        { name: "Naan", emoji: "🫓", ingredients: ["flour", "yogurt"], difficulty: 3, description: "Mix flour with yogurt to create soft naan bread" },
        { name: "Curry", emoji: "🍛", ingredients: ["rice", "curry_sauce", "chicken"], difficulty: 4, description: "Combine rice with curry sauce and chicken for a rich curry" }
      ]
    },
    {
      title: "Italian Cuisine",
      recipes: [
        { name: "Pasta Sauce", emoji: "🍝", ingredients: ["tomato", "onion", "herbs"], difficulty: 2, description: "Simmer tomatoes with onions and herbs for pasta sauce" },
        { name: "Lasagna", emoji: "🍝", ingredients: ["pasta", "cheese", "pasta_sauce"], difficulty: 4, description: "Layer pasta with cheese and sauce for lasagna" },
        { name: "Risotto", emoji: "🍚", ingredients: ["rice", "chicken", "cheese"], difficulty: 4, description: "Slowly cook rice with chicken and cheese for creamy risotto" }
      ]
    },
    {
      title: "French Cuisine",
      recipes: [
        { name: "Crepe", emoji: "🥞", ingredients: ["flour", "milk", "egg"], difficulty: 2, description: "Create a thin pancake with a simple batter of flour, milk and egg" },
        { name: "Baguette", emoji: "🥖", ingredients: ["flour", "water", "salt"], difficulty: 3, description: "Mix flour, water and salt to form a dough, then bake into a French baguette" },
        { name: "Croissant", emoji: "🥐", ingredients: ["flour", "butter", "milk"], difficulty: 4, description: "Layer butter between thin sheets of dough to create flaky French pastries" },
        { name: "French Toast", emoji: "🍞", ingredients: ["bread", "egg", "milk"], difficulty: 3, description: "Dip bread in a mixture of egg and milk, then cook until golden" },
        { name: "Quiche", emoji: "🥧", ingredients: ["egg", "cream", "cheese"], difficulty: 4, description: "Combine eggs, cream, and cheese to create a savory custard base for quiche" }
      ]
    },
    {
      title: "Breakfast Recipes",
      recipes: [
        { name: "Omelette", emoji: "🍳", ingredients: ["egg", "cheese", "bell_pepper"], difficulty: 3, description: "Beat eggs and cook with cheese and peppers for a fluffy breakfast omelette" },
        { name: "Scrambled Eggs", emoji: "🍳", ingredients: ["egg", "milk", "butter"], difficulty: 2, description: "Whisk eggs with milk and cook in butter for perfect scrambled eggs" },
        { name: "Breakfast Burrito", emoji: "🌯", ingredients: ["tortilla", "egg", "cheese"], difficulty: 4, description: "Fill a tortilla with eggs and cheese for a hearty breakfast burrito" }
      ]
    },
    {
      title: "Mediterranean Recipes",
      recipes: [
        { name: "Tzatziki", emoji: "🥗", ingredients: ["yogurt", "cucumber", "herbs"], difficulty: 2, description: "Mix yogurt with cucumber and herbs for a refreshing Greek sauce" },
        { name: "Pita", emoji: "🫓", ingredients: ["flour", "water", "yogurt"], difficulty: 2, description: "Create a simple flatbread with flour, water, and a touch of yogurt" },
        { name: "Falafel", emoji: "🧆", ingredients: ["chickpeas", "herbs", "spices"], difficulty: 3, description: "Form chickpeas with herbs and spices into balls and fry them" },
        { name: "Hummus", emoji: "🫘", ingredients: ["pita", "falafel", "tzatziki"], difficulty: 3, description: "Blend chickpeas with tahini, lemon, and garlic for a smooth dip" }
      ]
    },
    {
      title: "Seafood Recipes",
      recipes: [
        { name: "Fish and Chips", emoji: "🍟", ingredients: ["fish", "potato", "flour"], difficulty: 4, description: "Batter fish and serve with fried potatoes for a classic dish" },
        { name: "Fish Taco", emoji: "🌮", ingredients: ["fish", "tortilla", "cabbage"], difficulty: 3, description: "Fill a tortilla with cooked fish and fresh toppings for a tasty taco" },
        { name: "Seafood Pasta", emoji: "🍝", ingredients: ["pasta", "fish", "cream"], difficulty: 4, description: "Combine pasta with seafood and a creamy sauce for a luxurious meal" }
      ]
    },
    {
      title: "Salad & Fresh Dishes",
      recipes: [
        { name: "Cucumber Salad", emoji: "🥗", ingredients: ["cucumber", "tomato"], difficulty: 2, description: "Slice cucumber and tomato for a refreshing salad" },
        { name: "Greek Salad", emoji: "🥗", ingredients: ["cucumber", "lettuce", "tomato"], difficulty: 3, description: "Mix fresh vegetables for a traditional Greek salad base" },
        { name: "Cucumber Sandwich", emoji: "🥪", ingredients: ["bread", "cucumber"], difficulty: 2, description: "A light and refreshing cucumber sandwich" },
        { name: "Croutons", emoji: "🍞", ingredients: ["bread", "salt"], difficulty: 2, description: "Season and toast bread pieces to make crunchy croutons" },
        { name: "Caesar Dressing", emoji: "🫗", ingredients: ["egg", "salt", "cheese"], difficulty: 3, description: "Whip eggs with salt and cheese to create a rich Caesar dressing" },
        { name: "Caesar Salad", emoji: "🥗", ingredients: ["lettuce", "croutons", "caesar_dressing"], difficulty: 4, description: "Toss lettuce and croutons in Caesar dressing for a classic Caesar salad" },
        { name: "Fruit Smoothie", emoji: "🥤", ingredients: ["cucumber_juice", "fruit"], difficulty: 3, description: "Blend cucumber juice with fruit for a refreshing smoothie" }
      ]
    },
    {
      title: "Desserts",
      recipes: [
        { name: "Ice Cream", emoji: "🍦", ingredients: ["milk", "sugar", "cream"], difficulty: 3, description: "Freeze milk, sugar, and cream for homemade ice cream" },
        { name: "Pancakes", emoji: "🥞", ingredients: ["flour", "egg", "milk"], difficulty: 2, description: "Mix ingredients and cook on a griddle for fluffy pancakes" },
        { name: "Waffles", emoji: "🧇", ingredients: ["pancakes", "butter", "syrup"], difficulty: 3, description: "Cook pancake batter in a waffle iron for crispy waffles" },
        { name: "Chocolate Cake", emoji: "🍰", ingredients: ["cake_batter", "chocolate", "cream"], difficulty: 4, description: "Add chocolate to cake batter and top with cream for a decadent dessert" },
        { name: "Cookie", emoji: "🍪", ingredients: ["flour", "butter", "chocolate"], difficulty: 2, description: "Mix flour, butter, and chocolate to bake into sweet cookies" },
        { name: "Donut", emoji: "🍩", ingredients: ["dough", "sugar", "oil"], difficulty: 3, description: "Shape dough into rings and fry in oil for a sweet treat" }
      ]
    },
    {
      title: "Drinks",
      recipes: [
        { name: "Milkshake", emoji: "🥤", ingredients: ["ice_cream", "milk"], difficulty: 2, description: "Blend ice cream with milk for a creamy milkshake" },
        { name: "Hot Chocolate", emoji: "☕", ingredients: ["milk", "chocolate", "sugar"], difficulty: 2, description: "Heat milk with chocolate and sugar for rich hot chocolate" },
        { name: "Lemonade", emoji: "🍋", ingredients: ["water", "lemon", "sugar"], difficulty: 2, description: "Mix water, lemon juice, and sugar for a refreshing drink" },
        { name: "Coffee", emoji: "☕", ingredients: ["water", "coffee_beans", "milk"], difficulty: 2, description: "Brew coffee beans with hot water and add milk for a morning pick-me-up" },
        { name: "Iced Coffee", emoji: "☕", ingredients: ["coffee", "ice", "milk"], difficulty: 3, description: "Chill coffee with ice and milk for a cooling caffeinated beverage" }
      ]
    }
  ];

  const totalRecipes = allRecipes.reduce((total, section) => total + section.recipes.length, 0);

  const renderStars = (difficulty: number) => {
    return Array(difficulty).fill('⭐').join('');
  };

  const formatIngredients = (ingredients: string[]) => {
    return ingredients.map(ing => ing.replace(/_/g, ' ')).join(' + ');
  };

  return (
    <main className={`min-h-screen p-4 sm:p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-b from-blue-50 to-white text-gray-800'} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className={`text-3xl sm:text-4xl font-bold tracking-[-1.5px] ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
              🍳 Secret Recipe Collection
            </h1>
            <p className={`text-lg mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Complete collection of all {totalRecipes} recipes in Infinite Meal
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={toggleDarkMode}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                darkMode 
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-800 text-white'
              }`}
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
            
            <Link 
              href={`/${locale}`} 
              className={`px-4 py-2 rounded-lg font-medium ${
                darkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              } transition-colors duration-300`}
            >
              🏠 Back to Game
            </Link>
          </div>
        </div>

        {/* Recipe Sections */}
        <div className="space-y-12">
          {allRecipes.map((section, sectionIndex) => (
            <section key={sectionIndex} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 transition-colors duration-300`}>
              <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-blue-300' : 'text-blue-600'} border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'} pb-3`}>
                {section.title} ({section.recipes.length} recipes)
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.recipes.map((recipe, recipeIndex) => (
                  <div 
                    key={recipeIndex} 
                    className={`${darkMode ? 'bg-gray-700 hover:bg-gray-650' : 'bg-gray-50 hover:bg-gray-100'} rounded-lg p-5 transition-all duration-200 hover:shadow-md border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{recipe.emoji}</div>
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {recipe.name}
                        </h3>
                        <div className={`text-sm mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-600'} font-medium`}>
                          {formatIngredients(recipe.ingredients)}
                        </div>
                        <div className="text-sm mb-2">
                          <span className="text-yellow-500">{renderStars(recipe.difficulty)}</span>
                          <span className={`ml-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Difficulty {recipe.difficulty}
                          </span>
                        </div>
                        <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {recipe.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className={`mt-12 text-center p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg transition-colors duration-300`}>
          <p className={`text-lg font-medium mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
            🎉 Complete Recipe Collection
          </p>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            You've discovered the secret to all {totalRecipes} recipes in Infinite Meal! 
            Now go back and try to craft them all in the game.
          </p>
          <div className="mt-4">
            <Link 
              href={`/${locale}`} 
              className={`inline-block px-6 py-3 rounded-full font-semibold ${
                darkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              } transition-colors duration-300`}
            >
              Start Cooking! 👨‍🍳
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default RecipesPage; 