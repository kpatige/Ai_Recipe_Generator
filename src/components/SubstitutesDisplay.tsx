import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Recipe, Language } from '../types';
import './SubstitutesDisplay.css';

interface SubstitutesDisplayProps {
  recipe: Recipe;
  selectedLanguage: Language;
}

const SubstitutesDisplay: React.FC<SubstitutesDisplayProps> = ({ 
  recipe, 
  selectedLanguage 
}) => {
  const translations = {
    title: {
      en: 'Ingredient Substitutions',
      hi: 'सामग्री के विकल्प',
      kn: 'ಪದಾರ್ಥ ಪರ್ಯಾಯಗಳು'
    },
    unavailable: {
      en: 'Unavailable Ingredients',
      hi: 'अनुपलब्ध सामग्री',
      kn: 'ಲಭ್ಯವಿಲ್ಲದ ಪದಾರ್ಥಗಳು'
    },
    substitutes: {
      en: 'Substitutes',
      hi: 'विकल्प',
      kn: 'ಪರ್ಯಾಯಗಳು'
    },
    noSubstitutes: {
      en: 'All ingredients are available!',
      hi: 'सभी सामग्री उपलब्ध है!',
      kn: 'ಎಲ್ಲಾ ಪದಾರ್ಥಗಳು ಲಭ್ಯವಿದೆ!'
    }
  };

  const unavailableIngredients = recipe.ingredients.filter(ing => !ing.isAvailable);

  return (
    <div className="substitutes-display">
      <h3>
        {selectedLanguage === 'en' ? 'Ingredient Substitutions' :
         selectedLanguage === 'hi' ? 'सामग्री के विकल्प' :
         'ಪದಾರ್ಥಗಳ ಬದಲಿಗಳು'}
      </h3>
      <div className="substitutes-list">
        {recipe.ingredients.map((ingredient, index) => (
          <div key={index} className="substitute-item">
            <h4>{ingredient.name}</h4>
            {ingredient.substitutes && ingredient.substitutes.length > 0 ? (
              <ul>
                {ingredient.substitutes.map((substitute, subIndex) => (
                  <li key={subIndex}>{substitute}</li>
                ))}
              </ul>
            ) : (
              <p className="no-substitutes">
                {selectedLanguage === 'en' ? 'No substitutes available' :
                 selectedLanguage === 'hi' ? 'कोई विकल्प उपलब्ध नहीं है' :
                 'ಯಾವುದೇ ಬದಲಿಗಳು ಲಭ್ಯವಿಲ್ಲ'}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubstitutesDisplay;