import React, { useState, useRef, useEffect } from 'react';
import { recognizeFood } from '../services/geminiApi';
import { Language, RecognitionResponse } from '../types';
import './ImageUpload.css';

interface ImageUploadProps {
  onImageUpload: (result: RecognitionResponse) => void;
  language: Language;
  onLanguageChange: (language: Language) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload, language, onLanguageChange }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileChange = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setError(null);
    setIsLoading(true);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      const result = await recognizeFood(file, language);
      console.log('Recognition result:', result);
      onImageUpload(result);
      if (!result.success) {
        setError(result.error || 'Failed to recognize food');
      }
    } catch (err) {
      console.error('Error processing image:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while processing the image';
      setError(errorMessage);
      onImageUpload({
        success: false,
        error: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Could not access camera');
      console.error('Error accessing camera:', err);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob(blob => {
          if (blob) {
            const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
            handleFileChange(file);
            stopCamera();
          }
        }, 'image/jpeg');
      }
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const translations = {
    en: {
      upload: 'Upload Image',
      dragDrop: 'Drag & drop an image here, or click to select',
      or: 'or',
      useCamera: 'Use Camera',
      takePhoto: 'Take Photo',
      stopCamera: 'Stop Camera',
      loading: 'Analyzing image...',
      error: 'Error: ',
      selectLanguage: 'Select Language',
      languages: {
        en: 'English',
        hi: 'Hindi',
        kn: 'Kannada'
      }
    },
    hi: {
      upload: 'छवि अपलोड करें',
      dragDrop: 'यहां छवि खींचें और छोड़ें, या चुनने के लिए क्लिक करें',
      or: 'या',
      useCamera: 'कैमरा का उपयोग करें',
      takePhoto: 'फोटो लें',
      stopCamera: 'कैमरा बंद करें',
      loading: 'छवि का विश्लेषण किया जा रहा है...',
      error: 'त्रुटि: ',
      selectLanguage: 'भाषा चुनें',
      languages: {
        en: 'अंग्रेजी',
        hi: 'हिंदी',
        kn: 'कन्नड़'
      }
    },
    kn: {
      upload: 'ಚಿತ್ರವನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಿ',
      dragDrop: 'ಇಲ್ಲಿ ಚಿತ್ರವನ್ನು ಎಳೆಯಿರಿ ಮತ್ತು ಬಿಡಿ, ಅಥವಾ ಆಯ್ಕೆ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ',
      or: 'ಅಥವಾ',
      useCamera: 'ಕ್ಯಾಮೆರಾ ಬಳಸಿ',
      takePhoto: 'ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ',
      stopCamera: 'ಕ್ಯಾಮೆರಾ ನಿಲ್ಲಿಸಿ',
      loading: 'ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...',
      error: 'ದೋಷ: ',
      selectLanguage: 'ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
      languages: {
        en: 'ಇಂಗ್ಲಿಷ್',
        hi: 'ಹಿಂದಿ',
        kn: 'ಕನ್ನಡ'
      }
    }
  };

  const t = translations[language];

  return (
    <div className="image-upload-container">
      <div
        className={`upload-area ${isDragging ? 'active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
          accept="image/*"
          style={{ display: 'none' }}
        />

        {isLoading ? (
          <div className="loader-container">
            <div className="loader"></div>
            <p>{t.loading}</p>
          </div>
        ) : previewUrl ? (
          <img src={previewUrl} alt="Preview" className="preview-image" />
        ) : cameraStream ? (
          <div className="camera-container">
            <video ref={videoRef} autoPlay playsInline className="camera-preview" />
            <button onClick={captureImage} className="capture-button">
              {t.takePhoto}
            </button>
            <button onClick={stopCamera} className="stop-camera-button">
              {t.stopCamera}
            </button>
          </div>
        ) : (
          <div className="upload-content">
            <div className="upload-icon">📷</div>
            <p>{t.dragDrop}</p>
            <div className="or-separator">
              <span>{t.or}</span>
            </div>
            <button onClick={startCamera} className="camera-button">
              {t.useCamera}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          {t.error}
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;