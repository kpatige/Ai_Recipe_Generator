import React, { useState } from 'react';
import { Utensils, Globe, Mic } from 'lucide-react';
import { Language } from '../types';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import VoiceRecipe from './VoiceRecipe';

interface HeaderProps {
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

const Header: React.FC<HeaderProps> = ({ selectedLanguage, onLanguageChange }) => {
  const [isVoiceRecipeOpen, setIsVoiceRecipeOpen] = useState(false);

  return (
    <>
      <header className="bg-white dark:bg-gray-800 shadow-sm transition-colors">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Utensils className="h-8 w-8 text-green-600" />
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
              <span className="text-green-600">Bite</span>.ai
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsVoiceRecipeOpen(true)}
              className="p-2 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
              title="Search recipes by voice"
            >
              <Mic size={20} />
            </button>
            <ThemeToggle />
            <div className="flex items-center space-x-1">
              <Globe className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <LanguageSelector 
              selectedLanguage={selectedLanguage} 
              onLanguageChange={onLanguageChange} 
            />
          </div>
        </div>
      </header>

      <VoiceRecipe 
        isOpen={isVoiceRecipeOpen}
        onClose={() => setIsVoiceRecipeOpen(false)}
      />
    </>
  );
};

export default Header;