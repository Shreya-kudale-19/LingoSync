import React from 'react';

const RecentTranslations = ({ recentTranslations }) => {
  return (
    <div className="recent-translations">
      <div className="section-header">
        <h2>Recent Translations</h2>
        <button className="secondary-btn">See All</button>
      </div>

      <div className="translation-cards">
        {recentTranslations.length === 0 ? (
          <p>No recent translations yet.</p>
        ) : (
          recentTranslations.map(translation => (
            <div className="translation-card" key={translation.id}>
              <div className="card-header">
                <div className="language-badge">{translation.sourceLang}</div>
                <div>→</div>
                <div className="language-badge">{translation.targetLang}</div>
              </div>
              <div className="card-body">
                <p className="translation-text">{translation.text}</p>
              </div>
              <div className="card-footer">
                <span>{translation.timestamp}</span>
                <button className="action-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1"></circle>
                    <circle cx="19" cy="12" r="1"></circle>
                    <circle cx="5" cy="12" r="1"></circle>
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentTranslations;


// import React from 'react';

// const RecentTranslations = () => {
//   const recentTranslations = [
//     {
//       id: 1,
//       sourceLang: 'EN',
//       targetLang: 'ES',
//       text: 'The meeting will be held tomorrow at 3 PM in the conference room. Please bring your reports and be prepared to discuss the quarterly results.',
//       timestamp: '2 mins ago'
//     },
//     {
//       id: 2,
//       sourceLang: 'FR',
//       targetLang: 'EN',
//       text: 'Je voudrais réserver une table pour deux personnes ce soir à 20 heures. Est-ce possible?',
//       timestamp: '1 hour ago'
//     },
//     {
//       id: 3,
//       sourceLang: 'DE',
//       targetLang: 'ZH',
//       text: 'Ich freue mich auf unsere Zusammenarbeit und bin zuversichtlich, dass wir gemeinsam großartige Ergebnisse erzielen werden.',
//       timestamp: 'Yesterday'
//     },
//     {
//       id: 4,
//       sourceLang: 'JA',
//       targetLang: 'EN',
//       text: '来週の会議に出席できませんので、申し訳ありませんが、議事録をお送りいただけますか？',
//       timestamp: '2 days ago'
//     }
//   ];

//   return (
//     <div className="recent-translations">
//       <div className="section-header">
//         <h2>Recent Translations</h2>
//         <button className="secondary-btn">See All</button>
//       </div>
      
//       <div className="translation-cards">
//         {recentTranslations.map(translation => (
//           <div className="translation-card" key={translation.id}>
//             <div className="card-header">
//               <div className="language-badge">{translation.sourceLang}</div>
//               <div>→</div>
//               <div className="language-badge">{translation.targetLang}</div>
//             </div>
//             <div className="card-body">
//               <p className="translation-text">{translation.text}</p>
//             </div>
//             <div className="card-footer">
//               <span>{translation.timestamp}</span>
//               <button className="action-btn">
//                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                   <circle cx="12" cy="12" r="1"></circle>
//                   <circle cx="19" cy="12" r="1"></circle>
//                   <circle cx="5" cy="12" r="1"></circle>
//                 </svg>
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default RecentTranslations;