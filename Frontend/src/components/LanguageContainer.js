import React, { useState, useEffect, useRef } from 'react';

const LanguageContainer = ({ 
  isSource, 
  language, 
  text = "",
  setLanguage, 
  setText = () => {}, 
  handleClearText = () => {},
  readonly = false,
  showTextarea = true
}) => {
  const [localText, setLocalText] = useState(text);
  const isComposing = useRef(false);
  const textareaRef = useRef(null);

  // Sync with parent text changes
  useEffect(() => {
    if (!isComposing.current) {
      setLocalText(text);
      if (textareaRef.current) {
        textareaRef.current.value = text;
      }
    }
  }, [text]);

  const handleChange = (e) => {
    setLocalText(e.target.value);
    if (!isComposing.current) {
      setText(e.target.value);
    }
  };

  console.log('LanguageContainer re-render. isSource:', isSource, 'text:', text);

  const languages = [
    { value: 'afr_Latn', label: 'Afrikaans' },
    { value: 'amh_Ethi', label: 'Amharic' },
    { value: 'ara_Arab', label: 'Arabic' },
    // Asturian not in NLLB
    { value: 'azj_Latn', label: 'Azerbaijani' },
    { value: 'bel_Cyrl', label: 'Belarusian' },
    { value: 'bem_Latn', label: 'Bemba' },
    { value: 'bul_Cyrl', label: 'Bulgarian' },
    { value: 'ben_Beng', label: 'Bengali' },
    // Breton not in NLLB
    { value: 'bos_Latn', label: 'Bosnian' },
    { value: 'cat_Latn', label: 'Catalan' },
    { value: 'ceb_Latn', label: 'Cebuano' },
    { value: 'ckb_Arab', label: 'Sorani Kurdish' },
    { value: 'ces_Latn', label: 'Czech' },
    { value: 'cym_Latn', label: 'Welsh' },
    { value: 'dan_Latn', label: 'Danish' },
    { value: 'deu_Latn', label: 'German' },
    { value: 'div_Thaa', label: 'Dhivehi' },
    { value: 'ell_Grek', label: 'Greek' },
    { value: 'eng_Latn', label: 'English' },
    { value: 'spa_Latn', label: 'Spanish' },
    { value: 'est_Latn', label: 'Estonian' },
    { value: 'eus_Latn', label: 'Basque' },
    { value: 'pes_Arab', label: 'Persian' },
    { value: 'fin_Latn', label: 'Finnish' },
    // Faroese not in NLLB
    { value: 'fra_Latn', label: 'French' },
    { value: 'glg_Latn', label: 'Galician' },
    { value: 'guj_Gujr', label: 'Gujarati' },
    { value: 'hau_Latn', label: 'Hausa' },
    // Hawaiian not in NLLB
    { value: 'heb_Hebr', label: 'Hebrew' },
    { value: 'hin_Deva', label: 'Hindi' },
    { value: 'hrv_Latn', label: 'Croatian' },
    { value: 'hat_Latn', label: 'Haitian Creole' },
    { value: 'hun_Latn', label: 'Hungarian' },
    { value: 'hye_Armn', label: 'Armenian' },
    { value: 'ind_Latn', label: 'Indonesian' },
    { value: 'ibo_Latn', label: 'Igbo' },
    // Ilocano not in NLLB
    { value: 'isl_Latn', label: 'Icelandic' },
    { value: 'ita_Latn', label: 'Italian' },
    { value: 'jpn_Jpan', label: 'Japanese' },
    { value: 'jav_Latn', label: 'Javanese' },
    { value: 'kat_Geor', label: 'Georgian' },
    // Kabyle not in NLLB
    // Kamba not in NLLB
    { value: 'kaz_Cyrl', label: 'Kazakh' },
    // Greenlandic not in NLLB
    { value: 'khm_Khmr', label: 'Khmer' },
    { value: 'kan_Knda', label: 'Kannada' },
    { value: 'kor_Hang', label: 'Korean' },
    { value: 'kmr_Latn', label: 'Kurmanji Kurdish' },
    { value: 'kir_Cyrl', label: 'Kyrgyz' },
    // Latin not in NLLB
    { value: 'ltz_Latn', label: 'Luxembourgish' },
    // Luganda not in NLLB
    { value: 'lao_Laoo', label: 'Lao' },
    { value: 'lit_Latn', label: 'Lithuanian' },
    { value: 'lvs_Latn', label: 'Latvian' },
    // Maithili not in NLLB
    { value: 'plt_Latn', label: 'Malagasy' },
    { value: 'mkd_Cyrl', label: 'Macedonian' },
    { value: 'mal_Mlym', label: 'Malayalam' },
    { value: 'khk_Cyrl', label: 'Mongolian' },
    { value: 'mar_Deva', label: 'Marathi' },
    { value: 'zsm_Latn', label: 'Malay' },
    { value: 'mlt_Latn', label: 'Maltese' },
    { value: 'mya_Mymr', label: 'Burmese' },
    { value: 'npi_Deva', label: 'Nepali' },
    { value: 'nld_Latn', label: 'Dutch' },
    { value: 'nob_Latn', label: 'Norwegian' },
    // Northern Sotho not in NLLB
    // Nyanja not in NLLB
    // Oromo not in NLLB
    { value: 'ory_Orya', label: 'Oriya' },
    { value: 'pan_Guru', label: 'Punjabi' },
    { value: 'pol_Latn', label: 'Polish' },
    { value: 'pbt_Arab', label: 'Pashto' },
    { value: 'por_Latn', label: 'Portuguese' },
    // Quechua not in NLLB
    { value: 'ron_Latn', label: 'Romanian' },
    { value: 'rus_Cyrl', label: 'Russian' },
    // Kinyarwanda not in NLLB
    { value: 'snd_Arab', label: 'Sindhi' },
    { value: 'sin_Sinh', label: 'Sinhala' },
    { value: 'slk_Latn', label: 'Slovak' },
    { value: 'slv_Latn', label: 'Slovenian' },
    // Samoan not in NLLB
    { value: 'sna_Latn', label: 'Shona' },
    { value: 'som_Latn', label: 'Somali' },
    { value: 'sqi_Latn', label: 'Albanian' },
    { value: 'srp_Cyrl', label: 'Serbian' },
    // Swati not in NLLB
    // Southern Sotho not in NLLB
    { value: 'sun_Latn', label: 'Sundanese' },
    { value: 'swe_Latn', label: 'Swedish' },
    { value: 'swh_Latn', label: 'Swahili' },
    { value: 'tam_Taml', label: 'Tamil' },
    { value: 'tel_Telu', label: 'Telugu' },
    { value: 'tgk_Cyrl', label: 'Tajik' },
    { value: 'tha_Thai', label: 'Thai' },
    { value: 'tir_Ethi', label: 'Tigrinya' },
    // Turkmen not in NLLB
    { value: 'tgl_Latn', label: 'Tagalog' },
    // Tswana not in NLLB
    { value: 'tur_Latn', label: 'Turkish' },
    // Tsonga not in NLLB
    { value: 'ukr_Cyrl', label: 'Ukrainian' },
    { value: 'urd_Arab', label: 'Urdu' },
    { value: 'uzn_Latn', label: 'Uzbek' },
    { value: 'vie_Latn', label: 'Vietnamese' },
    // Wolof not in NLLB
    { value: 'xho_Latn', label: 'Xhosa' },
    { value: 'ydd_Hebr', label: 'Yiddish' },
    { value: 'yor_Latn', label: 'Yoruba' },
    { value: 'zho_Hans', label: 'Chinese' },
    { value: 'zul_Latn', label: 'Zulu' }
  ].filter(Boolean); // Remove undefined entries

  const sortedLanguages = [...languages].sort((a, b) => {
    if (a.value === language) return -1;
    if (b.value === language) return 1;
    return 0;
  });

  const handleCopyText = () => {
    navigator.clipboard.writeText(text)
      .then(() => alert('Text copied!'))
      .catch(() => alert('Failed to copy text.'));
  };

  const detectLanguage = () => {
    alert("Auto-detect is currently not implemented. Connect to backend to enable.");
    // Example for future integration:
    // fetch('/detect-language', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ text })
    // })
    //   .then(res => res.json())
    //   .then(data => setLanguage(data.language))
    //   .catch(err => console.error(err));
  };

  return (
    <div className="language-container">
      <div className="language-header">
        <select 
          className="language-select" 
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          {sortedLanguages.map(lang => (
            <option key={lang.value} value={lang.value}>{lang.label}</option>
          ))}
        </select>
        
        {isSource ? (
          <button className="action-btn" title="Auto detect language" onClick={detectLanguage}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </button>
        ) : (
          <button className="action-btn" title="Copy all" onClick={handleCopyText}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        )}
      </div>
      
      {showTextarea && (
        <div className="textarea-container">
          <textarea
            ref={textareaRef}
            className="textarea"
            placeholder={isSource ? "Enter text to translate..." : "Translation will appear here..."}
            value={localText}
            onChange={handleChange}
            onCompositionStart={() => (isComposing.current = true)}
            onCompositionEnd={(e) => {
              isComposing.current = false;
              setText(e.target.value);
            }}
            readOnly={readonly}
          />
          {isSource && localText && (
            <button className="clear-btn" onClick={handleClearText}>×</button>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(LanguageContainer);
