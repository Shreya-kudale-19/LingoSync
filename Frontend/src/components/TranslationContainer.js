import React from 'react';
import LanguageContainer from './LanguageContainer';

const TranslationContainer = ({
  sourceLanguage,
  targetLanguage,
  sourceText,
  translatedText,
  setSourceLanguage,
  setTargetLanguage,
  setSourceText,
  handleSwapLanguages,
  handleClearText
}) => {
  return (
    <div className="translation-container">
      <LanguageContainer 
        isSource={true}
        language={sourceLanguage} 
        text={sourceText}
        setLanguage={setSourceLanguage}
        setText={setSourceText}
        handleClearText={handleClearText}
      />
      
      <div className="swap-container">
        <button className="swap-btn" title="Swap languages" onClick={handleSwapLanguages}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 16l-4-4 4-4"></path>
            <path d="M17 8l4 4-4 4"></path>
            <path d="M3 12h18"></path>
          </svg>
        </button>
      </div>
      
      <LanguageContainer 
        isSource={false}
        language={targetLanguage} 
        text={translatedText}
        setLanguage={setTargetLanguage}
        setText={() => {}} // Target text is read-only
        readonly={true}
      />
    </div>
  );
};

export default TranslationContainer;