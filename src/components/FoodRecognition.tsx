import React, { useState } from 'react';
import { recognizeFood, speechToText, textToSpeech } from '../services/geminiApi';
import { Language } from '../types';
import './FoodRecognition.css';

const FoodRecognition: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  const handleRecognize = async () => {
    if (!image) {
      setError('Please upload an image first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await recognizeFood(image, language);
      console.log('Recognition response:', response);
      if (response.success) {
        setResult(response);
      } else {
        setError(response.error || 'Failed to recognize food. Please try again.');
      }
    } catch (err) {
      console.error('Recognition error:', err);
      setError('Failed to recognize food. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    try {
      const text = await speechToText();
      // Process voice input if needed
      console.log('Voice input:', text);
    } catch (err) {
      console.error('Voice input error:', err);
    }
  };

  const handleVoiceOutput = async (text: string) => {
    try {
      await textToSpeech(text);
    } catch (err) {
      console.error('Voice output error:', err);
    }
  };

  return (
    <div className="food-recognition">
      <h1>Food Recognition</h1>
      
      <div className="language-selector">
        <label>Select Language:</label>
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value as Language)}
        >
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="kn">Kannada</option>
        </select>
      </div>

      <div className="image-upload">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
        />
        <button onClick={handleRecognize} disabled={!image || loading}>
          {loading ? 'Recognizing...' : 'Recognize Food'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {result && result.success && (
        <div className="result">
          <h2>Recognition Result</h2>
          
          <div className="food-info">
            <h3>{result.result.foodRecognition.foodName}</h3>
            <p>Confidence: {(result.result.foodRecognition.confidence * 100).toFixed(1)}%</p>
          </div>

          <div className="recipe">
            <h3>Recipe: {result.result.recipe.name}</h3>
            
            <h4>Ingredients:</h4>
            <ul>
              {result.result.recipe.ingredients.map((ingredient: any, index: number) => (
                <li key={index}>
                  {ingredient.name} - {ingredient.quantity} {ingredient.unit}
                  {ingredient.substitutes && ingredient.substitutes.length > 0 && (
                    <div className="substitutes">
                      Substitutes: {ingredient.substitutes.join(', ')}
                    </div>
                  )}
                </li>
              ))}
            </ul>

            <h4>Steps:</h4>
            <ol>
              {result.result.recipe.steps.map((step: string, index: number) => (
                <li key={index}>{step}</li>
              ))}
            </ol>

            <div className="recipe-meta">
              <p>Preparation Time: {result.result.recipe.prepTime}</p>
              <p>Cooking Time: {result.result.recipe.cookTime}</p>
              <p>Servings: {result.result.recipe.servings}</p>
              <p>Difficulty: {result.result.recipe.difficulty}</p>
            </div>
          </div>

          <div className="nutrition">
            <h3>Nutritional Information</h3>
            <div className="nutrition-grid">
              <div className="nutrition-item">
                <span className="label">Calories:</span>
                <span className="value">{result.result.nutrition.calories} kcal</span>
              </div>
              <div className="nutrition-item">
                <span className="label">Protein:</span>
                <span className="value">{result.result.nutrition.protein}g</span>
              </div>
              <div className="nutrition-item">
                <span className="label">Carbs:</span>
                <span className="value">{result.result.nutrition.carbs}g</span>
              </div>
              <div className="nutrition-item">
                <span className="label">Fat:</span>
                <span className="value">{result.result.nutrition.fat}g</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="voice-controls">
        <button onClick={handleVoiceInput}>Voice Input</button>
        <button onClick={() => handleVoiceOutput(result.result.recipe.steps.join(' '))}>
          Read Recipe
        </button>
      </div>
    </div>
  );
};

export default FoodRecognition; 