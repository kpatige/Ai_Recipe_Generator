import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { Language } from '../types';

// Add type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface VoiceInputProps {
  onCommandReceived: (command: string) => void;
  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
  selectedLanguage: Language;
  activeTab: 'recipe' | 'nutrition' | 'substitutes';
  foodName: string | undefined;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ 
  onCommandReceived, 
  isListening, 
  setIsListening,
  selectedLanguage,
  activeTab,
  foodName
}) => {
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const translations = {
    listening: {
      en: 'Listening...',
      hi: 'सुन रहा है...',
      kn: 'ಕೇಳುತ್ತಿದೆ...'
    },
    startListening: {
      en: 'Voice Command',
      hi: 'आवाज आदेश',
      kn: 'ಧ್ವನಿ ಆದೇಶ'
    },
    speak: {
      en: 'Read Aloud',
      hi: 'जोर से पढ़ें',
      kn: 'ಜೋರಾಗಿ ಓದಿ'
    }
  };

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = selectedLanguage === 'en' ? 'en-US' : 
                         selectedLanguage === 'hi' ? 'hi-IN' : 'kn-IN';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
        onCommandReceived(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      const recognition = recognitionRef.current;
      if (recognition) {
        recognition.stop();
      }
    };
  }, [selectedLanguage, onCommandReceived, setIsListening]);

  const handleStartListening = () => {
    const recognition = recognitionRef.current;
    if (recognition) {
      recognition.start();
      setIsListening(true);
    }
  };

  const handleStopListening = () => {
    const recognition = recognitionRef.current;
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const handleTextToSpeech = () => {
    if (!foodName) return;
    
    let textToRead = '';
    
    switch (activeTab) {
      case 'recipe':
        textToRead = selectedLanguage === 'en' 
          ? `Here is the recipe for ${foodName}. Please follow the steps displayed on your screen.`
          : selectedLanguage === 'hi'
          ? `यहां ${foodName} की रेसिपी है। कृपया अपनी स्क्रीन पर दिखाए गए चरणों का पालन करें।`
          : `ಇಲ್ಲಿ ${foodName} ಪಾಕವಿಧಾನವಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪರದೆಯಲ್ಲಿ ತೋರಿಸಿದ ಹಂತಗಳನ್ನು ಅನುಸರಿಸಿ.`;
        break;
      case 'nutrition':
        textToRead = selectedLanguage === 'en'
          ? `Nutritional information for ${foodName} is now displayed.`
          : selectedLanguage === 'hi'
          ? `${foodName} के लिए पोषण संबंधी जानकारी अब प्रदर्शित है।`
          : `${foodName} ಗಾಗಿ ಪೌಷ್ಟಿಕ ಮಾಹಿತಿಯನ್ನು ಈಗ ಪ್ರದರ್ಶಿಸಲಾಗುತ್ತಿದೆ.`;
        break;
      case 'substitutes':
        textToRead = selectedLanguage === 'en'
          ? `Ingredient substitutes for ${foodName} are now displayed.`
          : selectedLanguage === 'hi'
          ? `${foodName} के लिए सामग्री के विकल्प अब प्रदर्शित हैं।`
          : `${foodName} ಗಾಗಿ ಪದಾರ್ಥ ಪರ್ಯಾಯಗಳನ್ನು ಈಗ ಪ್ರದರ್ಶಿಸಲಾಗುತ್ತಿದೆ.`;
        break;
    }
    
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = selectedLanguage === 'en' ? 'en-US' : 
                    selectedLanguage === 'hi' ? 'hi-IN' : 'kn-IN';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-3">
      {isListening ? (
        <button
          onClick={handleStopListening}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <MicOff className="w-5 h-5" />
          {translations.listening[selectedLanguage]}
        </button>
      ) : (
        <button
          onClick={handleStartListening}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Mic className="w-5 h-5" />
          {translations.startListening[selectedLanguage]}
        </button>
      )}
      
      <button
        onClick={handleTextToSpeech}
        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
      >
        <Volume2 className="w-5 h-5" />
        {translations.speak[selectedLanguage]}
      </button>
    </div>
  );
};

export default VoiceInput;