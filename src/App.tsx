import React, { useState } from 'react';
import Header from './components/Header';
import ImageUpload from './components/ImageUpload';
import ResultsDisplay from './components/ResultsDisplay';
import { recognizeFood } from './services/geminiApi';
import { Language, RecognitionResponse } from './types';
import { ThemeProvider } from './contexts/ThemeContext';
import './App.css';

function App() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [image, setImage] = useState<File | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResponse | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [activeTab, setActiveTab] = useState<'recipe' | 'nutrition'>('recipe');

  const handleImageUpload = async (result: RecognitionResponse) => {
    console.log('Image upload result:', result);
    setRecognitionResult(result);
  };

  const handleLanguageChange = (language: Language) => {
    setSelectedLanguage(language);
  };

  const handleVoiceCommand = (command: string) => {
    console.log('Voice command received:', command);
    
    // Simple command handling based on keywords
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('recipe') || lowerCommand.includes('how to make')) {
      setActiveTab('recipe');
    } else if (lowerCommand.includes('nutrition') || lowerCommand.includes('calories') || lowerCommand.includes('protein')) {
      setActiveTab('nutrition');
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-sans transition-colors">
        <Header 
          selectedLanguage={selectedLanguage} 
          onLanguageChange={handleLanguageChange}
        />
        
        <main className="flex-grow container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <ImageUpload 
                onImageUpload={handleImageUpload}
                language={selectedLanguage}
                onLanguageChange={handleLanguageChange}
              />
            </div>
            
            <div>
              {recognitionResult && !isRecognizing ? (
                <ResultsDisplay 
                  recognitionResult={recognitionResult}
                  selectedLanguage={selectedLanguage}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  isListening={isListening}
                  setIsListening={setIsListening}
                  onCommandReceived={handleVoiceCommand}
                />
              ) : !isRecognizing && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
                  <div className="text-gray-400 dark:text-gray-500 my-10">
                    {selectedLanguage === 'en' ? (
                      <p className="text-lg">Upload a food image to get started</p>
                    ) : selectedLanguage === 'hi' ? (
                      <p className="text-lg">शुरू करने के लिए खाने की तस्वीर अपलोड करें</p>
                    ) : (
                      <p className="text-lg">ಪ್ರಾರಂಭಿಸಲು ಆಹಾರ ಚಿತ್ರವನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಿ</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
        
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 transition-colors">
          <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
            {selectedLanguage === 'en' ? (
              <p>© 2025 Bite.ai - Your AI Food Assistant</p>
            ) : selectedLanguage === 'hi' ? (
              <p>© 2025 Bite.ai - आपका AI खाद्य सहायक</p>
            ) : (
              <p>© 2025 Bite.ai - ನಿಮ್ಮ AI ಆಹಾರ ಸಹಾಯಕ</p>
            )}
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}

export default App;