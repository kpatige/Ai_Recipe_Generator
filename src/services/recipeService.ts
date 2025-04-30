import { getRecipeFromOllama } from './ollamaService';

interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  image_prompt?: string;
  cookingTime?: string;
  servings?: number;
  difficulty?: string;
  source?: string;
}

// TheMealDB (no key required)
const getRecipeFromMealDB = async (query: string): Promise<Recipe> => {
  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`
    );
    const data = await response.json();
    
    if (data.meals && data.meals[0]) {
      const meal = data.meals[0];
      const ingredients = [];
      for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim()) {
          ingredients.push(`${measure} ${ingredient}`.trim());
        }
      }
      return {
        title: meal.strMeal,
        ingredients,
        instructions: meal.strInstructions.split('\n').filter(Boolean),
        image_prompt: meal.strMeal,
        source: 'TheMealDB'
      };
    }
    throw new Error('No recipe found');
  } catch (error) {
    throw error;
  }
};

// (Optional) Local static dataset fallback
// const getRecipeFromLocalJSON = async (query: string): Promise<Recipe> => {
//   // Implement your own static recipe lookup here
//   throw new Error('No recipe found in local dataset');
// };

// Text to speech function
export const speakText = (text: string) => {
  return new Promise<void>((resolve, reject) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);
      window.speechSynthesis.speak(utterance);
    } else {
      reject(new Error('Text-to-speech not supported in this browser'));
    }
  });
};

export const formatRecipeForSpeech = (recipe: Recipe): string => {
  return `Here's how to make ${recipe.title}. 
          You'll need the following ingredients: ${recipe.ingredients.join(', ')}. 
          Now, let's go through the instructions step by step: ${recipe.instructions.join('. ')}`;
};

// Main function: use only TheMealDB and Ollama, return the fastest result
export const getRecipe = async (query: string): Promise<Recipe> => {
  const sources = [
    { name: 'Ollama', fn: getRecipeFromOllama },
    { name: 'MealDB', fn: getRecipeFromMealDB },
    // { name: 'LocalJSON', fn: getRecipeFromLocalJSON }, // Optional
  ];

  // Polyfill for Promise.any (no AggregateError)
  function promiseAny<T>(promises: Promise<T>[]): Promise<T> {
    return new Promise((resolve, reject) => {
      let rejections: any[] = [];
      let pending = promises.length;
      if (pending === 0) return reject(new Error('All promises were rejected'));
      promises.forEach(p =>
        p.then(resolve).catch(e => {
          rejections.push(e);
          pending--;
          if (pending === 0) reject(new Error('All promises were rejected: ' + rejections.map(r => r && r.message ? r.message : r).join('; ')));
        })
      );
    });
  }

  try {
    const recipe = await promiseAny(sources.map(source => source.fn(query)));
    return recipe;
  } catch (error) {
    throw new Error('Failed to fetch recipe from all free sources');
  }
}; 