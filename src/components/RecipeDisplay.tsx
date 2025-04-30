import React from 'react';
import { Clock, Users, BarChart2 } from 'lucide-react';
import { Recipe, Language } from '../types';

interface RecipeDisplayProps {
  recipe: Recipe;
  selectedLanguage: Language;
}

const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ recipe, selectedLanguage }) => {
  const translations = {
    ingredients: {
      en: 'Ingredients',
      hi: 'सामग्री',
      kn: 'ಪದಾರ್ಥಗಳು'
    },
    steps: {
      en: 'Instructions',
      hi: 'निर्देश',
      kn: 'ಸೂಚನೆಗಳು'
    },
    prepTime: {
      en: 'Prep Time',
      hi: 'तैयारी का समय',
      kn: 'ತಯಾರಿಕೆ ಸಮಯ'
    },
    cookTime: {
      en: 'Cook Time',
      hi: 'पकाने का समय',
      kn: 'ಬೇಯಿಸುವ ಸಮಯ'
    },
    servings: {
      en: 'Servings',
      hi: 'परोसने',
      kn: 'ಸರ್ವ್'
    },
    difficulty: {
      en: 'Difficulty',
      hi: 'कठिनाई',
      kn: 'ಕಷ್ಟ'
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">{recipe.name}</h2>
        
        <div className="flex flex-wrap gap-4 mb-6 mt-3 text-sm text-gray-600">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-1 text-green-600" />
            <span>{translations.prepTime[selectedLanguage]}: {recipe.prepTime}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-1 text-orange-500" />
            <span>{translations.cookTime[selectedLanguage]}: {recipe.cookTime}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-1 text-blue-500" />
            <span>{translations.servings[selectedLanguage]}: {recipe.servings}</span>
          </div>
          <div className="flex items-center">
            <BarChart2 className="h-5 w-5 mr-1 text-purple-500" />
            <span>{translations.difficulty[selectedLanguage]}: {
              selectedLanguage === 'en' ? recipe.difficulty :
              selectedLanguage === 'hi' ? 
                recipe.difficulty === 'Easy' ? 'आसान' : 
                recipe.difficulty === 'Medium' ? 'मध्यम' : 'कठिन' :
                recipe.difficulty === 'Easy' ? 'ಸುಲಭ' : 
                recipe.difficulty === 'Medium' ? 'ಮಧ್ಯಮ' : 'ಕಷ್ಟ'
            }</span>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              {translations.ingredients[selectedLanguage]}
            </h3>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li 
                  key={index} 
                  className={`flex items-start ${!ingredient.isAvailable ? 'text-red-600' : ''}`}
                >
                  <span className="mr-2 mt-1">•</span>
                  <span>
                    {ingredient.quantity} {ingredient.unit} {ingredient.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              {translations.steps[selectedLanguage]}
            </h3>
            <ol className="space-y-3">
              {recipe.steps.map((step, index) => (
                <li key={index} className="flex">
                  <span className="font-semibold text-green-600 mr-2">{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDisplay;