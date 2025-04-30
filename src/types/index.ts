export type Language = 'en' | 'hi' | 'kn';

export interface FoodRecognitionResult {
  foodName: string;
  confidence: number;
}

export interface Recipe {
  name: string;
  ingredients: Ingredient[];
  steps: string[];
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
  isAvailable: boolean;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  fiber: number;
  vitamins: {
    [key: string]: number;
  };
  minerals: {
    [key: string]: number;
  };
}

export interface RecognitionResponse {
  recipe?: {
    title: string;
    ingredients: string[];
    instructions: string[];
  };
  nutrition?: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: {
    transcript: string;
  };
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResult[] & {
    item(index: number): SpeechRecognitionResult;
  };
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
  
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    abort: () => void;
    onstart: (event: Event) => void;
    onend: (event: Event) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onresult: (event: SpeechRecognitionEvent) => void;
  }
}

export interface FoodAssistantState {
  image: string | null;
  isRecognizing: boolean;
  recognitionResult: RecognitionResponse | null;
  selectedLanguage: Language;
  isListening: boolean;
  activeTab: 'recipe' | 'nutrition';
}