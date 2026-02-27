import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, Scan, ShieldAlert, CheckCircle, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';

const DamageScanner = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [detectedIssues, setDetectedIssues] = useState([]);
    const [healthScore, setHealthScore] = useState(100);
    const [scanPhase, setScanPhase] = useState('initial'); // initial, scanning, result
    const [cameraReady, setCameraReady] = useState(false);

    // Simulated Scanning Logic
    const startScan = () => {
        setIsScanning(true);
        setScanProgress(0);
        setScanPhase('scanning');

        const interval = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    completeScan();
                    return 100;
                }
                return prev + 1;
            });
        }, 50);
    };

    const completeScan = () => {
        setIsScanning(false);
        setScanPhase('result');

        // Randomly generate issues for demo
        const possibleIssues = [
            { type: 'Scratch', severity: 'Low', location: 'Side Door', color: 'blue' },
            { type: 'Oil Leak', severity: 'Critical', location: 'Undercarriage', color: 'red' },
            { type: 'Rust', severity: 'Medium', location: 'Rear Wheel Arch', color: 'amber' },
            { type: 'Dented Panel', severity: 'Low', location: 'Hood', color: 'blue' }
        ];

        const count = Math.floor(Math.random() * 3) + 1;
        const issues = possibleIssues.sort(() => 0.5 - Math.random()).slice(0, count);
        setDetectedIssues(issues);

        const score = 100 - (issues.length * 12);
        setHealthScore(score);
    };

    const resetScan = () => {
        setScanPhase('initial');
        setDetectedIssues([]);
        setScanProgress(0);
        setHealthScore(100);
    };

    // Simulate Camera Load
    useEffect(() => {
        const timer = setTimeout(() => setCameraReady(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col font-mono text-cyan-400 overflow-hidden">
            {/* Header HUD */}
            <div className="flex justify-between items-center p-6 border-b border-cyan-900/30 bg-black/50 backdrop-blur-md z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="text-xs uppercase tracking-[0.2em]">Exit Scanner</span>
                </button>
                <div className="text-center">
                    <h2 className="text-sm font-black uppercase tracking-[0.4em] text-white">Vajra Vision AI</h2>
                    <p className="text-[10px] text-cyan-500/70">Secure Handover Inspection System v4.0.1</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-[10px] uppercase tracking-widest text-red-500">Live Feedback</span>
                </div>
            </div>

            {/* Main Viewfinder */}
            <div className="relative flex-1 bg-slate-900 overflow-hidden flex items-center justify-center">
                {/* Simulated Camera Grain Overlay */}
                <div className="absolute inset-0 bg-camera-grain opacity-10 pointer-events-none" />

                {/* HUD Viewfinder Borders */}
                <div className="absolute inset-8 border border-cyan-500/20 pointer-events-none">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400" />

                    {/* Centered Reticle */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 flex items-center justify-center">
                        <div className="absolute inset-0 border border-cyan-400/30 rounded-full animate-ping" />
                        <div className="w-4 h-4 border border-cyan-400 rounded-full bg-cyan-400/20" />
                    </div>
                </div>

                {/* Scan Progress HUD */}
                {isScanning && (
                    <div className="absolute top-16 left-1/2 -translate-x-1/2 w-64 bg-black/80 border border-cyan-500/50 p-4 rounded-lg backdrop-blur-xl animate-fade-in shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                        <div className="flex justify-between mb-2">
                            <span className="text-[10px] uppercase tracking-widest font-bold">Surface Analysis</span>
                            <span className="text-[10px] font-bold">{scanProgress}%</span>
                        </div>
                        <div className="h-1 bg-cyan-900 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-cyan-400 transition-all duration-100 ease-out shadow-[0_0_10px_#22d3ee]"
                                style={{ width: `${scanProgress}%` }}
                            />
                        </div>
                        <p className="text-[8px] mt-2 text-cyan-400/70 animate-pulse tracking-widest uppercase">
                            Detecting structural anomalies...
                        </p>
                    </div>
                )}

                {/* Simulated Machine Graphic (Static Background for Demo) */}
                <div className={`transition-all duration-1000 ${cameraReady ? 'opacity-40 scale-100' : 'opacity-0 scale-110'}`}>
                    <img
                        src="https://images.unsplash.com/photo-1594132402127-99df88f58694?auto=format&fit=crop&q=80&w=1000"
                        alt="Machinery"
                        className="max-h-[70vh] w-auto grayscale"
                    />
                </div>

                {/* Detection Pins (Result Phase) */}
                {scanPhase === 'result' && detectedIssues.map((issue, idx) => (
                    <div
                        key={idx}
                        className={`absolute w-4 h-4 rounded-full border-2 border-${issue.color}-500 bg-${issue.color}-500/20 animate-pulse`}
                        style={{
                            top: `${30 + (idx * 15)}%`,
                            left: `${40 + (idx * 10)}%`
                        }}
                    >
                        <div className={`absolute left-6 top-0 w-32 bg-black/80 border border-${issue.color}-500/50 p-2 rounded backdrop-blur-md animate-slide-right`}>
                            <p className={`text-[10px] font-black uppercase tracking-widest text-${issue.color}-400`}>{issue.type}</p>
                            <p className="text-[8px] text-white/70 mt-1">{issue.location} • {issue.severity}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom HUD - Controls */}
            <div className="p-8 border-t border-cyan-900/30 bg-black/80 backdrop-blur-xl flex flex-col items-center gap-6">

                {scanPhase === 'initial' && (
                    <div className="text-center animate-fade-in">
                        <p className="text-cyan-200/70 text-[10px] uppercase tracking-[0.3em] mb-4">Point Camera at Asset Surface</p>
                        <button
                            onClick={startScan}
                            disabled={!cameraReady}
                            className={`
                                group px-10 py-5 bg-cyan-600 rounded-full flex items-center gap-3 transition-all
                                ${cameraReady ? 'hover:bg-cyan-500 hover:scale-110 active:scale-95 shadow-[0_0_40px_rgba(8,145,178,0.4)]' : 'opacity-50 cursor-not-allowed'}
                            `}
                        >
                            <Scan className="text-white group-hover:rotate-90 transition-transform duration-500" />
                            <span className="text-white font-black uppercase tracking-widest text-sm">Initiate AI Scan</span>
                        </button>
                    </div>
                )}

                {scanPhase === 'result' && (
                    <div className="w-full max-w-2xl animate-fade-up">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-black/50 border border-cyan-500/20 p-4 rounded-2xl flex flex-col items-center justify-center">
                                <span className="text-[10px] uppercase tracking-widest text-cyan-500/70 mb-1">Health Score</span>
                                <span className={`text-4xl font-black ${healthScore > 80 ? 'text-green-500' : 'text-amber-500'}`}>{healthScore}%</span>
                            </div>

                            <div className="md:col-span-2 bg-black/50 border border-cyan-500/20 p-4 rounded-2xl">
                                <span className="text-[10px] uppercase tracking-widest text-cyan-500/70 mb-3 block">Detected Telemetry</span>
                                <div className="space-y-2">
                                    {detectedIssues.length > 0 ? (
                                        detectedIssues.map((issue, idx) => (
                                            <div key={idx} className="flex items-center gap-3 text-[10px] bg-cyan-950/20 p-2 rounded">
                                                <AlertTriangle size={14} className={`text-${issue.color}-500`} />
                                                <span className="text-white/80">{issue.type} detected at {issue.location} </span>
                                                <span className={`ml-auto px-2 py-0.5 rounded-full bg-${issue.color}-500/20 text-${issue.color}-500`}>{issue.severity}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex items-center gap-3 text-[10px] text-green-500">
                                            <CheckCircle size={14} />
                                            <span>No structural anomalies detected. Machine is optimal.</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={resetScan}
                                className="flex-1 py-4 border border-cyan-500/30 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-cyan-500/10 transition-colors flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={16} /> Rescan
                            </button>
                            <button
                                onClick={() => navigate(-1)}
                                className="flex-1 py-4 bg-green-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-green-500 transition-all hover:shadow-[0_0_30px_rgba(22,163,74,0.4)] flex items-center justify-center gap-2"
                            >
                                <ShieldAlert size={16} /> Log Scan Result
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Scanning Scanline Animation */}
            {isScanning && (
                <div className="fixed inset-0 pointer-events-none z-[101]">
                    <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400/50 shadow-[0_0_20px_#22d3ee] animate-scanline" />
                    <div className="absolute inset-0 bg-cyan-400/5 animate-pulse" />
                </div>
            )}
        </div>
    );
};

export default DamageScanner;
