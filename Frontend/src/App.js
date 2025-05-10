// src/App.js
import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import axios from 'axios';


import Header from './components/Header';
import TranslationContainer from './components/TranslationContainer';
import ActionPanel from './components/ActionPanel';
import FeaturesContainer from './components/FeaturesContainer';
import RecentTranslations from './components/RecentTranslations';
import DocumentUploader from './components/DocumentUploader';
import ImageTranslator from './components/ImageTranslator';
import SpeechTranslator from './components/SpeechTranslator';

import './styles/App.css';

const API_BASE_URL = 'https://8000-whitedevil201-lingosync-kaay4x8p29x.ws-us118.gitpod.io';


function App() {
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [recentTranslations, setRecentTranslations] = useState([]);

  // ─── New: COPY handler ───────────────────────────────────────
  const handleCopy = useCallback((text) => {
    if (!text) return;
    navigator.clipboard.writeText(text)
      .then(() => alert('Copied to clipboard!'))
      .catch((err) => console.error('Copy failed', err));
  }, []);

  // ─── New: READ ALOUD handler ────────────────────────────────
  const handleReadAloud = useCallback((text, langCode) => {
    if (!text) return;
    // map your M2M100 code (e.g. 'hi') to a SpeechSynthesis BCP‑47 code
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = `${langCode}-${langCode.toUpperCase()}`; // e.g. 'hi-HI' or fallback
    window.speechSynthesis.speak(utter);
  }, []);

  const handleTranslate = useCallback(async () => {
    if (sourceText.trim() === '') return;
    setTranslatedText('Translating...');
    try {
      console.log('Sending translation request:', {
        text: sourceText,
        source_lang: sourceLanguage,
        target_lang: targetLanguage
      });
      
      const response = await axios.post(`${API_BASE_URL}/api/translate/translate`, {
        text: sourceText,
        source_lang: sourceLanguage,
        target_lang: targetLanguage
      });
      
      console.log('Translation API response:', response.data);
      
      setTranslatedText(response.data.translated_text);

      const newT = {
        id: Date.now(),
        sourceLang: sourceLanguage.toUpperCase(),
        targetLang: targetLanguage.toUpperCase(),
        text: sourceText,
        timestamp: 'Just now'
      };
      setRecentTranslations(prev => [newT, ...prev.slice(0, 4)]);
    } catch (err) {
      console.error('Translation error:', err);
      setTranslatedText('Error during translation.');
    }
  }, [sourceText, sourceLanguage, targetLanguage]);

  const handleSwapLanguages = useCallback(() => {
    setSourceLanguage(prev => targetLanguage);
    setTargetLanguage(prev => sourceLanguage);
    setSourceText(prev => translatedText);
    setTranslatedText(prev => sourceText);
  }, [sourceLanguage, targetLanguage, translatedText, sourceText]);

  const handleSetSourceText = useCallback((newText) => {
    setSourceText(newText);
  }, []);

  const handleClearText = useCallback(() => {
    setSourceText('');
    setTranslatedText('');
  }, []);

  const handleFileUpload = useCallback(async (file) => {
    const form = new FormData();
    form.append('file', file);
    form.append('source_lang', sourceLanguage);
    form.append('target_lang', targetLanguage);
  
    try {
      const res = await axios.post(`${API_BASE_URL}/api/documents/upload`, form);
      setTranslatedText(res.data.translated_text || 'Uploaded file translated.');
    } catch (err) {
      console.error('Upload error:', err);
      setTranslatedText('Error during file upload.');
    }
  }, [sourceLanguage, targetLanguage]);

  const HomeComponent = useCallback(() => (
    <>
      <TranslationContainer
        sourceLanguage={sourceLanguage}
        targetLanguage={targetLanguage}
        sourceText={sourceText}
        translatedText={translatedText}
        setSourceLanguage={setSourceLanguage}
        setTargetLanguage={setTargetLanguage}
        setSourceText={handleSetSourceText}
        handleSwapLanguages={handleSwapLanguages}
        handleClearText={handleClearText}
        onCopy={handleCopy}
        onReadAloud={handleReadAloud}
      />
      <ActionPanel
        onTranslate={handleTranslate}
        onFileUpload={handleFileUpload}
      />
      <FeaturesContainer />
      <RecentTranslations recentTranslations={recentTranslations} />
    </>
  ), [
    sourceLanguage, 
    targetLanguage, 
    sourceText, 
    translatedText, 
    recentTranslations, 
    handleSetSourceText, 
    handleSwapLanguages, 
    handleTranslate, 
    handleFileUpload, 
    handleClearText, 
    handleCopy, 
    handleReadAloud
  ]);

  return (
    <Router>
      <div className="container">
        <Header />
        <main>
          <Switch>
            <Route
              path="/"
              exact
              component={HomeComponent}
            />

            <Route path="/documents" component={DocumentUploader} />
            <Route path="/images" component={ImageTranslator} />
            <Route path="/speech" component={SpeechTranslator} />
          </Switch>
        </main>
      </div>
    </Router>
  );
}

export default App;
