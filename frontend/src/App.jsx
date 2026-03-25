import React, { useState, useEffect } from 'react';
import UploadView from './views/UploadView';
import ResultsView from './views/ResultsView';
import ProcessingOverlay from './views/ProcessingOverlay';

function App() {
  const [appState, setAppState] = useState('upload'); // 'upload' | 'processing' | 'results'
  const [results, setResults] = useState(null);

  const handleUpload = async (file, confidence) => {
    setAppState('processing');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('confidence', confidence);

    try {
      const apiHost = window.location.hostname;
      const response = await fetch(`http://${apiHost}:8000/api/v1/detect`, {
          method: 'POST',
          body: formData,
      });

      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setResults({
          total: data.total_palms,
          avgConf: data.avg_confidence,
          imageUrl: data.annotated_image_url + "?t=" + new Date().getTime(),
          csvUrl: data.csv_download_url
      });
      setAppState('results');
    } catch (error) {
      console.error("Detection failed:", error);
      alert("Inference failed, check console for details.");
      setAppState('upload');
    }
  };

  return (
    <div className="w-full min-h-screen bg-background text-on-surface font-body antialiased relative">
      {appState === 'upload' && <UploadView onUpload={handleUpload} />}
      
      {/* Both Processing and Results share the ResultsView as a background, but in Processing it's blurred behind an overlay */}
      {(appState === 'processing' || appState === 'results') && (
        <ResultsView 
          isBlurred={appState === 'processing'} 
          onNewScan={() => { setAppState('upload'); setResults(null); }}
          results={results}
        />
      )}

      {appState === 'processing' && <ProcessingOverlay />}
    </div>
  );
}

export default App;
