import React, { useState, useRef } from 'react';
import logo from '../assets/logo.png';

export default function UploadView({ onUpload }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [confidence, setConfidence] = useState(0.5);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onUpload(selectedFile, confidence);
    }
  };
  return (
    <div className="bg-surface font-body text-on-surface antialiased overflow-hidden min-h-screen relative">
      {/* Background Pattern Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" style={{
        backgroundColor: '#f9f9fb',
        backgroundImage: 'radial-gradient(#0058bc 0.5px, transparent 0.5px), radial-gradient(#0058bc 0.5px, #f9f9fb 0.5px)',
        backgroundSize: '40px 40px',
        backgroundPosition: '0 0, 20px 20px'
      }}></div>

      {/* Top Navigation Bar */}
      <header className="w-full top-0 sticky flex justify-between items-center px-8 py-4 bg-[#f9f9fb] z-50">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="h-16 w-auto object-contain" />
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a className="text-[#414755] hover:bg-[#e8e8ea] transition-colors px-4 py-2 rounded-full text-sm font-medium" href="#">Dashboard</a>
          <a className="text-[#414755] hover:bg-[#e8e8ea] transition-colors px-4 py-2 rounded-full text-sm font-medium" href="#">Analytics</a>
          <a className="text-[#414755] hover:bg-[#e8e8ea] transition-colors px-4 py-2 rounded-full text-sm font-medium" href="#">Reports</a>
        </nav>
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined p-2 text-on-surface-variant hover:bg-[#e8e8ea] rounded-full transition-colors flex">notifications</button>
          <button className="material-symbols-outlined p-2 text-on-surface-variant hover:bg-[#e8e8ea] rounded-full transition-colors flex">account_circle</button>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="relative flex flex-col items-center justify-center min-h-[calc(100vh-140px)] px-6 z-10">
        {/* Welcome Hero Section */}
        <div className="max-w-4xl w-full text-center space-y-12 mb-12">
          <div className="space-y-4">
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold tracking-widest uppercase mb-4">
              Precision Agriculture AI
            </span>
            <img
              src={logo}
              alt="Project Canopy"
              className="mx-auto w-64 sm:w-80 md:w-[30rem] lg:w-[36rem] h-auto"
            />
            <p className="text-on-surface-variant text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Advanced palm health detection through structural data architecture and computer vision.
            </p>
          </div>

          {/* Upload Bento Container */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* Primary Action Card */}
            <div
              className="md:col-span-8 bg-surface-container-lowest rounded-lg p-12 border border-outline-variant/15 flex flex-col items-center justify-center space-y-6 relative group overflow-hidden"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-5xl flex">cloud_upload</span>
              </div>
              <div className="relative z-10 space-y-3 text-center">
                <h2 className="text-2xl font-bold tracking-tight">Ready for Detection?</h2>
                <p className="text-on-surface-variant text-sm">Drag and drop high-resolution imagery here or browse your local directory.</p>
                {selectedFile && <p className="text-primary font-semibold mt-2">Selected: {selectedFile.name}</p>}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />

              <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-sm mt-4">
                <div className="w-full">
                  <div className="flex justify-between text-xs font-bold text-on-surface-variant mb-2">
                    <span>AI Confidence Threshold</span>
                    <span className="text-primary">{Math.round(confidence * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1" max="1.0" step="0.05"
                    value={confidence}
                    onChange={(e) => setConfidence(parseFloat(e.target.value))}
                    className="w-full accent-primary h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="flex gap-4 w-full">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-4 bg-surface-container-high text-on-surface rounded-full font-bold text-sm hover:bg-surface-container-highest transition-colors shadow-sm"
                  >
                    Select File
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedFile}
                    className={`flex-1 py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-full font-bold text-sm transition-all duration-300 ${!selectedFile ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:shadow-[0_15px_30px_rgba(0,88,188,0.2)] active:scale-95'}`}
                  >
                    Run Detection
                  </button>
                </div>
              </div>
              <div className="relative z-10 flex gap-4 text-xs font-semibold text-on-surface-variant/60 uppercase tracking-widest pt-4">
                <span>JPG</span>
                <span>PNG</span>
                <span>TIFF</span>
                <span>RAW</span>
              </div>
            </div>

            {/* Secondary Info Stack */}
            <div className="md:col-span-4 flex flex-col gap-6">
              <div className="flex-1 bg-surface-container-low rounded-lg p-6 flex flex-col justify-between text-left">
                <span className="material-symbols-outlined text-primary flex">biotech</span>
                <div>
                  <p className="text-on-surface font-bold">Real-time Analysis</p>
                  <p className="text-on-surface-variant text-sm mt-1 leading-snug">Instant identification of Ganoderma and pest stress.</p>
                </div>
              </div>
              <div className="flex-1 bg-surface-container-low rounded-lg p-6 flex flex-col justify-between text-left">
                <span className="material-symbols-outlined text-primary flex">query_stats</span>
                <div>
                  <p className="text-on-surface font-bold">Plantation Insights</p>
                  <p className="text-on-surface-variant text-sm mt-1 leading-snug">Connect historical data for predictive reporting.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Plant Section */}
        <div className="absolute -bottom-24 -right-12 md:bottom-12 md:right-12 w-64 md:w-96 opacity-20 md:opacity-40 select-none pointer-events-none transform rotate-12">
          <img alt="Plantation abstract view" className="w-full h-auto grayscale brightness-50" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5MyenuMqVCeO3O-6GZjp2mFF0tRKIZH7OmcOUAzZ-oV9TETyQVtlmHErYJMWmDrEgbKZTcirI5Hrd43JqCmQ1zoVCPeHgFEkeSedk9LqOCeOHK0nzCSzkemzVOpWgUMcj6OYc2tdha3blJjASVWpsCNv6rfyxuot7eHCVMTEZ87f_XYkel83UQfdPpbueHIXhm3R1aBaOPve4dt4i-6uBbwKOXnKJjYImHrK2UleI_sdUG82NxweBLi0cYbI6lAR5BOBhHzdXZ-O2" />
        </div>
      </main>

      {/* Footer Area */}
      <footer className="w-full py-8 px-12 flex flex-col md:flex-row justify-between items-center gap-4 text-on-surface-variant/60 text-xs border-none z-10 relative">
        <div className="flex items-center gap-6">
          <span>© 2024 Vantatech. All rights reserved.</span>
          <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
          <a className="hover:text-primary transition-colors" href="#">Architecture Terms</a>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="font-medium tracking-tight">System Operational: v2.4 Enterprise</span>
        </div>
      </footer>
    </div>
  );
}
