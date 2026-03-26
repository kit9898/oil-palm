import React, { useRef, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import DashboardView from './views/DashboardView';
import ResultsView from './views/ResultsView';
import ProcessingOverlay from './views/ProcessingOverlay';

function App() {
  const navigate = useNavigate();
  const [appState, setAppState] = useState('upload'); // 'upload' | 'processing' | 'results'
  const [results, setResults] = useState(null);
  const detectInFlightRef = useRef(false);

  const toProxyPath = (value) => {
    if (!value) return '';

    try {
      const parsed = new URL(value, window.location.origin);
      return parsed.pathname + parsed.search + parsed.hash;
    } catch {
      return value;
    }
  };

  const withCacheBuster = (value) => {
    const proxyPath = toProxyPath(value);
    if (!proxyPath) return '';

    const parsed = new URL(proxyPath, window.location.origin);
    parsed.searchParams.set('t', Date.now().toString());
    return parsed.pathname + parsed.search + parsed.hash;
  };

  const getDetectEndpoints = () => {
    const host = window.location.hostname;
    const endpoints = ['/api/v1/detect'];

    const directHost = 'http://' + host + ':8000/api/v1/detect';
    if (!endpoints.includes(directHost)) {
      endpoints.push(directHost);
    }

    if (host !== '127.0.0.1' && host !== 'localhost') {
      endpoints.push('http://127.0.0.1:8000/api/v1/detect');
    }

    return endpoints;
  };

  const handleQuickScan = async (file, confidence) => {
    if (detectInFlightRef.current) {
      console.warn('Detect request skipped: another detection task is already running.');
      return;
    }

    detectInFlightRef.current = true;
    setAppState('processing');
    navigate('/view');

    try {
      const endpoints = getDetectEndpoints();
      let data = null;
      let lastError = null;

      for (const endpoint of endpoints) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('confidence', String(confidence));

          const response = await fetch(endpoint, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('HTTP error ' + response.status + ' from ' + endpoint);
          }

          data = await response.json();
          break;
        } catch (endpointError) {
          console.warn('Detect request failed at', endpoint, endpointError);
          lastError = endpointError;
        }
      }

      if (!data) {
        throw lastError || new Error('All detect endpoints failed.');
      }

      setResults({
        total: data.total_palms,
        avgConf: data.avg_confidence,
        imageUrl: withCacheBuster(data.annotated_image_url),
        csvUrl: toProxyPath(data.csv_download_url),
      });
      setAppState('results');
      navigate('/result');
    } catch (error) {
      console.error('Detection failed:', error);
      alert('Inference failed, check console for details.');
      setAppState('upload');
      setResults(null);
      navigate('/dashboard');
    } finally {
      detectInFlightRef.current = false;
    }
  };

  const handleNewScan = () => {
    setAppState('upload');
    setResults(null);
    navigate('/dashboard');
  };

  const viewElement =
    appState === 'processing' ? (
      <>
        <ResultsView isBlurred onNewScan={handleNewScan} results={results} />
        <ProcessingOverlay />
      </>
    ) : appState === 'results' ? (
      <Navigate to="/result" replace />
    ) : (
      <Navigate to="/dashboard" replace />
    );

  const resultElement =
    appState === 'results' ? (
      <ResultsView isBlurred={false} onNewScan={handleNewScan} results={results} />
    ) : appState === 'processing' ? (
      <Navigate to="/view" replace />
    ) : (
      <Navigate to="/dashboard" replace />
    );

  return (
    <div className="w-full min-h-screen bg-background text-on-surface font-body antialiased relative">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardView onUpload={handleQuickScan} />} />
        <Route path="/view" element={viewElement} />
        <Route path="/result" element={resultElement} />
        <Route
          path="*"
          element={<div className="p-12 text-center text-2xl font-bold">404 - Page Not Found</div>}
        />
      </Routes>
    </div>
  );
}

export default App;
