import React from 'react';
import { NutritionInfo, Language } from '../types';
import './NutritionDisplay.css';

interface NutritionDisplayProps {
  nutrition: NutritionInfo;
  selectedLanguage: Language;
}

const NutritionDisplay: React.FC<NutritionDisplayProps> = ({ 
  nutrition, 
  selectedLanguage 
}) => {
  // Default values for samosa (per piece)
  const defaultValues = {
    calories: 262,
    protein: 4.5,
    carbs: 28,
    fat: 16,
    sugar: 1.5,
    fiber: 2.5
  };

  // Get value with fallback to default
  const getValue = (key: keyof typeof defaultValues): number => {
    return nutrition[key] || defaultValues[key];
  };

  const translations = {
    title: {
      en: 'Nutrition Facts',
      hi: 'पोषण तथ्य',
      kn: 'ಪೌಷ್ಟಿಕಾಂಶ ವಿವರಗಳು'
    },
    perServing: {
      en: 'Amount Per Serving',
      hi: 'प्रति सर्विंग मात्रा',
      kn: 'ಪ್ರತಿ ಸರ್ವಿಂಗ್ ಪ್ರಮಾಣ'
    },
    macronutrients: {
      en: 'Macronutrients',
      hi: 'मैक्रोन्यूट्रिएंट्स',
      kn: 'ಮ್ಯಾಕ್ರೋನ್ಯೂಟ್ರಿಯಂಟ್ಸ್'
    },
    vitamins: {
      en: 'Vitamins',
      hi: 'विटामिन',
      kn: 'ವಿಟಮಿನ್‌ಗಳು'
    },
    minerals: {
      en: 'Minerals',
      hi: 'खनिज',
      kn: 'ಖನಿಜಗಳು'
    }
  };

  // Calculate total calories from macronutrients
  const calculateTotalCalories = () => {
    const proteinCals = getValue('protein') * 4; // 4 calories per gram of protein
    const carbsCals = getValue('carbs') * 4; // 4 calories per gram of carbs
    const fatCals = getValue('fat') * 9; // 9 calories per gram of fat
    return proteinCals + carbsCals + fatCals;
  };

  // Calculate macronutrient percentages
  const calculateMacroPercentages = () => {
    const totalCals = calculateTotalCalories();
    if (totalCals === 0) return { protein: 0, carbs: 0, fat: 0 };

    return {
      protein: (getValue('protein') * 4 / totalCals) * 100,
      carbs: (getValue('carbs') * 4 / totalCals) * 100,
      fat: (getValue('fat') * 9 / totalCals) * 100
    };
  };

  const macroPercentages = calculateMacroPercentages();

  // Format number with 1 decimal place
  const formatNumber = (num: number): string => {
    return num.toFixed(1);
  };

  // Calculate daily value percentage
  const getDailyValue = (nutrient: string, value: number): number => {
    const dailyValues: { [key: string]: number } = {
      calories: 2000,
      protein: 50,
      carbs: 300,
      fat: 65,
      fiber: 25,
      sugar: 50
    };
    return (value / (dailyValues[nutrient] || 1)) * 100;
  };

  return (
    <div className="nutrition-facts">
      <div className="nutrition-header">
        <h2>{translations.title[selectedLanguage]}</h2>
        <p className="serving-size">{translations.perServing[selectedLanguage]}</p>
      </div>

      <div className="calories-block">
        <div className="calories-header">
          <h3>Calories</h3>
          <span className="calorie-value">{formatNumber(calculateTotalCalories())}</span>
        </div>
        <div className="macro-percentages">
          <div className="macro-bar">
            <div 
              className="protein-bar" 
              style={{ width: `${macroPercentages.protein}%` }}
              title={`Protein: ${formatNumber(macroPercentages.protein)}%`}
            />
            <div 
              className="carbs-bar" 
              style={{ width: `${macroPercentages.carbs}%` }}
              title={`Carbs: ${formatNumber(macroPercentages.carbs)}%`}
            />
            <div 
              className="fat-bar" 
              style={{ width: `${macroPercentages.fat}%` }}
              title={`Fat: ${formatNumber(macroPercentages.fat)}%`}
            />
          </div>
        </div>
      </div>

      <div className="divider" />

      <div className="nutrients-grid">
        <div className="nutrient-row">
          <div className="nutrient-info">
            <span className="nutrient-name">Total Fat</span>
            <span className="nutrient-amount">{formatNumber(getValue('fat'))}g</span>
          </div>
          <span className="dv-percent">{formatNumber(getDailyValue('fat', getValue('fat')))}%</span>
        </div>

        <div className="nutrient-row">
          <div className="nutrient-info">
            <span className="nutrient-name">Total Carbohydrates</span>
            <span className="nutrient-amount">{formatNumber(getValue('carbs'))}g</span>
          </div>
          <span className="dv-percent">{formatNumber(getDailyValue('carbs', getValue('carbs')))}%</span>
        </div>

        <div className="nutrient-row indent">
          <div className="nutrient-info">
            <span className="nutrient-name">Dietary Fiber</span>
            <span className="nutrient-amount">{formatNumber(getValue('fiber'))}g</span>
          </div>
          <span className="dv-percent">{formatNumber(getDailyValue('fiber', getValue('fiber')))}%</span>
        </div>

        <div className="nutrient-row indent">
          <div className="nutrient-info">
            <span className="nutrient-name">Total Sugars</span>
            <span className="nutrient-amount">{formatNumber(getValue('sugar'))}g</span>
          </div>
          <span className="dv-percent">{formatNumber(getDailyValue('sugar', getValue('sugar')))}%</span>
        </div>

        <div className="nutrient-row">
          <div className="nutrient-info">
            <span className="nutrient-name">Protein</span>
            <span className="nutrient-amount">{formatNumber(getValue('protein'))}g</span>
          </div>
          <span className="dv-percent">{formatNumber(getDailyValue('protein', getValue('protein')))}%</span>
        </div>
      </div>

      <div className="divider" />

      <div className="daily-value-note">
        * Percent Daily Values are based on a 2,000 calorie diet.
      </div>
    </div>
  );
};

export default NutritionDisplay;