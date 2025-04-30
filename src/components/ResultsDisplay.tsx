import React, { useRef, useState } from 'react';
import { RecognitionResponse, Language } from '../types';
import RecipeDisplay from './RecipeDisplay';
import NutritionDisplay from './NutritionDisplay';
import NutritionPieChart from './NutritionPieChart';
import { textToSpeech } from '../services/geminiApi';
import './ResultsDisplay.css';

interface ResultsDisplayProps {
  recognitionResult: RecognitionResponse;
  selectedLanguage: Language;
  activeTab: 'recipe' | 'nutrition';
  setActiveTab: (tab: 'recipe' | 'nutrition') => void;
  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
  onCommandReceived: (command: string) => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  recognitionResult,
  selectedLanguage,
  activeTab,
  setActiveTab,
  isListening,
  setIsListening,
  onCommandReceived
}) => {
  if (!recognitionResult.success || !recognitionResult.result) {
    return (
      <div className="error-message">
        {selectedLanguage === 'en' ? (
          <p>Failed to recognize food. Please try again.</p>
        ) : selectedLanguage === 'hi' ? (
          <p>भोजन को पहचानने में विफल। कृपया पुनः प्रयास करें।</p>
        ) : (
          <p>ಆಹಾರವನ್ನು ಗುರುತಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.</p>
        )}
      </div>
    );
  }

  const { foodRecognition, recipe, nutrition } = recognitionResult.result;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentStepRef = useRef(0);

  const handleSpeakIngredients = async () => {
    if (!recipe.ingredients.length) return;
    const text = recipe.ingredients.map(
      ing => `${ing.quantity} ${ing.unit} ${ing.name}`.trim()
    ).join(', ');
    await textToSpeech(`Ingredients: ${text}`);
  };

  const speakStep = (stepIdx: number) => {
    if (!recipe.steps[stepIdx]) return;
    const synth = window.speechSynthesis;
    const utterance = new window.SpeechSynthesisUtterance(`Step ${stepIdx + 1}: ${recipe.steps[stepIdx]}`);
    // Try to use a female/pleasant voice if available
    const voices = synth.getVoices();
    const preferredNames = ['female', 'zira', 'susan', 'samantha', 'eva', 'kendra'];
    let femaleVoice = voices.find(v => preferredNames.some(name => v.name.toLowerCase().includes(name) || v.voiceURI.toLowerCase().includes(name)));
    if (!femaleVoice) {
      // Fallback: pick a voice with higher pitch or the first available
      femaleVoice = voices.find(v => v.pitch && v.pitch > 1.1) || voices[0];
    }
    if (femaleVoice) utterance.voice = femaleVoice;
    utterance.pitch = 1.2; // slightly higher pitch for pleasantness
    utterance.rate = 1.05; // slightly faster for engagement
    utterance.onend = () => {
      if (!speechUtteranceRef.current) return;
      if (!isPaused && currentStepRef.current < recipe.steps.length - 1) {
        currentStepRef.current++;
        speakStep(currentStepRef.current);
      } else {
        setIsSpeaking(false);
        setIsPaused(false);
        speechUtteranceRef.current = null;
        currentStepRef.current = 0;
      }
    };
    speechUtteranceRef.current = utterance;
    synth.speak(utterance);
  };

  const handlePlayInstructions = () => {
    if (!recipe.steps.length) return;
    setIsSpeaking(true);
    setIsPaused(false);
    currentStepRef.current = 0;
    speakStep(0);
  };

  const handlePauseInstructions = () => {
    setIsPaused(true);
    window.speechSynthesis.pause();
  };

  const handleResumeInstructions = () => {
    setIsPaused(false);
    window.speechSynthesis.resume();
  };

  const handleStopInstructions = () => {
    setIsSpeaking(false);
    setIsPaused(false);
    window.speechSynthesis.cancel();
    speechUtteranceRef.current = null;
    currentStepRef.current = 0;
  };

  function toDifficulty(val: string): 'Easy' | 'Medium' | 'Hard' {
    if (val === 'Easy' || val === 'Medium' || val === 'Hard') return val;
    return 'Medium';
  }
  const safeRecipe: import('../types').Recipe = {
    name: recipe.name,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    servings: recipe.servings,
    difficulty: toDifficulty(recipe.difficulty),
  };

  return (
    <div className="results-display">
      <div className="food-info">
        <h2>{foodRecognition.foodName}</h2>
        <p className="confidence">
          {selectedLanguage === 'en' ? 'Confidence: ' : 
           selectedLanguage === 'hi' ? 'विश्वास: ' : 
           'ವಿಶ್ವಾಸ: '}
          {(foodRecognition.confidence * 100).toFixed(1)}%
        </p>
      </div>

      <div className="tabs">
        <button
          className={activeTab === 'recipe' ? 'active' : ''}
          onClick={() => setActiveTab('recipe')}
        >
          {selectedLanguage === 'en' ? 'Recipe' : 
           selectedLanguage === 'hi' ? 'व्यंजन विधि' : 
           'ವಿನ್ಯಾಸ'}
        </button>
        <button
          className={activeTab === 'nutrition' ? 'active' : ''}
          onClick={() => setActiveTab('nutrition')}
        >
          {selectedLanguage === 'en' ? 'Nutrition' : 
           selectedLanguage === 'hi' ? 'पोषण' : 
           'ಪೋಷಣೆ'}
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'recipe' && (
          <>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
              <button onClick={handleSpeakIngredients} disabled={!recipe.ingredients.length}>
                {selectedLanguage === 'en' ? '🔊 Read Ingredients' : selectedLanguage === 'hi' ? '🔊 सामग्री पढ़ें' : '🔊 ಪದಾರ್ಥಗಳನ್ನು ಓದಿ'}
              </button>
              <button
                onClick={isSpeaking ? (isPaused ? handleResumeInstructions : handlePauseInstructions) : handlePlayInstructions}
                disabled={!recipe.steps.length}
                style={{ background: isSpeaking ? (isPaused ? '#4CAF50' : '#f44336') : '#2196f3', color: 'white', border: 'none', borderRadius: 4, padding: '0.5rem 1.2rem', fontWeight: 500 }}
              >
                {isSpeaking
                  ? isPaused
                    ? (selectedLanguage === 'en' ? '▶️ Resume Instructions' : selectedLanguage === 'hi' ? '▶️ निर्देश फिर से पढ़ें' : '▶️ ಸೂಚನೆಗಳನ್ನು ಮತ್ತೆ ಓದಿ')
                    : (selectedLanguage === 'en' ? '⏸️ Pause Instructions' : selectedLanguage === 'hi' ? '⏸️ निर्देश रोकें' : '⏸️ ಸೂಚನೆಗಳನ್ನು ನಿಲ್ಲಿಸಿ')
                  : (selectedLanguage === 'en' ? '🔊 Play Instructions' : selectedLanguage === 'hi' ? '🔊 निर्देश पढ़ें' : '🔊 ಸೂಚನೆಗಳನ್ನು ಓದಿ')
                }
              </button>
              {isSpeaking && (
                <button onClick={handleStopInstructions} style={{ background: '#e57373', color: 'white', border: 'none', borderRadius: 4, padding: '0.5rem 1.2rem', fontWeight: 500 }}>
                  {selectedLanguage === 'en' ? '⏹️ Stop' : selectedLanguage === 'hi' ? '⏹️ रोकें' : '⏹️ ನಿಲ್ಲಿಸಿ'}
                </button>
              )}
            </div>
            <RecipeDisplay
              recipe={safeRecipe}
              selectedLanguage={selectedLanguage}
            />
          </>
        )}
        {activeTab === 'nutrition' && (
          <div className="nutrition-content">
            <NutritionPieChart nutrition={nutrition} />
            <NutritionDisplay
              nutrition={nutrition}
              selectedLanguage={selectedLanguage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsDisplay;