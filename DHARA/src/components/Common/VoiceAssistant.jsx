import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, X, MessageSquare, Volume2, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

const VoiceAssistant = () => {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [reply, setReply] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const [statusMessage, setStatusMessage] = useState('');
    const [history, setHistory] = useState([]); // Conversation History
    const [isTraining, setIsTraining] = useState(false);
    const [trainingData, setTrainingData] = useState({});
    const [tempKey, setTempKey] = useState('');

    const recognitionRef = useRef(null);
    const synthRef = window.speechSynthesis;

    useEffect(() => {
        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error("Speech Recognition not supported in this browser.");
            setIsSupported(false);
            return;
        }

        console.log("Initializing Speech Recognition...");
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true; // Stay on while speaking
        recognitionRef.current.interimResults = true; // Show results as they come

        recognitionRef.current.onstart = () => {
            console.log("Speech recognition started");
            setIsListening(true);
            setStatusMessage('');
        };

        recognitionRef.current.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            if (finalTranscript) {
                console.log("Final Transcript:", finalTranscript);
                setTranscript(finalTranscript);
                handleVoiceCommand(finalTranscript);
            } else {
                setTranscript(interimTranscript); // Show interim results in bubble
            }
        };

        recognitionRef.current.onend = () => {
            console.log("Speech recognition ended");
            setIsListening(false);
        };

        recognitionRef.current.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            setIsListening(false);
            if (event.error === 'not-allowed') {
                setStatusMessage('Microphone access denied');
            } else if (event.error === 'no-speech') {
                setStatusMessage('No speech detected');
            } else {
                setStatusMessage('System error. Try again.');
            }
        };
    }, []);

    const speak = (text) => {
        if (!synthRef) return;

        // Stop listening while speaking to avoid feedback
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }

        // Cancel any ongoing speech
        synthRef.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = i18n.language === 'hi' ? 'hi-IN' : 'en-IN';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            // Optionally restart listening if needed, but manual trigger is safer
        };

        synthRef.speak(utterance);
    };

    // --- Precision Engine Utils ---
    const fuzzyMatch = (input, target, threshold = 0.7) => {
        const s1 = input.toLowerCase();
        const s2 = target.toLowerCase();
        if (s1 === s2) return true;

        let longer = s1;
        let shorter = s2;
        if (s1.length < s2.length) {
            longer = s2;
            shorter = s1;
        }

        if (longer.length === 0) return 1.0;

        const costs = [];
        for (let i = 0; i <= s1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= s2.length; j++) {
                if (i === 0) costs[j] = j;
                else {
                    if (j > 0) {
                        let newValue = costs[j - 1];
                        if (s1.charAt(i - 1) !== s2.charAt(j - 1))
                            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
            }
            if (i > 0) costs[s2.length] = lastValue;
        }
        const similarity = (longer.length - costs[s2.length]) / longer.length;
        return similarity >= threshold;
    };

    const handleVoiceCommand = (text) => {
        const input = text.toLowerCase().trim();
        setShowChat(true);

        // --- Training Mode Logic ---
        if (isTraining) {
            if (!tempKey) {
                setTempKey(input);
                const msg = i18n.language === 'hi' ? `ठीक है, जब आप "${input}" कहें, तो मुझे क्या कहना चाहिए?` : `Got it. When you say "${input}", what should I respond with?`;
                setReply(msg);
                speak(msg);
                return;
            } else {
                setTrainingData(prev => ({ ...prev, [tempKey]: input }));
                const msg = i18n.language === 'hi' ? "समझ गया! मैंने वह सीख लिया है।" : "Understood! I've learned that.";
                setReply(msg);
                speak(msg);
                setIsTraining(false);
                setTempKey('');
                return;
            }
        }

        if (input.includes('train') || input.includes('sikhana') || input.includes('seekhen')) {
            setIsTraining(true);
            const msg = i18n.language === 'hi' ? "प्रशिक्षण मोड शुरू। क्या सिखाना है?" : "Training mode started. What phrase should I learn?";
            setReply(msg);
            speak(msg);
            return;
        }

        // --- Check Training Data First ---
        if (trainingData[input]) {
            setReply(trainingData[input]);
            speak(trainingData[input]);
            return;
        }

        // --- Conversational Intelligence Engine (Personality & Small Talk) ---

        // 1. Greetings
        if (input.includes('hello') || input.includes('hi') || input.includes('namaste') || input.includes('salam') || input.includes('ram ram')) {
            const greetings = i18n.language === 'hi'
                ? [
                    "नमस्ते! मैं वज्र हूँ, आपका डिजिटल साथी। आज मैं आपकी क्या मदद कर सकता हूँ?",
                    "राम राम जी! धारा (DHARA) नेटवर्क में आपका स्वागत है।",
                    "नमस्ते! आपकी खेती कैसी चल रही है?"
                ]
                : [
                    "Hello! I am Vajra, your AI companion. How can I help you today?",
                    "Hi there! Welcome to the DHARA network. Ready to optimize your harvest?",
                    "Hello! It's great to talk to you. What's on your mind?"
                ];
            const msg = greetings[Math.floor(Math.random() * greetings.length)];
            setReply(msg);
            speak(msg);
            setHistory(prev => [...prev, { role: 'user', text: input }, { role: 'assistant', text: msg }]);
            return;
        }

        // 2. Identity / Who are you?
        if (input.includes('who are you') || input.includes('tum kaun ho') || input.includes('kaun ho') || input.includes('identity')) {
            const msg = i18n.language === 'hi'
                ? "मैं वज्र हूँ, जो धारा (DHARA) द्वारा बनाया गया एक एआई सहायक हूँ। मेरा काम भारतीय किसानों की मदद करना और खेती को आसान बनाना है।"
                : "I am Vajra, an AI assistant built by DHARA. My mission is to empower Indian farmers and make agriculture more efficient.";
            setReply(msg);
            speak(msg);
            return;
        }

        // 3. Status Check / How are you?
        if (input.includes('how are you') || input.includes('kaise ho') || input.includes('kya haal hai')) {
            const msg = i18n.language === 'hi'
                ? "मैं बहुत अच्छा हूँ और आपकी सेवा के लिए तैयार हूँ! आप कैसे हैं?"
                : "I'm doing great and ready to serve you! How are you doing today?";
            setReply(msg);
            speak(msg);
            return;
        }

        // --- Keywords for High-Precision Matching (Navigation & Info) ---
        const intents = [
            { id: 'dashboard', keys: ['dashboard', 'home', 'shuruat', 'mukhya', 'front', 'main', 'start'], path: user?.role?.toLowerCase() === 'operator' ? '/operator/dashboard' : '/farmer/dashboard', msg: i18n.language === 'hi' ? "डैशबोर्ड खुल रहा है।" : "Opening your dashboard." },
            { id: 'bookings', keys: ['booking', 'order', 'history', 'sauda', 'booked', 'mere orders', 'list'], path: user?.role?.toLowerCase() === 'operator' ? '/operator/dashboard' : '/farmer/bookings', msg: i18n.language === 'hi' ? "आपकी बुकिंग्स दिखा रहा हूँ।" : "Showing your bookings." },
            { id: 'assets', keys: ['tractor', 'machine', 'rent', 'kiraya', 'sadhan', 'equipment', 'harrow', 'cultivator', 'harvester'], path: '/farmer/assets', msg: i18n.language === 'hi' ? "आप यहाँ मशीनें ढूँढ सकते हैं।" : "You can search for machines here." },
            { id: 'maintenance', keys: ['maintenance', 'service', 'repair', 'marammat', 'checkup', 'fix'], path: '/operator/maintenance', msg: i18n.language === 'hi' ? "सर्विस रिकॉर्ड्स खुल रहे हैं।" : "Opening service records." },
            { id: 'money', keys: ['money', 'payment', 'paisa', 'bhugtan', 'earning', 'income', 'wallet'], msg: i18n.language === 'hi' ? "पेमेंट सुरक्षित हैं। काम पूरा होने पर पैसा ट्रांसफर हो जाएगा।" : "Payments are secure via Escrow. Funds are released after the task is completed." },
            { id: 'help', keys: ['help', 'madad', 'sahayata', 'support', 'kaise', 'how to'], msg: i18n.language === 'hi' ? "मैं आपकी नेविगेशन और सवालों में मदद कर सकता हूँ। कुछ भी पूछिए!" : "I can help you navigate and answer queries. Ask me anything!" }
        ];

        // Match Logic
        for (const intent of intents) {
            const hasMatch = intent.keys.some(key => {
                return input.includes(key) || fuzzyMatch(input, key, 0.85);
            });

            if (hasMatch) {
                if (intent.id === 'maintenance' && user?.role?.toLowerCase() !== 'operator') {
                    const errorMsg = i18n.language === 'hi' ? "यह सुविधा केवल मशीन मालिकों के लिए है।" : "This feature is for machine owners only.";
                    setReply(errorMsg);
                    speak(errorMsg);
                    return;
                }

                setReply(intent.msg);
                speak(intent.msg);
                if (intent.path) {
                    setTimeout(() => navigate(intent.path), 1500);
                }
                return;
            }
        }

        // Default 
        const defaultReply = i18n.language === 'hi' ? "माफ़ कीजिये, मुझे समझ नहीं आया। फिर से बोलिये?" : "I didn't quite get that. Could you repeat?";
        setReply(defaultReply);
        speak(defaultReply);
    };

    const toggleListening = () => {
        if (!isSupported) {
            setStatusMessage('Speech not supported in this browser');
            setShowChat(true);
            return;
        }

        if (isListening) {
            console.log("Stopping recognition manually...");
            recognitionRef.current?.stop();
        } else {
            console.log("Starting recognition...");
            setTranscript('');
            setReply('');
            setStatusMessage('Listening...');
            setShowChat(true);
            recognitionRef.current.lang = i18n.language === 'hi' ? 'hi-IN' : 'en-IN';

            try {
                recognitionRef.current?.start();
            } catch (err) {
                console.error("Failed to start recognition:", err);
                setStatusMessage('System busy. Try again.');
                setIsListening(false);
            }
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-[60] flex flex-col items-end gap-4">
            {/* Chat Bubble UI */}
            {showChat && (
                <div className="mb-2 w-72 md:w-80 bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white p-6 animate-fade-up overflow-hidden relative group">
                    <button
                        onClick={() => setShowChat(false)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={16} />
                    </button>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-widest">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Vajra AI Assistant {isTraining && <span className="text-red-500 ml-2 animate-pulse">(Training...)</span>}
                        </div>

                        {statusMessage && (
                            <div className="p-2 bg-amber-50 rounded-xl text-[10px] font-bold text-amber-700 leading-tight border border-amber-100 italic">
                                {statusMessage}
                            </div>
                        )}

                        {transcript && (
                            <div className="p-3 bg-slate-50 rounded-2xl text-xs font-bold text-slate-700 leading-relaxed border border-slate-100">
                                <span className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">You said:</span>
                                "{transcript}"
                            </div>
                        )}

                        {reply && (
                            <div className="p-4 bg-green-600 text-white rounded-2xl text-xs font-bold leading-relaxed shadow-lg shadow-green-600/20 border border-green-500">
                                <span className="text-[10px] text-green-100/70 block mb-1 uppercase tracking-wider">DHARA Assistant:</span>
                                {reply}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Main Mic Button with Pulse Orb */}
            <div className="relative">
                {!isSupported && (
                    <div className="absolute -top-12 right-0 bg-red-100 text-red-600 text-[8px] font-black uppercase px-2 py-1 rounded shadow-sm border border-red-200 whitespace-nowrap">
                        Not Supported
                    </div>
                )}
                {/* Animated Rings */}
                {isListening && (
                    <>
                        <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-25 scale-150" />
                        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20 scale-125" />
                    </>
                )}

                <button
                    onClick={toggleListening}
                    className={`
            relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 group
            ${isListening
                            ? 'bg-red-500 scale-110'
                            : isSpeaking
                                ? 'bg-blue-600'
                                : 'bg-green-600 hover:scale-105 active:scale-95'}
          `}
                >
                    {isListening ? (
                        <div className="flex gap-1 items-center justify-center">
                            <div className="w-1 h-4 bg-white rounded-full animate-[bounce_1s_infinite_0s]" />
                            <div className="w-1 h-6 bg-white rounded-full animate-[bounce_1s_infinite_0.1s]" />
                            <div className="w-1 h-3 bg-white rounded-full animate-[bounce_1s_infinite_0.2s]" />
                        </div>
                    ) : (
                        <Mic className="text-white group-hover:rotate-12 transition-transform" size={28} strokeWidth={2.5} />
                    )}

                    {/* Tooltip */}
                    <div className="absolute right-20 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-white/10">
                        {isListening ? "Listening..." : "Talk to DHARA"}
                    </div>
                </button>
            </div>
        </div>
    );
};

export default VoiceAssistant;
