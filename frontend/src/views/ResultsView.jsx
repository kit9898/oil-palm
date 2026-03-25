import React from 'react';
import { Link } from 'react-router-dom';

export default function ResultsView({ isBlurred, onNewScan, results }) {
  // If isBlurred is true, we render it but heavily blurred and darker, just like processing/code.html
  const containerClasses = `flex flex-col h-screen overflow-hidden ${isBlurred ? 'blur-xl brightness-75 scale-105 pointer-events-none fixed inset-0 z-0' : 'bg-background text-on-surface antialiased'
    }`;

  return (
    <div className={containerClasses}>
      {/* Top Navigation Anchor */}
      <header className="w-full top-0 sticky bg-[#f9f9fb] dark:bg-slate-950 flex justify-between items-center px-8 py-4 z-50 flex-shrink-0">
        <div className="flex items-center gap-8">
          <img src="/src/assets/images.png" alt="Logo" className="h-16 w-auto object-contain" />
          <nav className="hidden md:flex gap-6">
            <Link className="text-[#0058bc] font-semibold text-sm transition-colors" to="/dashboard">Dashboard</Link>
            <Link className="text-[#414755] dark:text-slate-400 text-sm hover:bg-[#e8e8ea] px-3 py-1 rounded-full transition-colors" to="/view">View</Link>
            <Link className="text-[#414755] dark:text-slate-400 text-sm hover:bg-[#e8e8ea] px-3 py-1 rounded-full transition-colors" to="/result">Result</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-[#e8e8ea] transition-colors active:scale-95 duration-200">
            <span className="material-symbols-outlined text-on-surface-variant flex">notifications</span>
          </button>
          <button className="p-2 rounded-full hover:bg-[#e8e8ea] transition-colors active:scale-95 duration-200">
            <span className="material-symbols-outlined text-on-surface-variant flex">account_circle</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation Anchor */}
        <aside className="hidden md:flex flex-col h-full w-64 bg-[#e8e8ea] dark:bg-slate-900 border-none py-6 px-4 shrink-0 overflow-y-auto hide-scrollbar">
          <div className="mb-8 px-2">
            <h2 className="text-lg font-black text-[#1a1c1d] dark:text-slate-100">Plantation AI</h2>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant opacity-60">Premium B2B v2.4</p>
          </div>
          <nav className="space-y-1 flex-1">
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#0058bc] dark:text-blue-400 font-bold border-r-2 border-[#0058bc] bg-gradient-to-r from-transparent to-[#f3f3f5] transition-all duration-300" to="/dashboard">
              <span className="material-symbols-outlined">grid_view</span>
              <span className="text-sm">Dashboard</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#414755] dark:text-slate-400 hover:text-[#1a1c1d] hover:bg-[#f3f3f5] transition-all" to="/view">
              <span className="material-symbols-outlined">biotech</span>
              <span className="text-sm">View</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#414755] dark:text-slate-400 hover:text-[#1a1c1d] hover:bg-[#f3f3f5] transition-all" to="/result">
              <span className="material-symbols-outlined">query_stats</span>
              <span className="text-sm">Result</span>
            </Link>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#414755] dark:text-slate-400 hover:text-[#1a1c1d] hover:bg-[#f3f3f5] transition-all" href="#">
              <span className="material-symbols-outlined">potted_plant</span>
              <span className="text-sm">Inventory</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#414755] dark:text-slate-400 hover:text-[#1a1c1d] hover:bg-[#f3f3f5] transition-all" href="#">
              <span className="material-symbols-outlined">description</span>
              <span className="text-sm">Reports</span>
            </a>
          </nav>
          <div className="mt-auto pt-6 border-t border-outline-variant/20 space-y-1">
            <button className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-3 rounded-full font-semibold text-sm mb-4 shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all active:scale-95">
              New Analysis
            </button>
            <a className="flex items-center gap-3 px-4 py-2 rounded-lg text-[#414755] hover:bg-[#f3f3f5] transition-all" href="#">
              <span className="material-symbols-outlined">settings</span>
              <span className="text-sm">Settings</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-2 rounded-lg text-[#414755] hover:bg-[#f3f3f5] transition-all" href="#">
              <span className="material-symbols-outlined">help_outline</span>
              <span className="text-sm">Support</span>
            </a>
          </div>
        </aside>

        {/* Main Content Canvas */}
        <main className="flex-1 px-8 py-8 w-full mx-auto overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div className="space-y-2">
                <span className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase">Analysis Results</span>
                <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-on-surface">Interactive Detection Gallery</h1>
              </div>
              {/* Count Indicator */}
              <div className="flex items-center bg-surface-container-low rounded-2xl p-4 gap-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase opacity-60">Status</span>
                  <span className="text-xl font-headline font-semibold text-on-surface">{results ? "Analysis Complete" : "Waiting for scan"}</span>
                </div>
                <div className="h-10 w-[1px] bg-outline-variant/30"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-tertiary uppercase">Total Detected</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-headline font-bold text-primary">{results ? results.total : "--"}</span>
                    <span className="text-sm text-on-surface-variant">Palms</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Grid - Main Focus Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Main Photo View */}
              <div className="lg:col-span-8 group relative rounded-xl overflow-hidden bg-surface-container-lowest shadow-2xl shadow-primary/5 min-h-[400px]">
                <div className="aspect-[16/10] w-full bg-surface-variant relative overflow-hidden flex items-center justify-center bg-black/5">
                  <img className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" alt="Detection result" src={results ? results.imageUrl : "https://lh3.googleusercontent.com/aida-public/AB6AXuAjvBmVoU7f7S0UTHwVy6Xbv5ZyWZNVg-uHOsQ5nZGZnyLlaChqCv1lkNqtH5gwxefLwXIn9c6L-qv7SRbKvURzsjUbKMNcz0DYzUi1dkGakceCOpA-ISaDu_nNJN4EG1RMqIqE3ujS-BNhlQWr3ihUAmY_SDDo1OcpOkB18io8HZ3nc3LsD0WT-f2kRxccU1_kZgEyPgaio8Ui_NiHTa0Esc_OuG2yPASTJWZQh4GbAiadsBX-JYP7--X6u4_dhzSvt49dxWO0F_84"} />
                  {/* AI Overlay UI Elements */}
                  <div className="absolute inset-0 bg-gradient-to-t from-on-surface/40 to-transparent pointer-events-none"></div>
                  {/* Floating Data Labels */}
                  <div className="absolute top-6 left-6 flex flex-col gap-3">
                    <div className="bg-surface-container-lowest/80 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-white/20">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                      <span className="text-xs font-bold text-on-surface">Live Detection: Active</span>
                    </div>
                    <div className="bg-primary/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold w-max">
                      Photo 1 of 12
                    </div>
                  </div>
                  {/* Action Controls Overlay */}
                  <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center">
                    <div className="flex gap-2">
                      <button className="bg-surface-container-lowest/90 backdrop-blur-md p-3 rounded-full hover:bg-white transition-colors flex">
                        <span className="material-symbols-outlined text-primary">zoom_in</span>
                      </button>
                      <button className="bg-surface-container-lowest/90 backdrop-blur-md p-3 rounded-full hover:bg-white transition-colors flex">
                        <span className="material-symbols-outlined text-primary">layers</span>
                      </button>
                    </div>
                    {results && results.csvUrl && (
                      <a href={results.csvUrl} download="result.csv" className="bg-white text-primary px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 shadow-xl hover:bg-gray-50 transition-colors">
                        <span className="material-symbols-outlined">download</span>
                        Export Detail
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Analysis Sidebar */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="bg-surface-container-lowest rounded-xl p-6 border-none shadow-sm">
                  <h3 className="text-lg font-bold mb-4">Metadata Analysis</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-surface-container-low">
                      <span className="text-sm text-on-surface-variant">Timestamp</span>
                      <span className="text-sm font-medium">Oct 24, 2023 14:22</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-surface-container-low">
                      <span className="text-sm text-on-surface-variant">Coordinates</span>
                      <span className="text-sm font-medium">2.3522° N, 102.2408° E</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-surface-container-low">
                      <span className="text-sm text-on-surface-variant">AI Confidence</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                          <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${results ? results.avgConf * 100 : 0}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-primary">{results ? (results.avgConf * 100).toFixed(1) : "0.0"}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-low rounded-xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">Quick Insights</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface-container-lowest p-4 rounded-lg">
                      <span className="text-primary material-symbols-outlined mb-1">eco</span>
                      <p className="text-[10px] text-on-surface-variant">Health Index</p>
                      <p className="text-xl font-bold">Optimal</p>
                    </div>
                    <div className="bg-surface-container-lowest p-4 rounded-lg">
                      <span className="text-tertiary material-symbols-outlined mb-1">water_drop</span>
                      <p className="text-[10px] text-on-surface-variant">Soil Moisture</p>
                      <p className="text-xl font-bold">42%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Horizontal Thumbnail Gallery */}
            <div className="mt-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Inspection Reel</h2>
                <div className="flex gap-2">
                  <button className="w-10 h-10 flex items-center justify-center rounded-full border border-outline-variant/30 hover:bg-surface-container-low transition-colors">
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-full border border-outline-variant/30 hover:bg-surface-container-low transition-colors">
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-2 px-2">
                <button className="flex-none w-48 group ring-2 ring-primary ring-offset-4 ring-offset-background rounded-lg transition-all text-left">
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-surface-container-highest mb-2">
                    <img className="w-full h-full object-cover" alt="Thumbnail 1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuByQvB1h2scHRKHi0V3pRHbvJS7_v2hFSJd19AX2osW0fpqg7OFfdFiFLhFNpuyrodAjgrq0g_3x3Vy4sQV1sHXiwP_qHWsjzSx5VgRwB6dmezd4pHKjG9A0wpkx8zHKKO0oO407FOJRLVHGLylEO6IzFEhLVaTsAQYJmlWMk39T_8jYz3qcan0RdFVkUYiQsXj2jju4oFqF1xzIU2A4zMGQdi3xTmjaKxVTVitO8qm1ylKSdADv0tDWDTPUVLWBPnx_ChnsM_X5v_V" />
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-bold text-primary">Photo 1</span>
                    <span className="text-[10px] text-on-surface-variant">Primary</span>
                  </div>
                </button>
                <button className="flex-none w-48 group hover:translate-y-[-4px] transition-all text-left">
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-surface-container-highest mb-2">
                    <img className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Thumbnail 2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZwiOgN8mycf_VYmHu1V41iBS35VDeucfQQfMEAIJY2rJhcEPbgXr1NF79-xt529D9vkSbdDi-nasXITmGc61_5NCCDVE4_LuFRRE5UcRo_N3HoBXiLwC0mu6onHgkj5l6xuiw35YpxEuhhr8mZx0_Dd3c-kakO_ADEmYer4Ze-ditIXnqTZALmons9v3O-Eetj1B3lHY9bd9fjgauiPybdCGGHM8UTcnoD-nMNc0Qqg50d0JSG6C6BiOoSptG10smM_dtrCz2yxIL" />
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-semibold text-on-surface">Photo 2</span>
                    <span className="text-[10px] text-on-surface-variant">Secondary</span>
                  </div>
                </button>
                <button className="flex-none w-48 group hover:translate-y-[-4px] transition-all text-left">
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-surface-container-highest mb-2">
                    <img className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Thumbnail 3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBs47QwcAAxM51e2K9S3jIHu-b6MQoi6Z3nYqmR9lZ5b8tBwE2mjb_4YSuu8M6D_ZUs6Sdxm1qGmD5g85Y4iGtQyTsRgOw_0OPaXzRi7h14xKb3wtZHHMEBqIkFTBTfKEvU-h3lzgKj8Jy_A-P8lNIE9KLAqAHuMEr6IuXW1rfJ-SGPdS3gUtpCk-wb1WKtvitWYX2mE2PaDOmLlTFLjCMZg4yhl0jO7ynBR8MyGAz0IegbwE6JxHkYcerZokMWGCls-88lCQAfD0Wr" />
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-semibold text-on-surface">Photo 3</span>
                    <span className="text-[10px] text-on-surface-variant">Detail</span>
                  </div>
                </button>
                <button className="flex-none w-48 group hover:translate-y-[-4px] transition-all text-left">
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-surface-container-highest mb-2">
                    <img className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Thumbnail 4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuARHyAi7CfPJP5huct2AMfhNdp_joARVB8b5ikVQ2uZUOLWw0JD15qRj3cotYnz-cJFSmIO-mrNsB-H7abDgMeD0ND4-IC32RKSkPluYza7SC6d4FR0bf-5-NEuQt5buXcy_ijmmlbVYZzE65PhhxmC_YjIvyCrtaT0S4tc4UX_hxOyO2cQYYMgYHLC4Z67X2ytWb1i7S7WiaOlrFk87B2Oq7StLSsn6PzMdZLuiHXJp3XxFQWPCmgQOnOXmmLNykVVlsquvNh__hhD" />
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-semibold text-on-surface">Photo 4</span>
                    <span className="text-[10px] text-on-surface-variant">Macro</span>
                  </div>
                </button>
                <button className="flex-none w-48 group text-left">
                  <div className="aspect-video w-full rounded-lg border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center gap-2 hover:bg-surface-container-low transition-colors">
                    <span className="material-symbols-outlined text-outline-variant">add_a_photo</span>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase">Add Image</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Action Button */}
      {!isBlurred && (
        <button
          onClick={onNewScan}
          className="fixed bottom-8 right-8 bg-primary text-white p-5 rounded-full shadow-2xl shadow-primary/40 hover:scale-110 active:scale-95 transition-all duration-300 z-50 group flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
          <span className="absolute right-full mr-4 bg-on-surface text-white text-xs font-bold px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl">
            Start New Scan
          </span>
        </button>
      )}
    </div>
  );
}
