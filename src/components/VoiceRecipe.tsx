import React, { useState, useEffect, useCallback } from 'react';
import { getRecipe, speakTextInChunks, formatRecipeForSpeech } from '../services/recipeService';
import { generateImage } from '../services/imageGenerationService';
import { Mic, MicOff, Loader2, Image, Clock, Users, ChevronRight, Volume2, VolumeX, Search } from 'lucide-react';

interface VoiceRecipeProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: 'en' | 'hi' | 'kn';
}

interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  image_prompt?: string;
  cookingTime?: string;
  servings?: number;
  difficulty?: string;
}

const VoiceRecipe: React.FC<VoiceRecipeProps> = ({ isOpen, onClose, selectedLanguage }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [manualQuery, setManualQuery] = useState('');

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage === 'en' ? 'en-US' : 
                        selectedLanguage === 'hi' ? 'hi-IN' : 'kn-IN';

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        console.log('Transcript:', transcript);
        setTranscript(transcript);

        if (event.results[current].isFinal) {
          console.log('Final result received');
          recognition.stop();
          handleRecipeQuery(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setError('Failed to recognize speech. Please try again.');
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };

      setRecognition(recognition);
    } else {
      setError('Speech recognition is not supported in your browser. Please use Chrome.');
    }

    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, [selectedLanguage]);

  const handleRecipeQuery = async (query: string) => {
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setCurrentStep(null);
    try {
      const recipeData = await getRecipe(query, selectedLanguage);
      setRecipe(recipeData);
      if (recipeData.image_prompt) {
        generateRecipeImage(recipeData.image_prompt);
      }
    } catch (err) {
      setError('Failed to fetch recipe. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualQuery.trim()) {
      handleRecipeQuery(manualQuery.trim());
    }
  };

  const generateRecipeImage = async (prompt: string) => {
    setIsGeneratingImage(true);
    try {
      const imageUrl = await generateImage(prompt);
      setGeneratedImage(imageUrl);
    } catch (err) {
      console.error('Error generating image:', err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const startListening = useCallback(() => {
    if (!recognition) {
      setError('Speech recognition is not supported in your browser. Please use Chrome.');
      return;
    }

    try {
      setError(null);
      setTranscript('');
      recognition.start();
      console.log('Starting speech recognition...');
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setError('Error starting speech recognition. Please try again.');
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
    }
  }, [recognition]);

  const speakRecipe = async () => {
    if (!recipe || isSpeaking) return;
    
    try {
      setIsSpeaking(true);
      const text = formatRecipeForSpeech(recipe, selectedLanguage);
      await speakTextInChunks(text, selectedLanguage);
    } catch (err) {
      console.error('Text-to-speech error:', err);
    } finally {
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, [recognition]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-y-auto">
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Recipe Search</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* Search Controls */}
            <div className="flex flex-col items-center space-y-4">
              <div className="flex flex-col sm:flex-row w-full max-w-3xl space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={isLoading}
                  className={`w-full sm:w-auto p-4 sm:p-6 rounded-2xl ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-red-500/25'
                      : 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/25'
                  } text-white transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center`}
                >
                  {isListening ? <MicOff size={28} /> : <Mic size={28} />}
                  <span className="ml-2 sm:hidden">
                    {isListening ? 'Stop Listening' : 'Start Listening'}
                  </span>
                </button>
                
                <form onSubmit={handleManualSubmit} className="flex-1 flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={manualQuery}
                    onChange={(e) => setManualQuery(e.target.value)}
                    placeholder="Or type your recipe search here..."
                    className="flex-1 px-4 sm:px-6 py-4 border border-gray-200 dark:border-gray-600 rounded-xl sm:rounded-l-2xl sm:rounded-r-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-lg"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !manualQuery.trim()}
                    className="px-6 py-4 bg-blue-500 text-white rounded-xl sm:rounded-r-2xl sm:rounded-l-none hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 transition-colors flex items-center justify-center"
                  >
                    <Search size={24} />
                    <span className="ml-2 sm:hidden">Search</span>
                  </button>
                </form>
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {isListening ? 'Listening... Click to stop' : 'Click microphone to speak or type your search'}
              </p>
              {!recognition && (
                <p className="text-xs text-red-500 font-medium">
                  Please use Chrome browser for voice recognition
                </p>
              )}
            </div>

            {/* Transcript */}
            {transcript && (
              <div className="text-center text-gray-600 dark:text-gray-300 text-lg sm:text-xl font-medium italic">
                "{transcript}"
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center p-8 sm:p-12">
                <Loader2 className="animate-spin mb-4 text-blue-500" size={40} />
                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">Searching for your recipe...</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-center p-4 sm:p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl font-medium">
                {error}
              </div>
            )}

            {/* Recipe Content */}
            {recipe && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
                {/* Recipe Details */}
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      {recipe.title}
                    </h3>
                    <button
                      onClick={isSpeaking ? stopSpeaking : speakRecipe}
                      className={`p-3 rounded-full ${
                        isSpeaking ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                      } text-white transition-colors shadow-lg ${
                        isSpeaking ? 'shadow-red-500/25' : 'shadow-green-500/25'
                      }`}
                      title={isSpeaking ? 'Stop speaking' : 'Read recipe aloud'}
                    >
                      {isSpeaking ? <VolumeX size={24} /> : <Volume2 size={24} />}
                    </button>
                  </div>

                  {/* Recipe Meta Info */}
                  <div className="flex flex-wrap gap-4">
                    {recipe.cookingTime && (
                      <div className="flex items-center text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 px-4 py-2 rounded-xl">
                        <Clock size={20} className="mr-2 text-blue-500" />
                        <span className="font-medium">{recipe.cookingTime}</span>
                      </div>
                    )}
                    {recipe.servings && (
                      <div className="flex items-center text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 px-4 py-2 rounded-xl">
                        <Users size={20} className="mr-2 text-blue-500" />
                        <span className="font-medium">Serves {recipe.servings}</span>
                      </div>
                    )}
                  </div>

                  {/* Ingredients */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 shadow-lg">
                    <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-4">
                      Ingredients
                    </h4>
                    <ul className="list-none space-y-3 text-gray-600 dark:text-gray-300">
                      {recipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-start group">
                          <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-green-500 mr-3 group-hover:scale-125 transition-transform" />
                          <span className="font-medium">{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Instructions */}
                  <div>
                    <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-4">
                      Instructions
                    </h4>
                    <div className="space-y-4">
                      {recipe.instructions.map((step, index) => (
                        <div
                          key={index}
                          className={`p-6 rounded-2xl transition-all ${
                            currentStep === index
                              ? 'bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/10'
                              : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
                          }`}
                          onClick={() => setCurrentStep(index)}
                        >
                          <div className="flex items-start gap-4">
                            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-blue-500 text-white text-sm font-bold">
                              {index + 1}
                            </span>
                            <p className="text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                              {step}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recipe Image */}
                <div className="space-y-6 lg:sticky lg:top-0">
                  {isGeneratingImage ? (
                    <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-gray-50 dark:bg-gray-700/50 rounded-2xl shadow-lg">
                      <Loader2 className="animate-spin mb-4 text-blue-500" size={40} />
                      <p className="text-gray-500 dark:text-gray-400 font-medium">
                        Generating image...
                      </p>
                    </div>
                  ) : generatedImage ? (
                    <div className="relative group rounded-3xl overflow-hidden shadow-2xl border-4 border-blue-200 dark:border-blue-900 transition-all bg-gradient-to-br from-white via-blue-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950 animate-fadeIn">
                      <img
                        src={generatedImage}
                        alt={recipe.title}
                        className="w-full h-72 sm:h-96 object-cover rounded-3xl transition-transform duration-300 group-hover:scale-105"
                        style={{ minHeight: '18rem' }}
                      />
                      <button
                        onClick={speakRecipe}
                        className="absolute top-4 right-4 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg shadow-green-500/25 transition-colors z-10"
                        title="Read recipe aloud"
                        aria-label="Read recipe aloud"
                      >
                        <Volume2 size={24} />
                      </button>
                      <button
                        onClick={() => {
                          if (recipe) {
                            navigator.clipboard.writeText(`${recipe.title}\n\nIngredients:\n${recipe.ingredients.join(', ')}\n\nInstructions:\n${recipe.instructions.join(' ')}`);
                          }
                        }}
                        className="absolute top-4 left-4 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg shadow-blue-500/25 transition-colors z-10"
                        title="Copy recipe to clipboard"
                        aria-label="Copy recipe to clipboard"
                      >
                        <svg xmlns='http://www.w3.org/2000/svg' className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16h8M8 12h8m-7 8h6a2 2 0 002-2V7a2 2 0 00-2-2h-2.586a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 0010.586 2H6a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-6 py-6 flex flex-col gap-2">
                        <h4 className="text-white text-xl sm:text-2xl font-bold drop-shadow-lg">{recipe.title}</h4>
                        <p className="text-blue-100 text-sm sm:text-base font-medium drop-shadow">{recipe.ingredients.slice(0, 3).join(', ')}{recipe.ingredients.length > 3 ? '...' : ''}</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceRecipe; 