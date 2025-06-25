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
export const speakText = (text: string, language: 'en' | 'hi' | 'kn' = 'en') => {
  return new Promise<void>((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Text-to-speech not supported in this browser'));
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Function to initialize voices
    const initVoices = () => {
      return new Promise<SpeechSynthesisVoice[]>((resolve) => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          resolve(voices);
        } else {
          window.speechSynthesis.onvoiceschanged = () => {
            resolve(window.speechSynthesis.getVoices());
          };
        }
      });
    };

    // Function to find the best voice for the language
    const findVoice = (voices: SpeechSynthesisVoice[], lang: string) => {
      const langCode = lang === 'en' ? 'en-US' : 
                      lang === 'hi' ? 'hi-IN' : 'kn-IN';
      
      // First try to find an exact match
      let voice = voices.find(v => v.lang === langCode);
      
      // If no exact match, try to find a voice that starts with the language code
      if (!voice) {
        voice = voices.find(v => v.lang.startsWith(lang));
      }
      
      // If still no match, try to find any voice that supports the language
      if (!voice) {
        voice = voices.find(v => v.lang.includes(lang));
      }
      
      // If all else fails, use the first available voice
      return voice || voices[0];
    };

    // Main function to speak
    const speak = async () => {
      try {
        const voices = await initVoices();
        const voice = findVoice(voices, language);
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        
        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang;
        } else {
          utterance.lang = language === 'en' ? 'en-US' : 
                          language === 'hi' ? 'hi-IN' : 'kn-IN';
        }

        // Add event listeners
        utterance.onend = () => resolve();
        utterance.onerror = (error) => reject(error);
        
        // Speak the text
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        reject(error);
      }
    };

    speak();
  });
};

export const formatRecipeForSpeech = (recipe: Recipe, language: 'en' | 'hi' | 'kn' = 'en'): string => {
  const translations = {
    intro: {
      en: "Here's how to make",
      hi: "यह बनाने का तरीका है",
      kn: "ಇದನ್ನು ಹೇಗೆ ತಯಾರಿಸಬೇಕೆಂದು"
    },
    ingredients: {
      en: "Ingredients",
      hi: "सामग्री",
      kn: "ಪದಾರ್ಥಗಳು"
    },
    instructions: {
      en: "Instructions",
      hi: "निर्देश",
      kn: "ಸೂಚನೆಗಳು"
    },
    step: {
      en: "Step",
      hi: "चरण",
      kn: "ಹಂತ"
    }
  };

  // Format ingredients with proper translation
  const formattedIngredients = recipe.ingredients.map((ingredient, index) => {
    return `${index + 1}. ${ingredient}`;
  });

  // Format instructions with step numbers in the selected language
  const formattedInstructions = recipe.instructions.map((instruction, index) => {
    // Ensure the instruction text is in the correct language
    const stepNumber = `${translations.step[language]} ${index + 1}`;
    return `${stepNumber}. ${instruction}`;
  });

  // Combine all parts with proper spacing and punctuation
  const parts = [
    `${translations.intro[language]} ${recipe.title}`,
    `${translations.ingredients[language]}: ${formattedIngredients.join('. ')}`,
    `${translations.instructions[language]}: ${formattedInstructions.join('. ')}`
  ];

  return parts.join('. ');
};

// Function to get available voices
export const getAvailableVoices = (): SpeechSynthesisVoice[] => {
  if ('speechSynthesis' in window) {
    return window.speechSynthesis.getVoices();
  }
  return [];
};

// Function to check if a voice is available for a language
export const hasVoiceForLanguage = (language: 'en' | 'hi' | 'kn'): boolean => {
  const voices = getAvailableVoices();
  const langCode = language === 'en' ? 'en-US' : 
                  language === 'hi' ? 'hi-IN' : 'kn-IN';
  
  return voices.some(voice => 
    voice.lang === langCode || 
    voice.lang.startsWith(language) || 
    voice.lang.includes(language)
  );
};

// Function to speak text in chunks
export const speakTextInChunks = async (text: string, language: 'en' | 'hi' | 'kn' = 'en'): Promise<void> => {
  // Split text into sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  for (const sentence of sentences) {
    await speakText(sentence.trim(), language);
    // Add a small pause between sentences
    await new Promise(resolve => setTimeout(resolve, 500));
  }
};

// Main function: use only TheMealDB and Ollama, return the fastest result
export const getRecipe = async (query: string, language: string = 'en'): Promise<Recipe> => {
  const sources = [
    { name: 'Ollama', fn: (q: string) => getRecipeFromOllama(q, language) },
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