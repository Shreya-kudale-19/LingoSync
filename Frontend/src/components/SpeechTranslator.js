import React, { useState, useRef, useEffect } from 'react';
import { Mic, Play, Square, Save, Trash2, Volume2, Loader, Languages, Upload, File, PlayCircle } from 'lucide-react';
import LanguageContainer from './LanguageContainer';
import axios from 'axios';
import '../styles/SpeechTranslator.css';

// API base URL configuration
const API_BASE_URL = 'https://8000-whitedevil201-lingosync-kaay4x8p29x.ws-us118.gitpod.io';

function SpeechTranslator() {
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('select');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [translatedAudio, setTranslatedAudio] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [audioFileName, setAudioFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const translatedAudioRef = useRef(null);
  const fileInputRef = useRef(null);

  // Clean up URLs on unmount
  useEffect(() => {
    return () => {
      if (recordedAudio) URL.revokeObjectURL(recordedAudio);
      if (translatedAudio) URL.revokeObjectURL(translatedAudio);
    };
  }, [recordedAudio, translatedAudio]);

  // Timer for recording duration
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  // Play/pause audio
  useEffect(() => {
    const handleEnded = () => setIsPlaying(false);
    
    const currentAudioRef = audioRef.current;
    
    if (currentAudioRef) {
      currentAudioRef.addEventListener('ended', handleEnded);
    }
    
    return () => {
      if (currentAudioRef) {
        currentAudioRef.removeEventListener('ended', handleEnded);
      }
    };
  }, [recordedAudio]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const startRecording = async () => {
    try {
      setError(null);
      setRecordedAudio(null);
      setTranslatedAudio(null);
      setTranscript('');
      setTranslatedText('');
      setRecordingTime(0);
      setAudioFileName('');
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      });

      mediaRecorderRef.current.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioUrl);
        setAudioFileName('recorded-audio.wav');
        
        // Optionally get transcript here with speech-to-text API
        generateTranscript(audioBlob);
      });

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  const playTranslatedAudio = () => {
    if (translatedAudioRef.current) {
      console.log("Playing audio from:", translatedAudioRef.current.src);
      
      // Check if the audio has a valid source before attempting to play
      if (!translatedAudioRef.current.src) {
        setError("Audio source is missing. Try downloading instead.");
        return;
      }
      
      // Add error handling for audio playback
      translatedAudioRef.current.onerror = (e) => {
        console.error("Audio playback error:", e);
        setError(`Audio playback failed: ${e.target.error?.message || 'Unknown error'}`);
      };
      
      // Try to play the audio
      try {
        // Force reload the audio element before playing
        translatedAudioRef.current.load();
        
        translatedAudioRef.current.play().catch(err => {
          console.error("Audio play error:", err);
          setError(`Could not play audio: ${err.message}`);
        });
      } catch (err) {
        console.error("Exception playing audio:", err);
        setError(`Audio playback exception: ${err.message}`);
      }
    } else {
      console.error("Audio element reference not available");
      setError("Audio player not ready. Please try again.");
    }
  };

  const clearRecording = () => {
    if (recordedAudio) {
      URL.revokeObjectURL(recordedAudio);
    }
    if (translatedAudio) {
      URL.revokeObjectURL(translatedAudio);
    }
    
    setRecordedAudio(null);
    setTranslatedAudio(null);
    setTranscript('');
    setTranslatedText('');
    setRecordingTime(0);
    setAudioFileName('');
    setError(null);
    setDetectedLanguage('');
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    handleAudioFile(file);
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
    
    const file = e.dataTransfer.files[0];
    handleAudioFile(file);
  };

  const handleAudioFile = (file) => {
    if (!file) return;

    // Check if file is an audio file
    if (!file.type.startsWith('audio/')) {
      setError('Please upload an audio file (MP3, WAV, etc.)');
      return;
    }

    clearRecording();
    
    try {
      const audioUrl = URL.createObjectURL(file);
      setRecordedAudio(audioUrl);
      setAudioFileName(file.name);
      
      // Generate transcript from the audio file
      generateTranscript(file);
    } catch (err) {
      console.error('Error handling audio file:', err);
      setError('Could not process the audio file. Please try another file.');
    }
  };

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const generateTranscript = async (audioBlob) => {
    try {
      // Since the speech-translate endpoint handles both transcription and translation,
      // we'll set a placeholder message here instead of making a separate API call
      setTranscript("Processing audio... Translation will include the transcript.");
    } catch (err) {
      console.error('Transcription error:', err);
      setError('Failed to generate transcript. Please try again.');
    }
  };

  const translateSpeech = async () => {
    if (!recordedAudio || targetLanguage === 'select') return;
    
    setIsTranslating(true);
    setError(null);
    
    try {
      // Get the audio blob from the recorded audio URL
      const audioBlob = await fetch(recordedAudio).then(r => r.blob());
      const formData = new FormData();
      formData.append('file', audioBlob, audioFileName || 'recorded-audio.wav');
      formData.append('target_lang', targetLanguage);
      
      console.log(`Sending translation request to: ${API_BASE_URL}/api/speech/speech-translate`);
      
      const response = await axios.post(
        `${API_BASE_URL}/api/speech/speech-translate`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      
      console.log("Translation API response received");
      
      // Handle the response from the API
      const { transcription, detected_language, translated_text, audio_base64 } = response.data;
      
      // Set the transcript and detected language
      setTranscript(transcription);
      setDetectedLanguage(detected_language);
      
      // Set the translated text
      setTranslatedText(translated_text);
      
      // Process the base64 audio data
      if (audio_base64) {
        try {
          // Convert base64 string to binary data
          const binaryString = atob(audio_base64);
          const bytes = new Uint8Array(binaryString.length);
          
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          // Create a blob from the binary data
          const audioBlob = new Blob([bytes], { type: 'audio/mp3' });
          
          // Create a URL for the blob
          const blobUrl = URL.createObjectURL(audioBlob);
          console.log("Created blob URL for translated audio from base64 data");
          setTranslatedAudio(blobUrl);
        } catch (audioErr) {
          console.error("Error processing audio data:", audioErr);
          setError(`Failed to process audio data: ${audioErr.message}`);
          // Still keep the text translation results
        }
      } else {
        console.error("No audio data received in the response");
        setError("No audio data received from translation service");
      }
      
      setIsTranslating(false);
    } catch (err) {
      console.error('Translation error:', err);
      let errorMessage = 'Speech translation failed. Please try again.';
      
      if (err.response) {
        console.error('API error response:', err.response);
        if (err.response.status === 400) {
          errorMessage = err.response.data.detail || 'Invalid request. Please check your audio and language selection.';
        } else if (err.response.status === 502) {
          errorMessage = 'Speech recognition service unavailable. Please try again later.';
        } else {
          errorMessage = `Error: ${err.response.data?.detail || errorMessage}`;
        }
      }
      
      setError(errorMessage);
      setIsTranslating(false);
    }
  };
  
  const downloadAudio = (audioUrl, filename) => {
    if (!audioUrl) {
      setError("No audio available to download");
      return;
    }
    
    try {
      // First, check if the URL is a direct file URL or needs to be fetched
      if (audioUrl.startsWith('blob:')) {
        // For blob URLs, we can use direct download
        const a = document.createElement('a');
        a.href = audioUrl;
        a.download = filename || 'audio.mp3';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // For remote URLs, we need to fetch it first
        // Redirect to the alternative download method
        downloadDirectFromBackend(audioUrl, filename);
      }
    } catch (err) {
      console.error("Download error:", err);
      setError(`Failed to download audio: ${err.message}`);
    }
  };

  // Additional method to download directly from backend
  const downloadDirectFromBackend = async (audioUrl, filename) => {
    if (!audioUrl) {
      setError("No audio available to download");
      return;
    }
    
    try {
      // Show loading indicator
      setIsTranslating(true);
      
      // Make sure we have a valid URL - preprocess if needed
      let fetchUrl = audioUrl;
      
      // Add API base URL if the URL is relative
      if (!audioUrl.startsWith('http') && !audioUrl.startsWith('blob:')) {
        fetchUrl = `${API_BASE_URL}${audioUrl.startsWith('/') ? '' : '/'}${audioUrl}`;
      }
      
      console.log("Fetching audio from:", fetchUrl);
      
      // Fetch the audio file directly as a blob
      const response = await axios.get(fetchUrl, {
        responseType: 'blob',
        withCredentials: false, // Important for cross-origin requests
        headers: {
          'Accept': 'audio/*'
        }
      });
      
      // Create a local URL for the blob
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'audio/mpeg' 
      });
      const url = URL.createObjectURL(blob);
      
      // Download using the blob URL
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'audio.mp3';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up
      URL.revokeObjectURL(url);
      setIsTranslating(false);
    } catch (err) {
      console.error("Direct download error:", err);
      setError(`Failed to download audio: ${err.message}`);
      setIsTranslating(false);
    }
  };

  return (
    <div className="speech-translator-container">
      <h2 className="speech-translator-title">
        Speech Translation
      </h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="language-selection-grid">
        <div className="language-selection-container">
          <label className="language-label">
            Source Language
          </label>
          <div className="language-selector">
            <LanguageContainer
              isSource={true}
              language={sourceLanguage}
              setLanguage={setSourceLanguage}
              showTextarea={false}
              readonly={true}
            />
          </div>
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
              showTextarea={false}
              readonly={true}
            />
          </div>
        </div>
      </div>
      
      <div className="audio-input-options">
        <div className="input-option">
          <h3 className="input-option-title">Record Audio</h3>
          <div className="recorder-container">
            <div className="recorder-controls">
              <div className="recording-timer">
                {formatTime(recordingTime)}
              </div>
              
              <div className="main-controls">
                {!isRecording ? (
                  <button 
                    onClick={startRecording} 
                    className="record-button"
                    disabled={isTranslating}
                  >
                    <Mic className="record-icon" />
                    <span>Record</span>
                  </button>
                ) : (
                  <button 
                    onClick={stopRecording} 
                    className="stop-button"
                  >
                    <Square className="stop-icon" />
                    <span>Stop</span>
                  </button>
                )}
                
                {recordedAudio && !isRecording && (
                  <button 
                    onClick={togglePlayback} 
                    className="play-button"
                    disabled={isTranslating}
                  >
                    {isPlaying ? (
                      <Square className="play-icon" />
                    ) : (
                      <Play className="play-icon" />
                    )}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="input-option">
          <h3 className="input-option-title">Upload Audio File</h3>
          <div 
            className={`file-upload-area ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="upload-content">
              <Upload className="upload-icon" />
              <p>Drag & drop audio files here</p>
              <span className="or-divider">OR</span>
              <button className="browse-button" onClick={openFileSelector}>
                Browse Files
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="audio/*" 
                className="hidden-input"
              />
              <p className="file-types">Supported formats: MP3, WAV, OGG, etc.</p>
            </div>
          </div>
        </div>
      </div>

      {recordedAudio && (
        <div className="active-audio-file">
          <div className="audio-file-info">
            <File className="file-icon" />
            <div className="file-details">
              <p className="file-name">{audioFileName}</p>
              {recordedAudio && (
                <audio ref={audioRef} src={recordedAudio} className="hidden-audio" />
              )}
            </div>
          </div>
          <button 
            onClick={clearRecording} 
            className="clear-button small"
            disabled={isTranslating}
          >
            <Trash2 className="clear-icon" />
            <span>Clear</span>
          </button>
        </div>
      )}
      
      {recordedAudio && (
        <div className="transcript-container">
          <h3 className="transcript-title">
            <Languages className="transcript-icon" />
            Transcript {detectedLanguage && <span className="language-tag">({detectedLanguage})</span>}
          </h3>
          <div className="transcript-content">
            {transcript || "Processing transcript..."}
          </div>
          {recordedAudio && (
            <div className="audio-controls-container">
              <button 
                onClick={togglePlayback} 
                className="audio-control-button"
                disabled={isTranslating}
              >
                {isPlaying ? (
                  <Square className="control-icon" />
                ) : (
                  <Play className="control-icon" />
                )}
                <span>{isPlaying ? 'Pause' : 'Play'} Source Audio</span>
              </button>
              <audio ref={audioRef} src={recordedAudio} className="hidden-audio" />
            </div>
          )}
        </div>
      )}
      
      {recordedAudio && !isRecording && (
        <div className="translate-button-container">
          <button 
            onClick={translateSpeech} 
            disabled={isTranslating || targetLanguage === 'select'}
            className={`translate-button ${isTranslating || targetLanguage === 'select' ? 'disabled' : 'enabled'}`}
          >
            {isTranslating 
              ? <Loader className="translate-spinner" />
              : <Volume2 className="translate-icon" />
            }
            <span>{isTranslating ? 'Translating...' : 'Translate Speech'}</span>
          </button>
        </div>
      )}
      
      {translatedAudio && (
        <div className="translation-result">
          <h3 className="translation-title">Translation Result <span className="language-tag">({targetLanguage})</span></h3>
          
          <div className="translated-audio-container">
            <div className="audio-player">
              <button 
                onClick={playTranslatedAudio}
                className="play-translated-button"
                disabled={!translatedAudio}
              >
                <PlayCircle size={20} />
                <span>Play Translation</span>
              </button>
              
              <button 
                onClick={() => downloadAudio(translatedAudio, `translated_${audioFileName}`)}
                className="download-translation-button"
                disabled={!translatedAudio || isTranslating}
              >
                <Save className="download-icon" />
                <span>{isTranslating ? 'Downloading...' : 'Download'}</span>
              </button>
              
              {/* Add a visible audio player as fallback */}
              <div className="fallback-player" style={{ marginTop: '10px' }}>
                <audio 
                  src={translatedAudio} 
                  controls
                  style={{ width: '100%', marginTop: '10px' }}
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>
            
            {translatedAudio && (
              <audio 
                ref={translatedAudioRef} 
                src={translatedAudio} 
                className="hidden-audio"
                controls={false}
                preload="auto"
                onError={(e) => {
                  console.error("Audio element error:", e);
                  setError("Audio playback failed. Try using the visible player below or download the file.");
                }}
              >
                <source src={translatedAudio} type="audio/mpeg" />
                <source src={translatedAudio} type="audio/wav" />
                <source src={translatedAudio} type="audio/ogg" />
                Your browser does not support the audio element.
              </audio>
            )}
          </div>
          
          {translatedText && (
            <div className="translated-text-container">
              <h4 className="translated-text-title">Translated Text</h4>
              <div className="translated-text-content">
                {translatedText}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SpeechTranslator; 