import { Recipe } from '../types/RecipeTypes';

// Recipe combinations
export const recipes: Recipe[] = [
  // Existing recipes
  { 
    ingredients: ['flour', 'water'], 
    result: 'dough', 
    difficulty: 2,
    description: 'Mix flour and water to create basic dough'
  },
  { 
    ingredients: ['flour', 'egg'], 
    result: 'pasta_raw', 
    difficulty: 2,
    description: 'Combine flour and egg to make raw pasta dough'
  },
  { 
    ingredients: ['tomato', 'onion'], 
    result: 'tomato_sauce', 
    difficulty: 2,
    description: 'Tomatoes and onions make the base for a simple sauce'
  },
  { 
    ingredients: ['dough', 'tomato_sauce'], 
    result: 'pizza_base', 
    difficulty: 3,
    description: 'Spread tomato sauce on dough for a pizza base'
  },
  { 
    ingredients: ['flour', 'egg', 'fruit'], 
    result: 'cake_batter', 
    difficulty: 3,
    description: 'Mix flour, eggs and fruit for a simple cake batter'
  },
  { 
    ingredients: ['pizza_base', 'cheese'], 
    result: 'pizza', 
    difficulty: 4,
    description: 'Add cheese and your favorite toppings to the pizza base for a delicious pizza'
  },
  { 
    ingredients: ['bread', 'cheese'], 
    result: 'sandwich', 
    difficulty: 3,
    description: 'Place cheese between slices of bread for a simple sandwich'
  },
  { 
    ingredients: ['pasta', 'tomato_sauce'], 
    result: 'spaghetti', 
    difficulty: 4,
    description: 'Combine pasta with tomato sauce to make spaghetti'
  },
  { 
    ingredients: ['diced_tomato', 'diced_onion'], 
    result: 'salad', 
    difficulty: 2,
    description: 'Mix diced vegetables to create a simple salad'
  },
  
  // New Asian Cuisine Recipes
  { 
    ingredients: ['rice', 'egg'], 
    result: 'fried_rice', 
    difficulty: 3,
    description: 'Stir-fry rice with eggs for a classic fried rice'
  },
  { 
    ingredients: ['rice_noodles', 'soy_sauce'], 
    result: 'stir_fry', 
    difficulty: 3,
    description: 'Stir-fry noodles with soy sauce for a quick Asian dish'
  },
  { 
    ingredients: ['rice', 'fish'], 
    result: 'sushi', 
    difficulty: 4,
    description: 'Roll rice and fish in seaweed for traditional sushi'
  },
  { 
    ingredients: ['noodles', 'chicken'], 
    result: 'ramen', 
    difficulty: 4,
    description: 'Combine noodles with chicken in a rich broth for ramen'
  },
  
  // New Mexican Cuisine Recipes
  { 
    ingredients: ['flour', 'water'], 
    result: 'tortilla', 
    difficulty: 2,
    description: 'Mix flour and water to create tortilla dough'
  },
  { 
    ingredients: ['tortilla', 'meat'], 
    result: 'taco', 
    difficulty: 3,
    description: 'Fill tortilla with meat and toppings for a taco'
  },
  { 
    ingredients: ['tortilla', 'rice', 'meat'], 
    result: 'burrito', 
    difficulty: 4,
    description: 'Wrap rice and meat in a tortilla for a hearty burrito'
  },
  { 
    ingredients: ['tortilla', 'cheese'], 
    result: 'quesadilla', 
    difficulty: 3,
    description: 'Fill tortilla with cheese and fold for a quesadilla'
  },
  
  // New Indian Cuisine Recipes
  { 
    ingredients: ['tomato', 'onion', 'spices'], 
    result: 'curry_sauce', 
    difficulty: 2,
    description: 'Simmer tomatoes and onions with spices for curry sauce'
  },
  { 
    ingredients: ['flour', 'yogurt'], 
    result: 'naan', 
    difficulty: 3,
    description: 'Mix flour with yogurt to create soft naan bread'
  },
  { 
    ingredients: ['rice', 'curry_sauce', 'chicken'], 
    result: 'curry', 
    difficulty: 4,
    description: 'Combine rice with curry sauce and chicken for a rich curry'
  },
  
  // New Italian Cuisine Recipes
  { 
    ingredients: ['tomato', 'onion', 'herbs'], 
    result: 'pasta_sauce', 
    difficulty: 2,
    description: 'Simmer tomatoes with onions and herbs for pasta sauce'
  },
  { 
    ingredients: ['pasta', 'cheese', 'pasta_sauce'], 
    result: 'lasagna', 
    difficulty: 4,
    description: 'Layer pasta with cheese and sauce for lasagna'
  },
  { 
    ingredients: ['rice', 'chicken', 'cheese'], 
    result: 'risotto', 
    difficulty: 4,
    description: 'Slowly cook rice with chicken and cheese for creamy risotto'
  },
  
  // New Dessert Recipes
  { 
    ingredients: ['milk', 'sugar', 'cream'], 
    result: 'ice_cream', 
    difficulty: 3,
    description: 'Freeze milk, sugar, and cream for homemade ice cream'
  },
  { 
    ingredients: ['flour', 'egg', 'milk'], 
    result: 'pancakes', 
    difficulty: 2,
    description: 'Mix ingredients and cook on a griddle for fluffy pancakes'
  },
  { 
    ingredients: ['pancakes', 'butter', 'syrup'], 
    result: 'waffles', 
    difficulty: 3,
    description: 'Cook pancake batter in a waffle iron for crispy waffles'
  },
  
  // New Drink Recipes
  { 
    ingredients: ['ice_cream', 'milk'], 
    result: 'milkshake', 
    difficulty: 2,
    description: 'Blend ice cream with milk for a creamy milkshake'
  },
  { 
    ingredients: ['milk', 'chocolate', 'sugar'], 
    result: 'hot_chocolate', 
    difficulty: 2,
    description: 'Heat milk with chocolate and sugar for rich hot chocolate'
  },
  
  // Existing cucumber recipes
  { 
    ingredients: ['cucumber', 'tomato'], 
    result: 'salad', 
    difficulty: 2,
    description: 'Slice cucumber and tomato for a refreshing salad'
  },
  { 
    ingredients: ['cucumber', 'lettuce', 'tomato'], 
    result: 'greek_salad', 
    difficulty: 3,
    description: 'Mix fresh vegetables for a traditional Greek salad base'
  },
  { 
    ingredients: ['bread', 'cucumber'], 
    result: 'cucumber_sandwich', 
    difficulty: 2,
    description: 'A light and refreshing cucumber sandwich'
  },
  { 
    ingredients: ['bread', 'salt'], 
    result: 'croutons', 
    difficulty: 2,
    description: 'Season and toast bread pieces to make crunchy croutons'
  },
  { 
    ingredients: ['egg', 'salt', 'cheese'], 
    result: 'caesar_dressing', 
    difficulty: 3,
    description: 'Whip eggs with salt and cheese to create a rich Caesar dressing'
  },
  { 
    ingredients: ['lettuce', 'croutons', 'caesar_dressing'], 
    result: 'caesar_salad', 
    difficulty: 4,
    description: 'Toss lettuce and croutons in Caesar dressing for a classic Caesar salad'
  },
  { 
    ingredients: ['diced_cucumber', 'diced_tomato'], 
    result: 'salad', 
    difficulty: 2,
    description: 'Combine diced cucumber and tomato for a fresh garden salad'
  },
  { 
    ingredients: ['shredded_lettuce', 'diced_cucumber', 'cheese'], 
    result: 'greek_salad', 
    difficulty: 3,
    description: 'Mix shredded lettuce, cucumber and cheese for a simple Greek salad'
  },
  { 
    ingredients: ['cucumber_juice', 'fruit'], 
    result: 'fruit_smoothie', 
    difficulty: 3,
    description: 'Blend cucumber juice with fruit for a refreshing smoothie'
  },
  { 
    ingredients: ['pickled_cucumber', 'bread', 'cheese'], 
    result: 'sandwich', 
    difficulty: 3,
    description: 'Layer pickled cucumber and cheese between bread for a tangy sandwich'
  },

  // French Cuisine Recipes
  { 
    ingredients: ['flour', 'milk', 'egg'], 
    result: 'crepe', 
    difficulty: 2,
    description: 'Create a thin pancake with a simple batter of flour, milk and egg'
  },
  { 
    ingredients: ['flour', 'water', 'salt'], 
    result: 'baguette', 
    difficulty: 3,
    description: 'Mix flour, water and salt to form a dough, then bake into a French baguette'
  },
  { 
    ingredients: ['flour', 'butter', 'milk'], 
    result: 'croissant', 
    difficulty: 4,
    description: 'Layer butter between thin sheets of dough to create flaky French pastries'
  },
  { 
    ingredients: ['bread', 'egg', 'milk'], 
    result: 'french_toast', 
    difficulty: 3,
    description: 'Dip bread in a mixture of egg and milk, then cook until golden'
  },
  { 
    ingredients: ['egg', 'cream', 'cheese'], 
    result: 'quiche', 
    difficulty: 4,
    description: 'Combine eggs, cream, and cheese to create a savory custard base for quiche'
  },

  // Breakfast Recipes
  { 
    ingredients: ['egg', 'cheese', 'bell_pepper'], 
    result: 'omelette', 
    difficulty: 3,
    description: 'Beat eggs and cook with cheese and peppers for a fluffy breakfast omelette'
  },
  { 
    ingredients: ['egg', 'milk', 'butter'], 
    result: 'scrambled_eggs', 
    difficulty: 2,
    description: 'Whisk eggs with milk and cook in butter for perfect scrambled eggs'
  },
  { 
    ingredients: ['tortilla', 'egg', 'cheese'], 
    result: 'breakfast_burrito', 
    difficulty: 4,
    description: 'Fill a tortilla with eggs and cheese for a hearty breakfast burrito'
  },

  // Mediterranean Recipes
  { 
    ingredients: ['yogurt', 'cucumber', 'herbs'], 
    result: 'tzatziki', 
    difficulty: 2,
    description: 'Mix yogurt with cucumber and herbs for a refreshing Greek sauce'
  },
  { 
    ingredients: ['flour', 'water', 'yogurt'], 
    result: 'pita', 
    difficulty: 2,
    description: 'Create a simple flatbread with flour, water, and a touch of yogurt'
  },
  { 
    ingredients: ['chickpeas', 'herbs', 'spices'], 
    result: 'falafel', 
    difficulty: 3,
    description: 'Form chickpeas with herbs and spices into balls and fry them'
  },
  { 
    ingredients: ['pita', 'falafel', 'tzatziki'], 
    result: 'hummus', 
    difficulty: 3,
    description: 'Blend chickpeas with tahini, lemon, and garlic for a smooth dip'
  },

  // Seafood Recipes
  { 
    ingredients: ['fish', 'potato', 'flour'], 
    result: 'fish_and_chips', 
    difficulty: 4,
    description: 'Batter fish and serve with fried potatoes for a classic dish'
  },
  { 
    ingredients: ['fish', 'tortilla', 'cabbage'], 
    result: 'fish_taco', 
    difficulty: 3,
    description: 'Fill a tortilla with cooked fish and fresh toppings for a tasty taco'
  },
  { 
    ingredients: ['pasta', 'fish', 'cream'], 
    result: 'seafood_pasta', 
    difficulty: 4,
    description: 'Combine pasta with seafood and a creamy sauce for a luxurious meal'
  },

  // Drink Recipes
  { 
    ingredients: ['water', 'lemon', 'sugar'], 
    result: 'lemonade', 
    difficulty: 2,
    description: 'Mix water, lemon juice, and sugar for a refreshing drink'
  },
  { 
    ingredients: ['water', 'coffee_beans', 'milk'], 
    result: 'coffee', 
    difficulty: 2,
    description: 'Brew coffee beans with hot water and add milk for a morning pick-me-up'
  },
  { 
    ingredients: ['coffee', 'ice', 'milk'], 
    result: 'iced_coffee', 
    difficulty: 3,
    description: 'Chill coffee with ice and milk for a cooling caffeinated beverage'
  },

  // Additional Dessert Recipes
  { 
    ingredients: ['cake_batter', 'chocolate', 'cream'], 
    result: 'chocolate_cake', 
    difficulty: 4,
    description: 'Add chocolate to cake batter and top with cream for a decadent dessert'
  },
  { 
    ingredients: ['flour', 'butter', 'chocolate'], 
    result: 'cookie', 
    difficulty: 2,
    description: 'Mix flour, butter, and chocolate to bake into sweet cookies'
  },
  { 
    ingredients: ['dough', 'sugar', 'oil'], 
    result: 'donut', 
    difficulty: 3,
    description: 'Shape dough into rings and fry in oil for a sweet treat'
  }
]; 