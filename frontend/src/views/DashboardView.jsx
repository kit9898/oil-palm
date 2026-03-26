import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet';
import html2canvas from 'html2canvas';
import 'leaflet/dist/leaflet.css';
import logo from '../assets/logo.png';
import bgVideo from '../assets/logo-background.webm';
import nvidiaLogo from '../assets/sponsorship/nvidia.png';
import djiLogo from '../assets/sponsorship/dji.png';
import vantatechLogo from '../assets/sponsorship/vantatech.png';
import seeedLogo from '../assets/sponsorship/seeed-studio.png';
import unitreeLogo from '../assets/sponsorship/unitree.png';

const DEFAULT_FROM = 'Sungai Terap, Malaysia';
const DEFAULT_TO = '';
const LEGACY_FROM = 'Klang, Selangor, Malaysia';
const LEGACY_TO = 'Ipoh, Perak, Malaysia';
const SEARCH_DEBOUNCE_MS = 300;
const sponsors = [
    { name: 'NVIDIA', src: nvidiaLogo, sizeClass: 'h-[6.3rem] md:h-[7.35rem]' },
    { name: 'DJI', src: djiLogo, sizeClass: 'h-[4.5rem] md:h-[5.25rem]' },
    { name: 'VANTATECH', src: vantatechLogo, sizeClass: 'h-[8.6rem] md:h-[10.2rem]' },
    { name: 'Seeed Studio', src: seeedLogo, sizeClass: 'h-[2.75rem] md:h-[3.2rem]' },
    { name: 'UNITREE', src: unitreeLogo, sizeClass: 'h-[6.3rem] md:h-[7.35rem]' },
];

function ViewportController({ routeCoords, fromLocation, toLocation }) {
    const map = useMap();

    useEffect(() => {
        if (routeCoords.length > 1) {
            map.fitBounds(routeCoords, { padding: [42, 42] });
            return;
        }

        if (toLocation) {
            map.flyTo([toLocation.lat, toLocation.lon], 12, { duration: 0.8 });
            return;
        }

        if (fromLocation) {
            map.flyTo([fromLocation.lat, fromLocation.lon], 12, { duration: 0.8 });
        }
    }, [map, routeCoords, fromLocation, toLocation]);

    return null;
}

function ZoomController({ onReady }) {
    const map = useMap();
    useEffect(() => { onReady(map); }, [map, onReady]);
    return null;
}

function readStoredQuery(key, fallbackValue) {
    if (typeof window === 'undefined') {
        return fallbackValue;
    }

    const storedValue = window.localStorage.getItem(key);
    return storedValue || fallbackValue;
}

function mapNominatimResult(item) {
    return {
        label: item.display_name,
        lat: Number(item.lat),
        lon: Number(item.lon),
    };
}

async function searchLocations(query, limit = 5) {
    const params = new URLSearchParams({
        q: query,
        format: 'jsonv2',
        countrycodes: 'my',
        limit: String(limit),
        addressdetails: '1',
    });

    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
    if (!response.ok) {
        throw new Error('Location search service is unavailable right now.');
    }

    const payload = await response.json();
    return payload.map(mapNominatimResult);
}

