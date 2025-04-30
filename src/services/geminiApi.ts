import { RecognitionResponse, Language } from '../types';

const API_KEY = 'AIzaSyA2PxFHcWRmg8i3MFIazVFs_ymUjzdI0Og';
const API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

if (!API_KEY) {
  throw new Error('Gemini API key is not set. Please provide a valid API key.');
}

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Check file size (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      reject(new Error('Image size should be less than 4MB'));
      return;
    }

    // Check file type
    if (!file.type.match(/^image\/(jpeg|png)$/)) {
      reject(new Error('Only JPEG and PNG images are supported'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
};

const getPromptForLanguage = (language: Language): string => {
  const prompts = {
    en: `You are a professional chef and nutritionist. Analyze this food image and provide detailed information in the following JSON format. For Indian snacks like samosa, use these EXACT nutrition values per piece:
    {
      "foodName": "Samosa",
      "confidence": 0.95,
      "ingredients": [
        {
          "name": "All Purpose Flour",
          "quantity": "2",
          "unit": "cups"
        }
      ],
      "recipe": {
        "name": "Samosa",
        "ingredients": [
          {
            "name": "All Purpose Flour",
            "quantity": "2",
            "unit": "cups"
          }
        ],
        "steps": [
          "Step 1...",
          "Step 2..."
        ],
        "prepTime": "30",
        "cookTime": "20",
        "servings": 4,
        "difficulty": "Medium"
      },
      "nutrition": {
        "calories": 262,
        "protein": 4.5,
        "carbs": 28,
        "fat": 16,
        "sugar": 1.5,
        "fiber": 2.5,
        "vitamins": {
          "A": 80,
          "C": 4,
          "D": 0,
          "E": 1.2,
          "K": 8,
          "B1": 0.1,
          "B2": 0.08,
          "B3": 1.5,
          "B6": 0.2,
          "B12": 0,
          "Folate": 40
        },
        "minerals": {
          "Calcium": 25,
          "Iron": 1.8,
          "Magnesium": 30,
          "Phosphorus": 80,
          "Potassium": 210,
          "Sodium": 380,
          "Zinc": 0.5
        }
      }
    }

    Important instructions:
    1. Focus on identifying the main dish and its key ingredients
    2. Provide detailed cooking steps with techniques, temperatures, and timing
    3. Include tips for achieving the best results
    4. Use EXACT nutritional values as shown in the example for samosa
    5. If the image is unclear, return a low confidence score (below 0.5)
    6. Format the JSON response properly with double quotes
    7. Do not include any markdown formatting in the response
    8. If you cannot identify the food, return a low confidence score and empty arrays
    9. All numerical values should be numbers, not strings
    10. Include traditional cooking methods and regional variations if applicable
    11. For nutrition values, use realistic estimates based on standard serving sizes`,

    hi: `आप एक पेशेवर शेफ और पोषण विशेषज्ञ हैं। इस खाद्य छवि का विश्लेषण करें और निम्नलिखित JSON प्रारूप में विस्तृत जानकारी प्रदान करें। समोसे जैसे भारतीय स्नैक्स के लिए, प्रति पीस इन पोषण मूल्यों का उपयोग करें:
    - कैलोरी: 250-300
    - प्रोटीन: 4-5g
    - कार्ब्स: 25-30g
    - वसा: 15-17g
    - फाइबर: 2-3g
    - शुगर: 1-2g

    {
      "foodName": "व्यंजन का नाम",
      "confidence": 0.95,
      "ingredients": [
        {
          "name": "सामग्री का नाम",
          "quantity": "मात्रा",
          "unit": "माप की इकाई"
        }
      ],
      "recipe": {
        "name": "व्यंजन का नाम",
        "ingredients": [
          {
            "name": "सामग्री का नाम",
            "quantity": "मात्रा",
            "unit": "माप की इकाई"
          }
        ],
        "steps": [
          "विस्तृत चरण 1 पाक कला तकनीकों और सुझावों के साथ",
          "विस्तृत चरण 2 पाक कला तकनीकों और सुझावों के साथ",
          "विस्तृत चरण 3 पाक कला तकनीकों और सुझावों के साथ"
        ],
        "prepTime": "30",
        "cookTime": "20",
        "servings": 4,
        "difficulty": "Medium"
      },
      "nutrition": {
        "calories": 262,
        "protein": 4.5,
        "carbs": 28,
        "fat": 16,
        "sugar": 1.5,
        "fiber": 2.5,
        "vitamins": {
          "A": 80,
          "C": 4,
          "D": 0,
          "E": 1.2,
          "K": 8,
          "B1": 0.1,
          "B2": 0.08,
          "B3": 1.5,
          "B6": 0.2,
          "B12": 0,
          "Folate": 40
        },
        "minerals": {
          "Calcium": 25,
          "Iron": 1.8,
          "Magnesium": 30,
          "Phosphorus": 80,
          "Potassium": 210,
          "Sodium": 380,
          "Zinc": 0.5
        }
      }
    }`,

    kn: `ನೀವು ವೃತ್ತಿಪರ ಶೆಫ್ ಮತ್ತು ಪೋಷಣಾಹಾರ ತಜ್ಞ. ಈ ಆಹಾರ ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಿ ಮತ್ತು ಈ ಕೆಳಗಿನ JSON ಸ್ವರೂಪದಲ್ಲಿ ವಿವರವಾದ ಮಾಹಿತಿಯನ್ನು ಒದಗಿಸಿ। ಸಮೋಸ ಮುಂತಾದ ಭಾರತೀಯ ತಿಂಡಿಗಳಿಗೆ, ಪ್ರತಿ ತುಂಡಿಗೆ ಈ ಪೌಷ್ಟಿಕಾಂಶ ಮೌಲ್ಯಗಳನ್ನು ಬಳಸಿ:
    - ಕ್ಯಾಲೊರಿಗಳು: 250-300
    - ಪ್ರೋಟೀನ್: 4-5g
    - ಕಾರ್ಬ್ಸ್: 25-30g
    - ಕೊಬ್ಬು: 15-17g
    - ನಾರು: 2-3g
    - ಸಕ್ಕರೆ: 1-2g

    {
      "foodName": "ಖಾದ್ಯದ ಹೆಸರು",
      "confidence": 0.95,
      "ingredients": [
        {
          "name": "ಪದಾರ್ಥದ ಹೆಸರು",
          "quantity": "ಪರಿಮಾಣ",
          "unit": "ಮಾಪನದ ಘಟಕ"
        }
      ],
      "recipe": {
        "name": "ಖಾದ್ಯದ ಹೆಸರು",
        "ingredients": [
          {
            "name": "ಪದಾರ್ಥದ ಹೆಸರು",
            "quantity": "ಪರಿಮಾಣ",
            "unit": "ಮಾಪನದ ಘಟಕ"
          }
        ],
        "steps": [
          "ವಿವರವಾದ ಹಂತ 1 ಅಡುಗೆ ತಂತ್ರಗಳು ಮತ್ತು ಸಲಹೆಗಳೊಂದಿಗೆ",
          "ವಿವರವಾದ ಹಂತ 2 ಅಡುಗೆ ತಂತ್ರಗಳು ಮತ್ತು ಸಲಹೆಗಳೊಂದಿಗೆ",
          "ವಿವರವಾದ ಹಂತ 3 ಅಡುಗೆ ತಂತ್ರಗಳು ಮತ್ತು ಸಲಹೆಗಳೊಂದಿಗೆ"
        ],
        "prepTime": "30",
        "cookTime": "20",
        "servings": 4,
        "difficulty": "Medium"
      },
      "nutrition": {
        "calories": 262,
        "protein": 4.5,
        "carbs": 28,
        "fat": 16,
        "sugar": 1.5,
        "fiber": 2.5,
        "vitamins": {
          "A": 80,
          "C": 4,
          "D": 0,
          "E": 1.2,
          "K": 8,
          "B1": 0.1,
          "B2": 0.08,
          "B3": 1.5,
          "B6": 0.2,
          "B12": 0,
          "Folate": 40
        },
        "minerals": {
          "Calcium": 25,
          "Iron": 1.8,
          "Magnesium": 30,
          "Phosphorus": 80,
          "Potassium": 210,
          "Sodium": 380,
          "Zinc": 0.5
        }
      }
    }`
  };
  return prompts[language];
};

// Helper: Extract first valid JSON object from a string using stack
function extractFirstJSONObject(text: string): string | null {
  const start = text.indexOf('{');
  if (start === -1) return null;
  let stack = 0;
  let end = -1;
  for (let i = start; i < text.length; i++) {
    if (text[i] === '{') stack++;
    if (text[i] === '}') stack--;
    if (stack === 0) {
      end = i;
      break;
    }
  }
  if (end !== -1) return text.substring(start, end + 1);
  return null;
}

// Minimal Gemini JSON cleaning
function cleanGeminiJSON(jsonContent: string): string {
  return jsonContent
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/'/g, '"')
    // Unquoted property names
    .replace(/([{,])\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
    // Quote unquoted fractions (e.g., : 1/4 becomes : "1/4")
    .replace(/: (\d+\s*\/\s*\d+)/g, ': "$1"')
    // Trailing commas
    .replace(/,\s*([}\]])/g, '$1');
}

function toDifficulty(val: string): 'Easy' | 'Medium' | 'Hard' {
  if (val === 'Easy' || val === 'Medium' || val === 'Hard') return val;
  return 'Medium';
}

export const recognizeFood = async (imageFile: File, language: Language): Promise<RecognitionResponse> => {
  try {
    console.log('Starting food recognition process...');
    console.log('Image file details:', {
      name: imageFile.name,
      type: imageFile.type,
      size: imageFile.size,
      lastModified: imageFile.lastModified
    });

    // Enhanced image validation
    const validateImage = (file: File): Promise<{ isValid: boolean; message?: string }> => {
      return new Promise((resolve) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        
        img.onload = () => {
          URL.revokeObjectURL(objectUrl);
          const minDimension = 100;
          const maxDimension = 4096;
          
          if (img.width < minDimension || img.height < minDimension) {
            console.warn('Image dimensions too small:', { width: img.width, height: img.height });
            resolve({ 
              isValid: false, 
              message: `Image dimensions (${img.width}x${img.height}) are too small. Minimum size is ${minDimension}x${minDimension} pixels.` 
            });
          } else if (img.width > maxDimension || img.height > maxDimension) {
            console.warn('Image dimensions too large:', { width: img.width, height: img.height });
            resolve({ 
              isValid: false, 
              message: `Image dimensions (${img.width}x${img.height}) are too large. Maximum size is ${maxDimension}x${maxDimension} pixels.` 
            });
          } else {
            resolve({ isValid: true });
          }
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          console.error('Failed to load image for validation');
          resolve({ 
            isValid: false, 
            message: 'Failed to load image. The file might be corrupted or in an unsupported format.' 
          });
        };
        
        img.src = objectUrl;
      });
    };

    const validationResult = await validateImage(imageFile);
    if (!validationResult.isValid) {
      return {
        success: false,
        error: validationResult.message || 'Invalid image. Please provide a clearer image.'
      };
    }

    const base64Image = await convertFileToBase64(imageFile);
    console.log('Image converted to base64, length:', base64Image.length);

    const prompt = getPromptForLanguage(language);
    console.log('Using prompt for language:', language);

    console.log('Sending request to Gemini API...');
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: imageFile.type,
                  data: base64Image
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.05,
          topK: 16,
          topP: 0.7,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE"
          }
        ]
      })
    });

    console.log('API Response status:', response.status);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to recognize food');
    }

    const data = await response.json();
    console.log('API Response:', data);
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Invalid response structure:', data);
      throw new Error('Invalid response from Gemini API');
    }

    const textResponse = data.candidates[0].content.parts[0].text;
    console.log('Raw text response:', textResponse);
    
    // Extract JSON from the response
    let jsonContent = textResponse;
    console.log('Original response:', textResponse);

    // STRIP MARKDOWN CODE BLOCK MARKERS FIRST
    jsonContent = jsonContent.replace(/^\s*```json\s*/i, '').replace(/^\s*```\s*/i, '');

    // Use stack-based extraction for first valid JSON object
    const extracted = extractFirstJSONObject(jsonContent);
    if (extracted) {
      jsonContent = extracted;
      console.log('Extracted JSON using stack:', jsonContent);
    }

    if (!jsonContent) {
      throw new Error('No JSON found in response');
    }

    // Clean the JSON string minimally
    let cleanResponse = cleanGeminiJSON(jsonContent)
      // Remove any trailing commas before closing braces/brackets
      .replace(/,\s*([}\]])/g, '$1')
      // Remove any non-ASCII or control characters
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      // Remove any backticks
      .replace(/`/g, '"')
      // Remove any extraneous semicolons
      .replace(/;+/g, '')
      // Remove any markdown code block remnants
      .replace(/```/g, '')
      // Remove any trailing/leading whitespace
      .trim();
    console.log('Cleaned response before parsing:', cleanResponse);

    try {
      // Try to parse the cleaned response
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(cleanResponse);
      } catch (e) {
        // Fallback: Try up to last valid closing brace
        const lastBrace = cleanResponse.lastIndexOf('}');
        if (lastBrace !== -1) {
          const fallbackClean = cleanResponse.substring(0, lastBrace + 1);
          try {
            parsedResponse = JSON.parse(fallbackClean);
            console.warn('Fallback JSON parse succeeded with truncated data.');
          } catch (e2) {
            console.error('Fallback JSON parsing error:', e2);
            throw new Error('JSON parsing error: ' + (e2 as Error).message + '\nCleaned JSON: ' + fallbackClean);
          }
        } else {
          throw new Error('JSON parsing error: ' + (e as Error).message + '\nCleaned JSON: ' + cleanResponse);
        }
      }
      console.log('Successfully parsed JSON:', parsedResponse);

      // Additional validation to ensure the structure is correct
      if (!parsedResponse || typeof parsedResponse !== 'object') {
        throw new Error('Invalid JSON structure');
      }

      // Extract the relevant parts with fallback values
      const result = {
        foodName: parsedResponse.foodName || '',
        confidence: parsedResponse.confidence || 0,
        ingredients: Array.isArray(parsedResponse.ingredients) ? parsedResponse.ingredients : [],
        recipe: parsedResponse.recipe || {},
        nutrition: parsedResponse.nutrition || {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          sugar: 0,
          fiber: 0,
          vitamins: {
            A: 0,
            C: 0,
            D: 0,
            E: 0,
            K: 0,
            B1: 0,
            B2: 0,
            B3: 0,
            B6: 0,
            B12: 0,
            Folate: 0
          },
          minerals: {
            Calcium: 0,
            Iron: 0,
            Magnesium: 0,
            Phosphorus: 0,
            Potassium: 0,
            Sodium: 0,
            Zinc: 0
          }
        }
      };

      // Warn if the original response was truncated
      if (textResponse.length > cleanResponse.length + 10) {
        console.warn('Warning: The response from Gemini API was truncated. Some data may be missing.');
      }

      console.log('Extracted result:', result);
      
      // Validate the result structure
      if (!result.foodName || typeof result.foodName !== 'string') {
        return {
          success: false,
          error: 'Could not recognize this food. Please try a clearer image or a different angle.'
        };
      }
      
      if (!result.confidence || typeof result.confidence !== 'number' || result.confidence < 0 || result.confidence > 1) {
        return {
          success: false,
          error: 'Recognition confidence is too low. Please try a clearer image.'
        };
      }
      
      if (!Array.isArray(result.ingredients) || result.ingredients.length === 0) {
        return {
          success: true,
          result: {
            foodRecognition: {
              foodName: result.foodName,
              confidence: result.confidence
            },
            recipe: {
              name: result.foodName,
              ingredients: [],
              steps: [],
              prepTime: '',
              cookTime: '',
              servings: 0,
              difficulty: 'Unknown'
            },
            nutrition: result.nutrition
          },
          error: 'Partial result: Only food name detected.'
        };
      }

      // Transform the response to match the expected type
      const transformedResult = {
        foodRecognition: {
          foodName: result.foodName,
          confidence: result.confidence
        },
        recipe: {
          name: result.foodName,
          ingredients: result.ingredients.map((ingredient: any) => ({
            name: ingredient.name || '',
            quantity: (ingredient.quantity || '').toString(),
            unit: ingredient.unit || '',
            isAvailable: true,
            substitutes: []
          })),
          steps: Array.isArray(result.recipe.steps) ? result.recipe.steps : [],
          prepTime: `${result.recipe.prepTime || 0} minutes`,
          cookTime: `${result.recipe.cookTime || 0} minutes`,
          servings: result.recipe.servings || 0,
          difficulty: toDifficulty(result.recipe.difficulty || 'Medium')
        },
        nutrition: {
          calories: result.nutrition?.calories || 262,
          protein: result.nutrition?.protein || 4.5,
          carbs: result.nutrition?.carbs || 28,
          fat: result.nutrition?.fat || 16,
          sugar: result.nutrition?.sugar || 1.5,
          fiber: result.nutrition?.fiber || 2.5,
          vitamins: {
            A: result.nutrition?.vitamins?.A || 80,
            C: result.nutrition?.vitamins?.C || 4,
            D: result.nutrition?.vitamins?.D || 0,
            E: result.nutrition?.vitamins?.E || 1.2,
            K: result.nutrition?.vitamins?.K || 8,
            B1: result.nutrition?.vitamins?.B1 || 0.1,
            B2: result.nutrition?.vitamins?.B2 || 0.08,
            B3: result.nutrition?.vitamins?.B3 || 1.5,
            B6: result.nutrition?.vitamins?.B6 || 0.2,
            B12: result.nutrition?.vitamins?.B12 || 0,
            Folate: result.nutrition?.vitamins?.Folate || 40
          },
          minerals: {
            calcium: result.nutrition?.minerals?.Calcium || 25,
            iron: result.nutrition?.minerals?.Iron || 1.8,
            magnesium: result.nutrition?.minerals?.Magnesium || 30,
            phosphorus: result.nutrition?.minerals?.Phosphorus || 80,
            potassium: result.nutrition?.minerals?.Potassium || 210,
            sodium: result.nutrition?.minerals?.Sodium || 380,
            zinc: result.nutrition?.minerals?.Zinc || 0.5
          }
        }
      };
      
      return {
        success: true,
        result: transformedResult
      };
    } catch (e) {
      console.error('JSON parsing error:', e);
      console.error('Failed to parse JSON at position:', (e as SyntaxError).message);
      // --- Fallback: Try to extract foodName, ingredients, steps using regex ---
      const fallback = { foodName: '', ingredients: [], steps: [] as string[], prepTime: '', cookTime: '', servings: 0, difficulty: 'Unknown' };
      // Try to extract foodName
      const foodNameMatch = cleanResponse.match(/"foodName"\s*:\s*"([^"]+)"/);
      if (foodNameMatch) fallback.foodName = foodNameMatch[1];
      // Try to extract ingredients (first array of objects)
      const ingredientsMatch = cleanResponse.match(/"ingredients"\s*:\s*\[(.*?)\]/s);
      if (ingredientsMatch) {
        try {
          // Wrap in [] and replace single quotes with double quotes for parse
          const arrStr = '[' + ingredientsMatch[1].replace(/'/g, '"') + ']';
          // Try to fix unquoted keys
          const fixedArrStr = arrStr.replace(/([{,])\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
          fallback.ingredients = JSON.parse(fixedArrStr);
        } catch {}
      }
      // Try to extract steps (array of strings)
      const stepsMatch = cleanResponse.match(/"steps"\s*:\s*\[(.*?)\]/s);
      if (stepsMatch) {
        try {
          // Wrap in [] and split by ", then clean
          const arrStr = '[' + stepsMatch[1] + ']';
          const stepsArr = arrStr.match(/"(.*?)"/g)?.map(s => s.replace(/"/g, '')) || [];
          fallback.steps = stepsArr;
        } catch {}
      }
      // Try to extract prepTime
      const prepTimeMatch = cleanResponse.match(/"prepTime"\s*:\s*"([^"]+)"/);
      if (prepTimeMatch) fallback.prepTime = prepTimeMatch[1];
      // Try to extract cookTime
      const cookTimeMatch = cleanResponse.match(/"cookTime"\s*:\s*"([^"]+)"/);
      if (cookTimeMatch) fallback.cookTime = cookTimeMatch[1];
      // Try to extract servings
      const servingsMatch = cleanResponse.match(/"servings"\s*:\s*(\d+)/);
      if (servingsMatch) fallback.servings = parseInt(servingsMatch[1], 10);
      // Try to extract difficulty
      const difficultyMatch = cleanResponse.match(/"difficulty"\s*:\s*"([^"]+)"/);
      if (difficultyMatch) fallback.difficulty = difficultyMatch[1];
      if (fallback.foodName) {
        return {
          success: true,
          result: {
            foodRecognition: {
              foodName: fallback.foodName,
              confidence: 0.5 // unknown
            },
            recipe: {
              name: fallback.foodName,
              ingredients: Array.isArray(fallback.ingredients) ? fallback.ingredients.map((ingredient: any) => ({
                name: ingredient.name || '',
                quantity: (ingredient.quantity || '').toString(),
                unit: ingredient.unit || '',
                isAvailable: true,
                substitutes: []
              })) : [],
              steps: fallback.steps,
              prepTime: fallback.prepTime,
              cookTime: fallback.cookTime,
              servings: fallback.servings,
              difficulty: toDifficulty(fallback.difficulty)
            },
            nutrition: {
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
              sugar: 0,
              fiber: 0,
              vitamins: {},
              minerals: {}
            }
          },
          error: 'Partial result: Could not fully parse JSON, showing best effort.'
        };
      }
      // --- End fallback ---
      return {
        success: false,
        error: 'Failed to process the recognition response. Please try again with a clearer image.'
      };
    }
  } catch (error) {
    console.error('Error recognizing food:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to recognize food. Please try again with a clearer image.'
    };
  }
};

