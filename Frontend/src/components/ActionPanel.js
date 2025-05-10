import React, { useRef } from 'react';

const ActionPanel = ({ onTranslate, onFileUpload }) => {
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click(); // open file selector
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileUpload(file); // send file to parent component
    }
  };

  const handleFileUpload = (file) => {
    onFileUpload(file);
    // If this immediately triggers a translation, it could interfere
  };

  return (
    <div className="action-panel">
      <div className="translation-options">
        <button className="secondary-btn" onClick={handleButtonClick}>
          {/* Upload Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="21" x2="9" y2="9"></line>
          </svg>
          Upload Document
        </button>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.mp3,.wav"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        
        <button className="secondary-btn">
          {/* Dictionary Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          Dictionary
        </button>
      </div>
      <button className="primary-btn" onClick={onTranslate}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polygon points="10 8 16 12 10 16 10 8"></polygon>
        </svg>
        Translate
      </button>
    </div>
  );
};

export default ActionPanel;

// import React from 'react';

// const ActionPanel = ({ onTranslate }) => {
//   return (
//     <div className="action-panel">
//       <div className="translation-options">
//         <button className="secondary-btn">
//           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//             <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
//             <line x1="3" y1="9" x2="21" y2="9"></line>
//             <line x1="9" y1="21" x2="9" y2="9"></line>
//           </svg>
//           Upload Document
//         </button>
//         <button className="secondary-btn">
//           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//             <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
//             <polyline points="14 2 14 8 20 8"></polyline>
//             <line x1="16" y1="13" x2="8" y2="13"></line>
//             <line x1="16" y1="17" x2="8" y2="17"></line>
//             <polyline points="10 9 9 9 8 9"></polyline>
//           </svg>
//           Dictionary
//         </button>
//       </div>
//       <button className="primary-btn" onClick={onTranslate}>
//         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//           <circle cx="12" cy="12" r="10"></circle>
//           <polygon points="10 8 16 12 10 16 10 8"></polygon>
//         </svg>
//         Translate
//       </button>
//     </div>
//   );
// };

// export default ActionPanel;