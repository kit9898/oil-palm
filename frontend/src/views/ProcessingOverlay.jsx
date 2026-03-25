import React, { useEffect, useState } from 'react';

export default function ProcessingOverlay() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress smoothly over ~4 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) {
          clearInterval(interval);
          return 98;
        }
        return prev + 2; // Rough increment to look like reading
      });
    }, 80);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-surface/40 backdrop-blur-3xl">
      <div className="max-w-2xl w-full flex flex-col items-center">
        {/* Glassmorphism Container */}
        <div className="w-full p-12 bg-surface-container-lowest/80 backdrop-blur-md rounded-xl shadow-[0_20px_40px_rgba(0,88,188,0.04)] flex flex-col items-center text-center relative overflow-hidden">
          {/* Atmospheric Background Accent */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary-container/10 rounded-full blur-3xl"></div>
          
          {/* Sophisticated Circular Loader Cluster */}
          <div className="relative w-32 h-32 mb-10">
            {/* Outer Spinner */}
            <div className="absolute inset-0 border-4 border-surface-container-high rounded-full"></div>
            <div className="absolute inset-0 loader-ring border-[4px]" style={{ borderTopColor: '#0058bc' }}></div>
            
            {/* Inner Static Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-4xl flex" style={{ fontVariationSettings: "'FILL' 1" }}>biotech</span>
            </div>
            
            {/* Pulsing Glow */}
            <div className="absolute inset-0 bg-primary/10 rounded-full animate-subtle-pulse"></div>
          </div>
          
          {/* Textual Identity */}
          <div className="space-y-3 mb-12 relative">
            <p className="text-on-surface-variant text-[0.75rem] font-bold tracking-[0.1em] uppercase">Plantation AI Analysis</p>
            <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight">Running Detection Engine...</h1>
            <p className="text-on-surface-variant text-lg opacity-80">Analyzing spatial data...</p>
          </div>
          
          {/* Progress Section */}
          <div className="w-full max-w-md space-y-6 relative">
            {/* Premium Progress Bar */}
            <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary-container transition-all duration-200 ease-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            {/* Metadata Grid */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="flex flex-col gap-1 items-center">
                <span className="text-[0.65rem] font-bold text-on-surface-variant/60 uppercase tracking-widest">Confidence</span>
                <span className="text-sm font-semibold text-primary">94.2%</span>
              </div>
              <div className="flex flex-col gap-1 items-center border-x border-outline-variant/20">
                <span className="text-[0.65rem] font-bold text-on-surface-variant/60 uppercase tracking-widest">Resolution</span>
                <span className="text-sm font-semibold text-primary">4K NADIR</span>
              </div>
              <div className="flex flex-col gap-1 items-center">
                <span className="text-[0.65rem] font-bold text-on-surface-variant/60 uppercase tracking-widest">Telemetry</span>
                <span className="text-sm font-semibold text-primary">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contextual Footer Info */}
        <div className="mt-8 flex items-center gap-3 px-6 py-3 bg-surface-container-high/50 backdrop-blur-sm rounded-full border border-outline-variant/10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-xs font-medium text-on-surface-variant">System encrypting architectural data layer 2...</span>
        </div>
      </div>
    </div>
  );
}
