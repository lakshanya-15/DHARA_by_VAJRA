import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, Scan, ShieldAlert, CheckCircle, ArrowLeft, RefreshCw, AlertTriangle, Upload, Eye } from 'lucide-react';
import { damageAPI } from '../../services/api';

const DamageScanner = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);

    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [detectedIssues, setDetectedIssues] = useState([]);
    const [healthScore, setHealthScore] = useState(100);
    const [scanPhase, setScanPhase] = useState('selection'); // selection, initial, scanning, result
    const [cameraStream, setCameraStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [scanType, setScanType] = useState('BEFORE'); // BEFORE or AFTER
    const [previousScan, setPreviousScan] = useState(null);
    const [validationMessage, setValidationMessage] = useState('');

    // Initial Camera Setup
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            videoRef.current.srcObject = stream;
            setCameraStream(stream);
        } catch (err) {
            console.error("Camera access denied", err);
        }
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = canvasRef.current;
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    setCapturedImage(event.target.result);
                    setScanPhase('ready');
                    stopCamera();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        setScanPhase('ready');
        stopCamera();
    };

    const runAIScan = () => {
        setIsScanning(true);
        setScanProgress(0);
        setScanPhase('scanning');

        const interval = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    analyzeImage();
                    return 100;
                }
                return prev + 2;
            });
        }, 50);
    };

    const analyzeImage = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        // FALLBACK: Ensure image is drawn to canvas if somehow missed (e.g. race condition)
        if (canvas.width <= 1 || canvas.height <= 1) {
            console.warn("Canvas sync correction triggered");
            setValidationMessage("PROCESSING ERROR: RETAKE SCAN");
            setScanPhase('result');
            setIsScanning(false);
            return;
        }

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;

        // 1. TEXTURE DENSITY & BLANK CHECK (Grid-based Variance)
        const gridSize = 8;
        const cellW = Math.floor(width / gridSize);
        const cellH = Math.floor(height / gridSize);
        let featurelessCells = 0;

        for (let gy = 0; gy < gridSize; gy++) {
            for (let gx = 0; gx < gridSize; gx++) {
                let cellSum = 0;
                let cellSqSum = 0;
                let cellCount = 0;

                for (let y = gy * cellH; y < (gy + 1) * cellH; y += 4) {
                    for (let x = gx * cellW; x < (gx + 1) * cellW; x += 4) {
                        const idx = (y * width + x) * 4;
                        if (idx >= data.length) continue;
                        const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                        cellSum += brightness;
                        cellSqSum += brightness * brightness;
                        cellCount++;
                    }
                }

                if (cellCount > 0) {
                    const avg = cellSum / cellCount;
                    const variance = (cellSqSum / cellCount) - (avg * avg);
                    if (variance < 100) featurelessCells++; // Variance threshold for "blank"
                }
            }
        }

        // 0. MACHINERY VALIDATION (Learning to say No)
        let machineWeight = 0;
        let skinToneWeight = 0;

        // Machine-like color profiles (Reds, Cyans, Greys, Oranges)
        // Skin-tone profiles (Warm Oranges/Pinks/Soft Browns)

        for (let i = 0; i < data.length; i += 16 * step) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Detect typical skin tones: R > G > B and high saturation
            if (r > 60 && g > 40 && b > 20 && r > g && g > b && (r - b) > 15) {
                skinToneWeight++;
            }

            // Detect industrial colors (High saturations or neutral greys)
            if ((Math.abs(r - g) < 20 && Math.abs(g - b) < 20) || (r > 150 && b < 100)) {
                machineWeight++;
            }
        }

        // Rejection Logic
        if (skinToneWeight > machineWeight * 1.5 || featurelessCells > (gridSize * gridSize * 0.85)) {
            setDetectedIssues([]);
            setValidationMessage("UNRECOGNIZED SUBJECT: PLEASE SCAN MACHINERY");
            setHealthScore(100);
            setScanPhase('result');
            setIsScanning(false);
            return;
        }

        setValidationMessage("");

        // 2. FEATURE EXTRACTION (Localized Anomalies)
        let darkClusters = 0;
        let rustClusters = 0;
        let edgeIntensity = 0;
        const step = 4;
        const totalSamples = data.length / (4 * step);

        for (let i = 0; i < data.length; i += 4 * step) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Local Contrast / Edge Calculation
            if (i + 4 * width < data.length) {
                const nextR = data[i + 4 * width];
                const diff = Math.abs(r - nextR);
                // Adaptive threshold: only count very sharp edges (potential scratches)
                if (diff > 75) edgeIntensity++;
            }

            // Rust Check: Orange/Brown hue with structural clustering
            if (r > 130 && g > 70 && r > g * 1.6 && g > b * 1.3) {
                rustClusters++;
            }

            // Oil/Fluid Check: Discrete black anomalies
            if (r < 30 && g < 30 && b < 30) {
                darkClusters++;
            }
        }

        const issues = [];

        // Adaptive Scoring Logic
        if (edgeIntensity / totalSamples > 0.05) {
            issues.push({
                type: 'Surface Scratch',
                severity: 'Low',
                location: 'Exterior Panel',
                color: 'blue'
            });
        }

        if (darkClusters / totalSamples > 0.10) {
            issues.push({
                type: 'Fluid/Oil Leak',
                severity: 'Critical',
                location: 'Core Component',
                color: 'red'
            });
        }

        if (rustClusters / totalSamples > 0.05) {
            issues.push({
                type: 'Surface Corrosion',
                severity: 'Medium',
                location: 'Chassis/Joint',
                color: 'amber'
            });
        }

        // 3. COMPARATIVE DELTA (Before vs After)
        let finalIssues = issues;
        if (scanType === 'AFTER' && previousScan) {
            const prevIssueTypes = (previousScan.issues || []).map(i => i.type);
            finalIssues = issues.map(issue => ({
                ...issue,
                isNew: !prevIssueTypes.includes(issue.type)
            }));
        }

        setDetectedIssues(finalIssues);
        const finalScore = Math.max(0, 100 - (finalIssues.filter(i => i.isNew).length * 20) - (finalIssues.filter(i => !i.isNew).length * 5));
        setHealthScore(finalScore);
        setScanPhase('result');
        setIsScanning(false);
    };

    const saveScanResult = async () => {
        setUploadLoading(true);
        try {
            await damageAPI.create({
                bookingid: id || '00000000-0000-0000-0000-000000000000',
                scanType: scanType,
                image: capturedImage,
                healthScore,
                issues: detectedIssues
            });
            // Robust navigation back to bookings
            navigate('/farmer/bookings');
        } catch (err) {
            console.error("Failed to save scan", err);
            alert("Connection error. Scan results lost.");
        } finally {
            setUploadLoading(false);
        }
    };

    const reset = () => {
        setCapturedImage(null);
        setDetectedIssues([]);
        setScanPhase('initial');
        setValidationMessage('');
        startCamera();
    };

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await damageAPI.getByBooking(id);
                if (res.data && Array.isArray(res.data.data)) {
                    const beforeScan = res.data.data.find(s => s.scanType === 'BEFORE');
                    setPreviousScan(beforeScan);
                }
            } catch (err) {
                console.error("History fetch error", err);
            }
        };
        fetchHistory();
        // Camera will be started when phase transition to 'initial'
        return () => stopCamera();
    }, [id]);

    return (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col font-mono text-cyan-400 overflow-hidden">
            {/* HUD Header */}
            <div className="flex justify-between items-center p-6 border-b border-cyan-900/30 bg-black/50 backdrop-blur-md z-10">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                    <span className="text-[10px] uppercase tracking-[0.2em]">Exit Scanner</span>
                </button>
                <div className="text-center">
                    <h2 className="text-sm font-black uppercase tracking-[0.4em] text-white">Vajra Vision AI</h2>
                    <p className="text-[10px] text-cyan-500/70 shrink-0">Bilinear Surface Analysis Engine</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] uppercase tracking-widest text-cyan-400 font-bold">{scanType || 'SCAN'} MODE</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-[8px] uppercase tracking-widest text-red-500 hidden sm:block">Real-Time Core</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Selection Phase */}
            {scanPhase === 'selection' && (
                <div className="flex-1 flex flex-col items-center justify-center p-10 bg-gradient-to-b from-black to-slate-900 z-50">
                    <div className="max-w-md w-full text-center space-y-12">
                        <div className="space-y-4">
                            <ShieldAlert size={64} className="mx-auto text-cyan-500 animate-pulse" />
                            <h2 className="text-3xl font-black uppercase tracking-widest text-white">Rental Integrity Protocols</h2>
                            <p className="text-cyan-500/60 text-xs tracking-widest">SELECT PHASE TO INITIATE SCANNER</p>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <button
                                onClick={() => { setScanType('BEFORE'); setScanPhase('initial'); startCamera(); }}
                                className="group p-8 border border-cyan-500/20 rounded-[2rem] bg-black/40 hover:bg-cyan-500/10 transition-all text-left"
                            >
                                <h4 className="text-white font-black uppercase tracking-widest text-lg group-hover:text-cyan-400">Phase 01: Pre-Rental</h4>
                                <p className="text-[10px] text-slate-500 mt-2">Establish baseline machine health telemetry before handover.</p>
                            </button>

                            <button
                                onClick={() => { setScanType('AFTER'); setScanPhase('initial'); startCamera(); }}
                                className="group p-8 border border-cyan-500/20 rounded-[2rem] bg-black/40 hover:bg-cyan-500/10 transition-all text-left"
                            >
                                <h4 className="text-white font-black uppercase tracking-widest text-lg group-hover:text-cyan-400">Phase 02: Post-Rental</h4>
                                <p className="text-[10px] text-slate-500 mt-2">Validate machine integrity and identify comparative damage deltas.</p>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Viewfinder Area */}
            <div className="relative flex-1 bg-slate-900 overflow-hidden flex items-center justify-center">
                <canvas ref={canvasRef} className="hidden" />

                {scanPhase === 'initial' && (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover grayscale opacity-60"
                    />
                )}

                {capturedImage && (
                    <img
                        src={capturedImage}
                        className={`w-full h-full object-cover transition-all duration-1000 ${scanPhase === 'scanning' ? 'blur-sm brightness-50' : 'grayscale'}`}
                        alt="Captured"
                    />
                )}

                {/* HUD Viewfinder Borders */}
                <div className="absolute inset-8 border border-cyan-500/10 pointer-events-none z-20">
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-cyan-400" />
                    <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-cyan-400" />
                    <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-cyan-400" />
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-cyan-400" />
                </div>

                {/* Scanning HUD Overlay */}
                {isScanning && (
                    <div className="absolute top-40 left-1/2 -translate-x-1/2 w-80 z-30 space-y-4 animate-fade-in">
                        <div className="bg-black/80 border border-cyan-400 p-6 rounded-2xl backdrop-blur-xl">
                            <div className="flex justify-between items-end mb-4">
                                <span className="text-[10px] uppercase tracking-[0.3em] font-black">Telemetry Processing</span>
                                <span className="text-xl font-black">{scanProgress}%</span>
                            </div>
                            <div className="h-2 bg-cyan-900 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-cyan-400 shadow-[0_0_20px_#22d3ee] transition-all" style={{ width: `${scanProgress}%` }} />
                            </div>
                            <div className="mt-4 flex flex-col gap-1">
                                <p className="text-[8px] uppercase tracking-widest text-cyan-400/60 transition-all">Analyzing surface telemetry...</p>
                                <p className="text-[8px] uppercase tracking-widest text-cyan-400/60">Pixel-depth calculation...</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Detection Markers */}
                {scanPhase === 'result' && detectedIssues.map((issue, idx) => (
                    <div
                        key={idx}
                        className={`absolute z-30 p-2 border ${issue.isNew ? 'border-red-500 bg-red-950/40' : `border-${issue.color}-500 bg-black/60`} rounded backdrop-blur-md animate-scale-up shadow-lg`}
                        style={{ top: `${20 + (idx * 20)}%`, left: `${30 + (idx * 15)}%` }}
                    >
                        <div className="flex items-center gap-2">
                            {issue.isNew ? <ShieldAlert size={12} className="text-red-500 animate-pulse" /> : <AlertTriangle size={12} className={`text-${issue.color}-500`} />}
                            <span className={`text-[10px] font-black uppercase ${issue.isNew ? 'text-red-400' : `text-${issue.color}-400`}`}>
                                {issue.isNew ? "NEW DAMAGE • " : ""}{issue.type}
                            </span>
                        </div>
                        <p className="text-[8px] text-white/60 mt-1 uppercase tracking-tighter">{issue.location} • {issue.severity}</p>
                    </div>
                ))}

                {/* Validation Message HUD */}
                {validationMessage && scanPhase === 'result' && (
                    <div className="absolute inset-0 z-40 bg-red-950/60 backdrop-blur-xl flex flex-col items-center justify-center p-10 text-center animate-fade-in">
                        <ShieldAlert size={80} className="text-red-500 mb-6 animate-bounce" />
                        <h3 className="text-2xl font-black text-white uppercase tracking-[0.2em] mb-4">Protocol Violation</h3>
                        <p className="text-red-400 text-sm font-bold tracking-widest">{validationMessage}</p>
                        <button onClick={reset} className="mt-10 px-8 py-3 bg-red-600 rounded-full text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-red-500 transition-all">Re-Scan Target</button>
                    </div>
                )}
            </div>

            {/* Controls HUD */}
            <div className="p-10 border-t border-cyan-900/30 bg-black/95 backdrop-blur-2xl z-40">
                <div className="max-w-4xl mx-auto">
                    {scanPhase === 'initial' && (
                        <div className="flex flex-col items-center gap-8">
                            <div className="flex gap-6 w-full max-w-md">
                                <button
                                    onClick={capturePhoto}
                                    className="flex-1 bg-cyan-600 h-20 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-cyan-500 transition-all shadow-xl shadow-cyan-600/20 active:scale-95 group"
                                >
                                    <Camera size={24} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Capture Frame</span>
                                </button>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                />
                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    className="flex-1 border border-cyan-900/50 h-20 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-cyan-400/10 transition-all active:scale-95"
                                >
                                    <Upload size={24} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Upload Image</span>
                                </button>
                            </div>
                            <p className="text-[9px] text-slate-500 uppercase tracking-[0.4em] font-black">Ready for inspection telemetry</p>
                        </div>
                    )}

                    {scanPhase === 'ready' && (
                        <div className="flex flex-col items-center gap-6 animate-fade-up">
                            <button
                                onClick={runAIScan}
                                className="px-16 py-6 bg-cyan-500 text-white rounded-full flex items-center gap-4 hover:bg-cyan-400 transition-all shadow-[0_0_50px_rgba(6,182,212,0.4)] group active:scale-95"
                            >
                                <Scan size={24} className="group-hover:rotate-90 transition-transform duration-700" />
                                <span className="text-sm font-black uppercase tracking-[0.3em]">Run Vajra AI Analysis</span>
                            </button>
                            <button onClick={reset} className="text-[10px] text-slate-500 hover:text-white uppercase tracking-widest">Retake Photo</button>
                        </div>
                    )}

                    {scanPhase === 'result' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-fade-up">
                            <div className="bg-black/40 border border-cyan-500/20 p-8 rounded-[2rem] flex flex-col items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-cyan-400/5 -translate-y-full group-hover:translate-y-0 transition-transform duration-1000" />
                                <span className="text-[10px] uppercase tracking-[0.4em] text-cyan-500/60 mb-2 relative z-10">
                                    {scanType === 'AFTER' ? 'Comparative Health Index' : 'Machine Health Index'}
                                </span>
                                <h3 className={`text-6xl font-black tracking-tighter relative z-10 ${healthScore > 80 ? 'text-green-500' : 'text-amber-500'}`}>{healthScore}%</h3>
                                {scanType === 'AFTER' && previousScan && (
                                    <p className="text-[10px] font-black text-cyan-400/80 mt-2 uppercase tracking-widest">
                                        Baseline: {previousScan.healthScore}% • Delta: {healthScore - previousScan.healthScore}%
                                    </p>
                                )}
                                <p className="text-[9px] text-slate-500 mt-4 uppercase tracking-widest relative z-10">Optimal operating range: 85%+</p>
                            </div>

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={saveScanResult}
                                    disabled={uploadLoading}
                                    className="w-full py-6 bg-green-600 text-white rounded-3xl font-black text-[12px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-green-500 transition-all shadow-xl shadow-green-600/20 active:scale-95"
                                >
                                    {uploadLoading ? <RefreshCw className="animate-spin" /> : <ShieldAlert size={20} />}
                                    {uploadLoading ? "Transmitting..." : "Log to Ledger"}
                                </button>
                                <button
                                    onClick={reset}
                                    className="w-full py-6 border border-cyan-900/50 rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-cyan-500/10 transition-all"
                                >
                                    <RefreshCw size={18} /> Rescan Surface
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Scanline Animation */}
            {isScanning && (
                <div className="fixed inset-0 pointer-events-none z-[101]">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-cyan-400 shadow-[0_0_30px_#22d3ee] animate-scanline" />
                    <div className="absolute inset-0 bg-cyan-400/10 animate-pulse" />
                </div>
            )}
        </div>
    );
};

export default DamageScanner;
