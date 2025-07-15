# 🍽️ BiteAI – AI Recipe Generator

**BiteAI** is a cutting-edge AI-powered food assistant that helps users generate creative, personalized recipes from text or voice inputs. It also supports food recognition and image-based recipe suggestions using Gemini API and Ollama Mistral.

---

## 🧠 Features

- 🎤 Voice-controlled ingredient input
- 🔍 Real-time recipe search suggestions
- 🍛 AI-generated recipes based on ingredients, cuisine, or meal type
- 🖼️ Image-based food recognition using Gemini Vision API
- 📋 Recipe includes:
  - Ingredients
  - Instructions
  - Cooking time
  - Personalization tags
- 📢 Text-to-speech output for accessibility
- ♿ Keyboard navigation & high-contrast UI mode

---

## 🔧 Tech Stack

- **Frontend:** React.js, TypeScript, Tailwind CSS
- **AI Models:** Gemini API, Ollama Mistral
- **Accessibility:** ARIA roles, text-to-speech, contrast toggle

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/bite-ai.git
cd bite-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up API keys

Create a `.env` file in the root and add:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key
OLLAMA_MODEL=mistral
```

> ⚠️ Make sure the Ollama server is running locally or hosted if required.

### 4. Run the development server

```bash
npm run dev
```

Go to:  
`http://localhost:5173`

---

## 📁 Project Structure

```plaintext
bite-ai/
│
├── public/
│   └── favicon.ico
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── assets/
│   ├── App.tsx
│   └── main.tsx
│
├── .env
├── index.html
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## ✨ Future Improvements

- 📊 Nutrition facts with external APIs
- 🧠 Fine-tune Ollama Mistral model for cooking language
- 🌐 Multilingual recipe generation
- 📱 Progressive Web App (PWA) support

---

## 🤝 Contributing

1. Fork the repository  
2. Create a feature branch  
   ```bash
   git checkout -b feature/your-feature
   ```  
3. Commit your changes  
   ```bash
   git commit -m "Add: your feature"
   ```  
4. Push and submit a PR  
   ```bash
   git push origin feature/your-feature
   ```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👤 Author

Built with 🍲 by [Kiran Patige](https://github.com/kiranpatige)  
Let’s connect on [LinkedIn](https://www.linkedin.com/in/kiranpatige)