// Speech to text using Web Speech API
export const speechToText = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      reject(new Error('Speech recognition not supported'));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      resolve(transcript);
    };

    recognition.onerror = (event) => {
      reject(new Error(`Speech recognition error: ${event.error}`));
    };

    recognition.start();
  });
};

// Text to speech using Web Speech API
export const textToSpeech = async (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));
    
    // Enhanced voice selection for a more natural female voice
    const voices = window.speechSynthesis.getVoices();
    
    // Prioritized list of preferred female voices (expanded with more natural-sounding options)
    const preferredVoices = [
      // Microsoft voices (typically more natural)
      'Microsoft Zira',
      'Microsoft Sarah',
      // Apple voices
      'Samantha',
      'Karen',
      // Google voices
      'Google UK English Female',
      // Generic female identifiers
      'female',
      'woman',
      // Common female voice names
      'zira',
      'susan',
      'eva',
      'kendra',
      'victoria',
      'lisa',
      'amy',
      'elizabeth'
    ];

    // Try to find a female voice using multiple strategies
    let selectedVoice = 
      // First try: exact name match
      voices.find(v => preferredVoices.some(name => v.name === name)) ||
      // Second try: partial name match (case insensitive)
      voices.find(v => preferredVoices.some(name => 
        v.name.toLowerCase().includes(name.toLowerCase()) || 
        v.voiceURI.toLowerCase().includes(name.toLowerCase())
      )) ||
      // Third try: any voice marked as female
      voices.find(v => v.name.toLowerCase().includes('female')) ||
      // Final fallback: first available voice
      voices[0];

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      // Optimized speech parameters for clarity and engagement
      utterance.pitch = 1.15;    // Slightly higher pitch for feminine voice
      utterance.rate = 0.95;     // Slightly slower for better clarity
      utterance.volume = 1.0;    // Full volume
    }

    // Add slight pause between sentences for better comprehension
    const textWithPauses = text.replace(/([.!?])\s+/g, '$1... ');
    utterance.text = textWithPauses;

    // Ensure voices are loaded before speaking
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.speak(utterance);
      };
    } else {
      window.speechSynthesis.speak(utterance);
    }
  });
}; 