async function fetchRoute(start, end) {
    const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?overview=full&geometries=geojson`
    );

    if (!response.ok) {
        throw new Error('Route service is unavailable right now.');
    }

    const payload = await response.json();
    if (payload.code !== 'Ok' || !payload.routes?.length) {
        throw new Error('No drivable route found for this location pair.');
    }

    const bestRoute = payload.routes[0];
    return {
        coordinates: bestRoute.geometry.coordinates.map(([lon, lat]) => [lat, lon]),
        distanceKm: bestRoute.distance / 1000,
        durationMin: bestRoute.duration / 60,
    };
}

export default function DashboardView({ onUpload }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [confidence, setConfidence] = useState(0.5);
    const [isProcessing, setIsProcessing] = useState(false);

    const [fromQuery, setFromQuery] = useState(() => readStoredQuery('dashboard-route-from', DEFAULT_FROM));
    const [toQuery, setToQuery] = useState(() => readStoredQuery('dashboard-route-to', DEFAULT_TO));
    const [fromSuggestions, setFromSuggestions] = useState([]);
    const [, setToSuggestions] = useState([]);
    const [fromLocation, setFromLocation] = useState(null);
    const [toLocation, setToLocation] = useState(null);
    const [routeCoords, setRouteCoords] = useState([]);
    const [, setRouteMeta] = useState(null);
    const [routeError, setRouteError] = useState('');
    const [isRouteLoading, setIsRouteLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [mapInstance, setMapInstance] = useState(null);
    const handleMapReady = useCallback((map) => setMapInstance(map), []);

    const fileInputRef = useRef(null);
    const mapRef = useRef(null);
    const dashboardSectionRef = useRef(null);

    const fromSearchTimeoutRef = useRef(null);
    const toSearchTimeoutRef = useRef(null);
    const fromRequestIdRef = useRef(0);
    const toRequestIdRef = useRef(0);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const savedFrom = window.localStorage.getItem('dashboard-route-from');
        const savedTo = window.localStorage.getItem('dashboard-route-to');

        if (savedFrom === LEGACY_FROM && savedTo === LEGACY_TO) {
            setFromQuery(DEFAULT_FROM);
            setToQuery(DEFAULT_TO);
            window.localStorage.setItem('dashboard-route-from', DEFAULT_FROM);
            window.localStorage.setItem('dashboard-route-to', DEFAULT_TO);
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem('dashboard-route-from', fromQuery);
        }
    }, [fromQuery]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem('dashboard-route-to', toQuery);
        }
    }, [toQuery]);


    const scrollToDashboard = () => {
        dashboardSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

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

    const handleDragOver = (e) => e.preventDefault();

    const requestSuggestions = async (field, queryValue) => {
        const requestIdRef = field === 'from' ? fromRequestIdRef : toRequestIdRef;
        const setSuggestions = field === 'from' ? setFromSuggestions : setToSuggestions;

        requestIdRef.current += 1;
        const currentRequestId = requestIdRef.current;

        try {
            const results = await searchLocations(queryValue, 5);
            if (currentRequestId === requestIdRef.current) {
                setSuggestions(results);
            }
        } catch {
            if (currentRequestId === requestIdRef.current) {
                setSuggestions([]);
            }
        }
    };

    const scheduleSuggestions = (field, value) => {
        const timeoutRef = field === 'from' ? fromSearchTimeoutRef : toSearchTimeoutRef;
        const setSuggestions = field === 'from' ? setFromSuggestions : setToSuggestions;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (value.trim().length < 2) {
            setSuggestions([]);
            return;
        }

        timeoutRef.current = setTimeout(() => {
            requestSuggestions(field, value);
        }, SEARCH_DEBOUNCE_MS);
    };

    const runRouteSearch = async (startText, endText) => {
        const normalizedStart = startText.trim();
        const normalizedEnd = endText.trim();

        if (!normalizedStart) {
            setRouteError('Please enter a location to search.');
            return;
        }

        setRouteError('');
        setIsRouteLoading(true);

        try {
            const [startResult] = await searchLocations(normalizedStart, 1);
            if (!startResult) {
                throw new Error(`Cannot find "${normalizedStart}".`);
            }

            setFromLocation(startResult);
            setFromQuery(startResult.label);
            setFromSuggestions([]);

            if (!normalizedEnd) {
                setToLocation(null);
                setToQuery('');
                setToSuggestions([]);
                setRouteCoords([]);
                setRouteMeta(null);
                return;
            }

            const [endResult] = await searchLocations(normalizedEnd, 1);
            if (!endResult) {
                throw new Error(`Cannot find "${normalizedEnd}".`);
            }

            setToLocation(endResult);
            setToQuery(endResult.label);
            setToSuggestions([]);

            const route = await fetchRoute(startResult, endResult);
            setRouteCoords(route.coordinates);
            setRouteMeta({
                distanceKm: route.distanceKm,
                durationMin: route.durationMin,
            });
        } catch (error) {
            setRouteCoords([]);
            setRouteMeta(null);
            setRouteError(error instanceof Error ? error.message : 'Location search failed.');
        } finally {
            setIsRouteLoading(false);
        }
    };

    const handleRouteSubmit = async (e) => {
        e.preventDefault();
        setToQuery('');
        setToLocation(null);
        setToSuggestions([]);
        setFocusedField(null);
        await runRouteSearch(fromQuery, '');
    };

    const selectSuggestion = (field, suggestion) => {
        if (field === 'from') {
            setFromQuery(suggestion.label);
            setFromLocation(suggestion);
            setFromSuggestions([]);
            setFocusedField(null);
            return;
        }

        setToQuery(suggestion.label);
        setToLocation(suggestion);
        setToSuggestions([]);
        setFocusedField(null);
    };

    const handleQuickScan = async () => {
        setIsProcessing(true);

        try {
            if (!mapRef.current) {
                throw new Error('Map container is not ready.');
            }

            const canvas = await html2canvas(mapRef.current, {
                useCORS: true,
                allowTaint: false,
            });

            const blob = await new Promise((resolve, reject) => {
                canvas.toBlob((createdBlob) => {
                    if (!createdBlob) {
                        reject(new Error('Failed to create map snapshot blob.'));
                        return;
                    }
                    resolve(createdBlob);
                }, 'image/jpeg', 0.92);
            });

            const quickScanFile = new File([blob], 'quick-map-scan.jpg', { type: 'image/jpeg' });
            setSelectedFile(quickScanFile);
            onUpload(quickScanFile, confidence);
        } catch (error) {
            console.error('Quick scan failed:', error);
            setIsProcessing(false);
        }
    };

    const handleSubmit = async () => {
        setIsProcessing(true);

        try {
            if (selectedFile) {
                onUpload(selectedFile, confidence);
            } else if (mapRef.current) {
                const canvas = await html2canvas(mapRef.current, {
                    useCORS: true,
                    allowTaint: false,
                });

                canvas.toBlob((blob) => {
                    const mapImageFile = new File([blob], 'map-scan.jpg', { type: 'image/jpeg' });
                    setSelectedFile(mapImageFile);
                    onUpload(mapImageFile, confidence);
                }, 'image/jpeg', 0.9);
            }
        } catch (error) {
            console.error('Screenshot failed:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-[#f9f9fb] font-body text-on-surface antialiased scroll-smooth">
            <header className="fixed top-0 w-full flex justify-between items-center px-8 py-4 bg-white/80 backdrop-blur-md z-50 border-b border-gray-200/50 shadow-sm">
                <nav className="hidden md:flex items-center gap-8">
                    <Link className="text-[#414755] hover:bg-gray-100 transition-colors px-4 py-2 rounded-full text-sm font-medium" to="/dashboard">Dashboard</Link>
                    <Link className="text-[#414755] hover:bg-gray-100 transition-colors px-4 py-2 rounded-full text-sm font-medium" to="/view">View</Link>
                    <Link className="text-[#414755] hover:bg-gray-100 transition-colors px-4 py-2 rounded-full text-sm font-medium" to="/result">Result</Link>
                </nav>
                <div className="flex items-center gap-4">
                    <button className="material-symbols-outlined p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">notifications</button>
                    <button className="material-symbols-outlined p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">account_circle</button>
                </div>
            </header>

            <section className="h-screen w-full snap-start relative flex items-center justify-center overflow-hidden">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover z-0"
                    src={bgVideo}
                />
                <div className="absolute inset-0 bg-black/40 z-10"></div>

                <div className="relative z-20 flex h-full w-full flex-col justify-between pt-24">
                    <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 text-center">
                        <img
                            src={logo}
                            alt="Project Canopy powered by Vanta Vision"
                            className="w-80 md:w-[40rem] mx-auto mb-8"
                        />
                        <h1 className="text-5xl md:text-6xl lg:text-2xl font-bold text-white mb-3">
                            Precision counting. Maximum yield.
                        </h1>
                        <p className="text-base md:text-lg text-gray-200 max-w-3xl mx-auto leading-normal">
                            Empowering modern agriculture with next-generation computer vision. We provide seamless, automated tree counting to streamline your operations and maximize your plantation's potential.
                        </p>
                    </div>

                    <div className="w-full bg-white/30 backdrop-blur-sm border-y border-white/10 py-6 overflow-hidden relative -translate-y-16 md:-translate-y-24">
                        <div
                            className="flex w-max"
                            style={{ animation: 'scroll-left 30s linear infinite' }}
                        >
                            {[0, 1].map((copyIndex) => (
                                <div key={`copy-${copyIndex}`} className="flex items-center">
                                    {sponsors.map((sponsor, sponsorIndex) => (
                                        <img
                                            key={`sponsor-${copyIndex}-${sponsorIndex}`}
                                            src={sponsor.src}
                                            alt={sponsor.name}
                                            className={`${sponsor.sizeClass} w-auto object-contain opacity-60 hover:opacity-100 transition-all duration-300 mx-12 md:mx-14`}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={scrollToDashboard}
                        className="cursor-pointer flex flex-col items-center gap-1 text-white/80 hover:text-white pb-1"
                        aria-label="Scroll to dashboard"
                    >
                        <span className="text-sm font-garet">Let&apos;s Calculate!</span>
                        <span className="material-symbols-outlined animate-bounce text-4xl">keyboard_double_arrow_down</span>
                    </button>
                </div>
            </section >

            <section
                ref={dashboardSectionRef}
                className="h-screen w-full snap-start relative pt-24 pb-16 px-8 flex flex-col md:flex-row gap-8 max-w-[1600px] mx-auto"
            >
                <div className="w-full md:w-3/5 h-full rounded-2xl overflow-hidden shadow-lg border border-gray-200 relative bg-gray-100">
                    <div ref={mapRef} className="absolute inset-0">
                        <MapContainer center={[3.2379, 101.6268]} zoom={12} maxZoom={12} className="w-full h-full" zoomControl={false}>
                            <TileLayer
                                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                crossOrigin="anonymous"
                                maxZoom={12}
                            />
                            <TileLayer
                                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                                crossOrigin="anonymous"
                                maxZoom={12}
                            />

                            <ZoomController onReady={handleMapReady} />

                            {routeCoords.length > 1 && (
                                <Polyline
                                    positions={routeCoords}
                                    pathOptions={{ color: '#0ea5e9', weight: 5, opacity: 0.9 }}
                                />
                            )}

                            {fromLocation && (
                                <CircleMarker
                                    center={[fromLocation.lat, fromLocation.lon]}
                                    radius={7}
                                    pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 1 }}
                                >
                                    <Tooltip direction="top" offset={[0, -8]} opacity={1}>From</Tooltip>
                                </CircleMarker>
                            )}

                            {toLocation && (
                                <CircleMarker
                                    center={[toLocation.lat, toLocation.lon]}
                                    radius={7}
                                    pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 1 }}
                                >
                                    <Tooltip direction="top" offset={[0, -8]} opacity={1}>To</Tooltip>
                                </CircleMarker>
                            )}

                            <ViewportController
                                routeCoords={routeCoords}
                                fromLocation={fromLocation}
                                toLocation={toLocation}
                            />
                        </MapContainer>
                    </div>
                    <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
                        <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow font-semibold text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-green-600 text-sm">satellite_alt</span>
                            Live Canopy View
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => mapInstance?.zoomIn()}
                                className="bg-white/90 backdrop-blur w-9 h-9 rounded-lg shadow font-bold text-lg flex items-center justify-center hover:bg-white transition-colors"
                                aria-label="Zoom in"
                            >+</button>
                            <button
                                onClick={() => mapInstance?.zoomOut()}
                                className="bg-white/90 backdrop-blur w-9 h-9 rounded-lg shadow font-bold text-lg flex items-center justify-center hover:bg-white transition-colors"
                                aria-label="Zoom out"
                            >−</button>
                        </div>
                    </div>

                    <div className="absolute top-4 right z-[400] bg-white/75 backdrop-blur rounded-full shadow-md flex items-center px-5 py-2.5 w-72 md:w-80 border border-gray-100 transition-all focus-within:shadow-lg focus-within:border-blue-300 relative">
                        <form
                            onSubmit={handleRouteSubmit}
                            className="flex items-center w-full"
                        >
                            <span className="material-symbols-outlined text-gray-400 text-lg">search</span>
                            <input
                                type="text"
                                value={fromQuery}
                                onFocus={() => setFocusedField('from')}
                                onBlur={() => setTimeout(() => setFocusedField(null), 120)}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFromQuery(value);
                                    setFromLocation(null);
                                    setToQuery('');
                                    setToLocation(null);
                                    scheduleSuggestions('from', value);
                                }}
                                placeholder="Search location or coordinates..."
                                className="bg-transparent border-none outline-none flex-1 mx-3 text-sm text-gray-800 placeholder-gray-400"
                            />
                            <button
                                type="submit"
                                disabled={isRouteLoading}
                                className="material-symbols-outlined text-blue-600 hover:text-blue-800 text-xl transition-colors"
                                aria-label="Search location"
                            >
                                {isRouteLoading ? 'progress_activity' : 'arrow_circle_right'}
                            </button>
                        </form>

                        {focusedField === 'from' && fromSuggestions.length > 0 && (
                            <div className="absolute top-[calc(100%+10px)] right-0 max-h-40 w-72 md:w-80 overflow-y-auto rounded-xl border border-gray-200 bg-white/95 backdrop-blur shadow-md">
                                {fromSuggestions.map((item, index) => (
                                    <button
                                        key={`${item.lat}-${item.lon}-${index}`}
                                        type="button"
                                        onMouseDown={(event) => event.preventDefault()}
                                        onClick={() => selectSuggestion('from', item)}
                                        className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {routeError && (
                            <p className="absolute top-[calc(100%+12px)] right-0 w-72 md:w-80 px-2 text-[11px] text-red-600 leading-4">
                                {routeError}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleQuickScan}
                        disabled={isProcessing}
                        className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-[400] px-5 py-3 bg-gray-900 text-white rounded-full shadow-xl font-semibold text-sm flex items-center gap-2 transition-all ${isProcessing ? 'opacity-80 cursor-wait' : 'hover:-translate-y-1 hover:bg-black'}`}
                    >
                        <span className={`material-symbols-outlined text-base ${isProcessing ? 'animate-spin' : ''}`}>
                            {isProcessing ? 'progress_activity' : 'center_focus_strong'}
                        </span>
                        {isProcessing ? 'Scanning...' : 'Scan Current View'}
                    </button>
                </div>

                <div className="w-full md:w-2/5 h-full flex flex-col gap-6">
                    <div
                        className="flex-shrink-0 bg-white rounded-2xl p-8 border border-gray-200 shadow-sm flex flex-col items-center justify-center relative group transition-all"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                    >
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-blue-600 text-4xl">cloud_upload</span>
                        </div>

                        <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-2">Ready for Detection?</h2>
                        <p className="text-gray-500 text-sm text-center mb-6">
                            Drag imagery here, select a file, or click Run to scan the current map view.
                        </p>

                        {selectedFile && <p className="text-blue-600 font-semibold text-sm mb-4 truncate w-full text-center">Selected: {selectedFile.name}</p>}

                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

                        <div className="w-full space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-bold text-gray-500">AI Confidence Threshold</span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${confidence >= 0.75 ? 'bg-green-100 text-green-700' :
                                        confidence >= 0.45 ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        {confidence >= 0.75 ? 'High' : confidence >= 0.45 ? 'Medium' : 'Low'} · {Math.round(confidence * 100)}%
                                    </span>
                                </div>
                                <input
                                    type="range" min="0.1" max="1.0" step="0.05" value={confidence}
                                    onChange={(e) => setConfidence(parseFloat(e.target.value))}
                                    className="w-full accent-blue-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-[10px] text-gray-400 mt-1.5">
                                    <span>More detections</span>
                                    <span>Higher precision</span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors"
                                >
                                    Select File
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isProcessing}
                                    className={`flex-1 py-3 bg-blue-600 text-white rounded-full font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${isProcessing ? 'opacity-75 cursor-wait' : 'hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5'}`}
                                >
                                    {isProcessing ? (
                                        <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                                    ) : (
                                        <span className="material-symbols-outlined text-sm">search</span>
                                    )}
                                    {isProcessing ? 'Scanning...' : 'Run Detection'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-4">
                        <div className="flex-1 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-center">
                            <span className="material-symbols-outlined text-blue-600 text-3xl mb-3">biotech</span>
                            <p className="text-gray-900 font-bold text-lg">Real-time Analysis</p>
                            <p className="text-gray-500 text-sm mt-1">Instant identification of Ganoderma and pest stress anomalies within the selected quadrant.</p>
                        </div>

                        <div className="flex-1 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-center">
                            <span className="material-symbols-outlined text-blue-600 text-3xl mb-3">monitoring</span>
                            <p className="text-gray-900 font-bold text-lg">Plantation Insights</p>
                            <p className="text-gray-500 text-sm mt-1">Connect historical coordinate data to generate predictive yield and risk reporting.</p>
                        </div>
                    </div>
                </div>

                <footer className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full text-center text-xs md:text-sm tracking-wide text-gray-600 pointer-events-none">
                    © 2026 VANTATECH. ALL RIGHTS RESERVED
                </footer>
            </section>
        </div >
    );
}
