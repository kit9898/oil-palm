import React, { useState, useEffect } from 'react';
import UploadView from './views/UploadView';
import ResultsView from './views/ResultsView';
import ProcessingOverlay from './views/ProcessingOverlay';

function App() {
  const [appState, setAppState] = useState('upload'); // 'upload' | 'processing' | 'results'

  const handleUpload = () => {
    setAppState('processing');
  };

  useEffect(() => {
    if (appState === 'processing') {
      // Simulate a processing delay of 4 seconds
      const timer = setTimeout(() => {
        setAppState('results');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [appState]);

  return (
    <div className="w-full min-h-screen bg-background text-on-surface font-body antialiased relative">
      {appState === 'upload' && <UploadView onUpload={handleUpload} />}
      
      {/* Both Processing and Results share the ResultsView as a background, but in Processing it's blurred behind an overlay */}
      {(appState === 'processing' || appState === 'results') && (
        <ResultsView isBlurred={appState === 'processing'} onNewScan={() => setAppState('upload')} />
      )}

      {appState === 'processing' && <ProcessingOverlay />}
    </div>
  );
}

export default App;
