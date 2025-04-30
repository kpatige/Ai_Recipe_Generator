export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llava',  // Make sure you have the llava model installed
        prompt: `Generate an appetizing image of: ${prompt}. Make it look professional and high quality.`,
        stream: false,
      }),
    });

    const data = await response.json();
    if (data.images && data.images[0]) {
      return `data:image/jpeg;base64,${data.images[0]}`;
    }
    throw new Error('No image generated');
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}; 