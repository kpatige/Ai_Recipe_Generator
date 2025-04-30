interface RecipeResponse {
  title: string;
  ingredients: string[];
  instructions: string[];
  image_prompt?: string;
}

export const getRecipeFromOllama = async (query: string): Promise<RecipeResponse> => {
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral',
        prompt: `Generate a recipe based on this query: "${query}". 
                Return the response in this exact JSON format:
                {
                  "title": "Recipe Title",
                  "ingredients": ["ingredient 1", "ingredient 2", ...],
                  "instructions": ["step 1", "step 2", ...],
                  "image_prompt": "A detailed prompt to generate an image of this dish"
                }`,
        stream: false,
      }),
    });

    const data = await response.json();
    try {
      // Parse the response text as JSON
      const recipeData = JSON.parse(data.response);
      return recipeData as RecipeResponse;
    } catch (e) {
      throw new Error('Failed to parse recipe data');
    }
  } catch (error) {
    console.error('Error fetching recipe:', error);
    throw error;
  }
}; 