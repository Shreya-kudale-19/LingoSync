import React, { useState, useEffect } from 'react';
import { Upload as UploadIcon, FileText, X, Eye, Download, Maximize2, Minimize2 } from 'lucide-react';
import LanguageContainer from './LanguageContainer';
import mammoth from 'mammoth';
import axios from 'axios';
import '../styles/DocumentUploader.css';

const API_BASE_URL = 'https://8000-whitedevil201-lingosync-kaay4x8p29x.ws-us118.gitpod.io';


function DocumentUploader() {
  const [file, setFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState('select');
  const [translatedFileURL, setTranslatedFileURL] = useState(null);
  const [translatedPreviewContent, setTranslatedPreviewContent] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewType, setPreviewType] = useState(null);
  const [previewContent, setPreviewContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fullscreenPreview, setFullscreenPreview] = useState(null);

  useEffect(() => {
    return () => {
      filePreviewUrl && URL.revokeObjectURL(filePreviewUrl);
      translatedFileURL && URL.revokeObjectURL(translatedFileURL);
    };
  }, [filePreviewUrl, translatedFileURL]);

  useEffect(() => {
    if (file) generatePreview(file);
    else {
      setPreviewContent(null);
      setPreviewType(null);
    }
  }, [file]);

  const generatePreview = async (file) => {
    setLoading(true);
    try {
      const ext = file.name.split('.').pop().toLowerCase();
      setPreviewType(ext);
      const url = URL.createObjectURL(file);
      setFilePreviewUrl(url);

      if (ext === 'docx') {
        const buffer = await file.arrayBuffer();
        const { value } = await mammoth.extractRawText({ arrayBuffer: buffer });
        setPreviewContent(value);
      }
    } catch (err) {
      setError('Error generating preview');
      console.error('Preview error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setTranslatedFileURL(null);
    setTranslatedPreviewContent(null);
    setError(null);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFilePreviewUrl(null);
    setTranslatedFileURL(null);
    setPreviewContent(null);
    setTranslatedPreviewContent(null);
    setPreviewType(null);
  };

  const handleUpload = async () => {
    if (!file || targetLanguage === 'select') return;
    
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_lang', targetLanguage);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/documents/translate_document`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          responseType: 'blob'
        }
      );

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = URL.createObjectURL(blob);
      setTranslatedFileURL(url);

      if (previewType === 'docx') {
        const buf = await blob.arrayBuffer();
        const { value } = await mammoth.extractRawText({ arrayBuffer: buf });
        setTranslatedPreviewContent(value);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Translation failed. Please try again.');
      console.error('API Error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const renderPreviewPane = (type) => {
    const isOriginal = type === 'original';
    const showUrl = isOriginal ? filePreviewUrl : translatedFileURL;
    const showContent = isOriginal ? previewContent : translatedPreviewContent;
    const fileName = isOriginal ? (file?.name || '') : `translated_${file?.name || ''}`;
    
    if (loading && isOriginal) {
      return (
        <div className="loading-spinner-container">
          <div className="loading-spinner"/>
        </div>
      );
    }

    if (!showUrl && !showContent) {
      return (
        <div className="empty-preview">
          <FileText className="empty-preview-icon" />
          <p className="empty-preview-text">
            {isOriginal ? 'No file selected' : 'No translation available yet'}
          </p>
        </div>
      );
    }

    if (previewType === 'pdf') {
      return (
        <div className="pdf-preview-container">
          <div className="pdf-preview-header">
            <span className="pdf-preview-filename">{fileName}</span>
            <div className="pdf-preview-actions">
              {showUrl && (
                <a 
                  href={showUrl}
                  download={fileName}
                  className="pdf-download-button"
                  title="Download"
                >
                  <Download className="action-icon" />
                </a>
              )}
              <button 
                onClick={() => setFullscreenPreview(fullscreenPreview === type ? null : type)}
                className="fullscreen-button"
                title={fullscreenPreview === type ? "Exit fullscreen" : "Fullscreen"}
              >
                {fullscreenPreview === type ? 
                  <Minimize2 className="action-icon" /> : 
                  <Maximize2 className="action-icon" />
                }
              </button>
            </div>
          </div>
          <iframe src={showUrl} className="pdf-preview-frame" title={`${type} PDF Preview`}/>
        </div>
      );
    }
    
    if (previewType === 'docx') {
      return (
        <div className="docx-preview-container">
          <div className="docx-preview-header">
            <span className="docx-preview-filename">{fileName}</span>
            <div className="docx-preview-actions">
              {showUrl && (
                <a 
                  href={showUrl}
                  download={fileName}
                  className="docx-download-button"
                  title="Download"
                >
                  <Download className="action-icon" />
                </a>
              )}
              <button 
                onClick={() => setFullscreenPreview(fullscreenPreview === type ? null : type)}
                className="fullscreen-button"
                title={fullscreenPreview === type ? "Exit fullscreen" : "Fullscreen"}
              >
                {fullscreenPreview === type ? 
                  <Minimize2 className="action-icon" /> : 
                  <Maximize2 className="action-icon" />
                }
              </button>
            </div>
          </div>
          <div className="docx-preview-content">
            <div className="docx-text-content">
              {showContent?.split('\n').map((line, i) => <p key={i}>{line || <br/>}</p>)}
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="unsupported-preview">
        <p className="unsupported-message">Preview not available for this file type</p>
        {showUrl && (
          <a 
            href={showUrl}
            download={fileName}
            className="unsupported-download-button"
          >
            <Download className="download-icon"/>
            <span>Download File</span>
          </a>
        )}
      </div>
    );
  };

  return (
    <div className="document-uploader-container">
      <h2 className="document-uploader-title">
        Document Translation
      </h2>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div 
        className={`file-upload-area ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {!file ? (
          <div className="upload-prompt">
            <UploadIcon className="upload-icon"/>
            <div className="upload-instructions">
              <p className="upload-text">Drag and drop your file here, or</p>
              <label className="browse-files-button">
                Browse Files
                <input 
                  type="file" 
                  accept=".pdf,.docx" 
                  onChange={handleFileChange}
                  className="file-input"
                />
              </label>
              <p className="supported-formats">Supported formats: PDF, DOCX</p>
            </div>
          </div>
        ) : (
          <div className="file-display">
            <div className="file-info">
              <FileText className="file-icon"/>
              <div>
                <p className="filename">{file.name}</p>
                <p className="file-size">
                  {(file.size/1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <div className="file-actions">
              <button 
                onClick={() => window.open(filePreviewUrl, '_blank')}
                className="view-file-button"
              >
                <Eye className="action-icon"/><span>View</span>
              </button>
              <button 
                onClick={handleRemoveFile}
                className="remove-file-button"
              >
                <X className="action-icon"/>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="language-selection-container">
        <label className="language-label">
          Target Language
        </label>
        <div className="language-selector">
          <LanguageContainer
            isSource={false}
            language={targetLanguage}
            setLanguage={setTargetLanguage}
            text="" 
            setText={() => {}} 
            handleClearText={() => {}} 
            readonly={true}
          />
        </div>
      </div>

      <div className="translate-button-container">
        <button 
          onClick={handleUpload} 
          disabled={!file || isUploading || targetLanguage === 'select'}
          className={`translate-button ${!file || isUploading || targetLanguage === 'select' ? 'disabled' : 'enabled'}`}
        >
          {isUploading 
            ? <div className="translate-spinner"/>
            : <UploadIcon className="translate-icon"/>
          }
          <span>{isUploading ? 'Translating...' : 'Translate Document'}</span>
        </button>
      </div>

      {file && (
        <div className={`preview-container ${fullscreenPreview ? 'fullscreen-preview' : ''}`}>
          {fullscreenPreview && (
            <div className="fullscreen-close-button">
              <button 
                onClick={() => setFullscreenPreview(null)}
                className="close-fullscreen"
              >
                <X className="close-icon" />
              </button>
            </div>
          )}
          
          <div className="preview-content">
            {fullscreenPreview ? (
              <div className="fullscreen-preview-content">
                {renderPreviewPane(fullscreenPreview)}
              </div>
            ) : (
              <>
                <h3 className="preview-title">Document Preview</h3>
                <div className="preview-grid">
                  <div className="original-preview">
                    <div className="preview-header original-header">
                      <h4 className="preview-subtitle">Original Document</h4>
                    </div>
                    {renderPreviewPane('original')}
                  </div>
                  
                  <div className="translated-preview">
                    <div className="preview-header translated-header">
                      <h4 className="preview-subtitle">Translated Document</h4>
                    </div>
                    {renderPreviewPane('translated')}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {file && translatedFileURL && !fullscreenPreview && (
        <div className="download-actions">
          <h3 className="download-title">Document Actions</h3>
          <div className="download-buttons">
            <a 
              href={filePreviewUrl}
              download={file.name}
              className="download-original-button"
            >
              <Download className="download-button-icon"/>
              <span>Download Original</span>
            </a>
            <a 
              href={translatedFileURL}
              download={`translated_${file.name}`}
              className="download-translation-button"
            >
              <Download className="download-button-icon"/>
              <span>Download Translation</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentUploader;