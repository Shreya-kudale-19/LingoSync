import React, { useState, useEffect } from 'react';
import { Upload as UploadIcon, Image, X, Eye, Download, Copy, Check } from 'lucide-react';
import LanguageContainer from './LanguageContainer';
import axios from 'axios';
import '../styles/ImageTranslator.css';

// API base URL configuration
const API_BASE_URL = 'https://8000-whitedevil201-lingosync-kaay4x8p29x.ws-us118.gitpod.io';

function ImageTranslator() {
  const [image, setImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState('select');
  const [isTranslating, setIsTranslating] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  
  // OCR and translation results
  const [extractedText, setExtractedText] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [translatedText, setTranslatedText] = useState('');

  // Copy button states
  const [copiedExtracted, setCopiedExtracted] = useState(false);
  const [copiedTranslated, setCopiedTranslated] = useState(false);

  // Reset copy states after delay
  useEffect(() => {
    if (copiedExtracted) {
      const timer = setTimeout(() => {
        setCopiedExtracted(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedExtracted]);

  useEffect(() => {
    if (copiedTranslated) {
      const timer = setTimeout(() => {
        setCopiedTranslated(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedTranslated]);

  // Cleanup image URLs when component unmounts
  useEffect(() => {
    return () => {
      imagePreviewUrl && URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  // Copy text to clipboard
  const copyToClipboard = async (text, setCopied) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.match('image.*')) {
      setImage(file);
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
      setExtractedText('');
      setDetectedLanguage('');
      setTranslatedText('');
      setError(null);
    } else if (file) {
      setError('Please upload an image file (PNG, JPG, JPEG, etc.)');
    }
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.match('image.*')) {
      setImage(file);
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
      setExtractedText('');
      setDetectedLanguage('');
      setTranslatedText('');
      setError(null);
    } else if (file) {
      setError('Please upload an image file (PNG, JPG, JPEG, etc.)');
    }
  };

  // Remove the current image
  const handleRemoveImage = () => {
    setImage(null);
    setImagePreviewUrl(null);
    setExtractedText('');
    setDetectedLanguage('');
    setTranslatedText('');
  };

  // Translate the image text
  const handleTranslate = async () => {
    if (!image) {
      setError('Please upload an image first.');
      return;
    }
    
    if (targetLanguage === 'select') {
      setError('Please select a target language.');
      return;
    }
    
    setIsTranslating(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', image);
    formData.append('target_lang', targetLanguage);
    
    const apiEndpoint = `${API_BASE_URL}/api/images/image-translate`;

    try {
      const response = await axios.post(
        apiEndpoint,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      
      const { extracted_text, detected_language, translated_text } = response.data;
      
      setExtractedText(extracted_text);
      setDetectedLanguage(detected_language);
      setTranslatedText(translated_text);
      
    } catch (err) {
      console.error('API Error:', err);
      
      if (err.response) {
        if (err.response.status === 422) {
          setError('Invalid request: Please check your image and language selection.');
        } else if (err.response.status === 413) {
          setError('Image is too large. Please upload a smaller image (max 10MB).');
        } else if (err.response.status === 429) {
          setError('Too many requests. Please try again later.');
        } else if (err.response.status === 400) {
          setError(`Error: ${err.response.data.detail || 'No text detected in image.'}`);
        } else {
          setError(`Server error (${err.response.status}): ${err.response.data?.detail || 'Image translation failed.'}`);
        }
      } else if (err.request) {
        setError('No response from server. Please check your internet connection.');
      } else {
        setError('Error making the request. Please try again.');
      }
    } finally {
      setIsTranslating(false);
    }
  };

  // Download text as file
  const downloadTextAsFile = (text, filename) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="image-translator-container">
      <h2 className="image-translator-title">Image Translation</h2>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="professional-layout">
        {/* Left Panel */}
        <div className="professional-panel left-panel">
          <div className="panel-section">
            <div 
              className={`image-upload-area ${dragActive ? 'drag-active' : ''} ${image ? 'has-image' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {!image ? (
                <div className="upload-prompt">
                  <UploadIcon className="upload-icon"/>
                  <div className="upload-instructions">
                    <p className="upload-text">Drag and drop image, or</p>
                    <label className="browse-files-button">
                      Browse
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange}
                        className="file-input"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="file-display">
                  <div className="file-info">
                    <Image className="file-icon"/>
                    <div>
                      <p className="filename">{image.name}</p>
                      <p className="file-size">
                        {(image.size/1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <div className="file-actions">
                    <button 
                      onClick={() => window.open(imagePreviewUrl, '_blank')}
                      className="view-file-button"
                      title="View image"
                    >
                      <Eye className="action-icon"/>
                      <span>View</span>
                    </button>
                    <button 
                      onClick={handleRemoveImage}
                      className="remove-file-button"
                      title="Remove image"
                    >
                      <X className="action-icon"/>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Target Language Section */}
          <div className="panel-section">
            <div className="section-header">
              <h3 className="section-title">Target Language</h3>
            </div>
            <div className="language-selector-wrapper">
              <LanguageContainer
                isSource={false}
                language={targetLanguage}
                setLanguage={setTargetLanguage}
                text="" 
                setText={() => {}} 
                handleClearText={() => {}} 
                readonly={true}
                showTextarea={false}
              />
            </div>
          </div>

          <div className="panel-section translate-section">
            <button 
              onClick={handleTranslate} 
              disabled={!image || isTranslating || targetLanguage === 'select'}
              className={`translate-button ${!image || isTranslating || targetLanguage === 'select' ? 'disabled' : 'enabled'}`}
            >
              {isTranslating 
                ? <div className="translate-spinner"/>
                : <UploadIcon className="translate-icon"/>
              }
              <span>Translate Image</span>
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="professional-panel right-panel">
          {extractedText ? (
            <div className="panel-section">
              <div className="text-results-container">
                <div className="text-result">
                  <div className="text-result-header">
                    <h3 className="text-result-title">Extracted Text <span className="language-tag">({detectedLanguage})</span></h3>
                    <button 
                      className="copy-button" 
                      onClick={() => copyToClipboard(extractedText, setCopiedExtracted)}
                      title="Copy to clipboard"
                    >
                      {copiedExtracted ? <Check className="copy-icon copied" /> : <Copy className="copy-icon" />}
                    </button>
                  </div>
                  <div className="text-result-content">
                    {extractedText}
                  </div>
                </div>
                
                <div className="text-result">
                  <div className="text-result-header">
                    <h3 className="text-result-title">Translated Text <span className="language-tag">({targetLanguage})</span></h3>
                    <button 
                      className="copy-button" 
                      onClick={() => copyToClipboard(translatedText, setCopiedTranslated)}
                      title="Copy to clipboard"
                    >
                      {copiedTranslated ? <Check className="copy-icon copied" /> : <Copy className="copy-icon" />}
                    </button>
                  </div>
                  <div className="text-result-content">
                    {translatedText}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-results">
              <div className="empty-results-content">
                <Image className="empty-icon" />
                <p>Upload an image and select target language to start translation</p>
              </div>
            </div>
          )}

          {image && extractedText && (
            <div className="panel-section">
              <div className="section-header">
                <h3 className="section-title">Download Options</h3>
              </div>
              <div className="download-buttons">
                <button 
                  className="download-button original"
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = imagePreviewUrl;
                    a.download = image.name;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                >
                  <Download className="button-icon"/>
                  <span>Original</span>
                </button>
                <button
                  className="download-button extracted"
                  onClick={() => downloadTextAsFile(extractedText, `extracted_${image.name}.txt`)}
                >
                  <Download className="button-icon"/>
                  <span>Extracted</span>
                </button>
                <button
                  className="download-button translated"
                  onClick={() => downloadTextAsFile(translatedText, `translated_${image.name}.txt`)}
                >
                  <Download className="button-icon"/>
                  <span>Translated</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImageTranslator; 