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

    const recognitionRef = useRef(null);
    const synthRef = window.speechSynthesis;

    useEffect(() => {
        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onresult = (event) => {
                const currentTranscript = event.results[0][0].transcript;
                setTranscript(currentTranscript);
                handleVoiceCommand(currentTranscript);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                setIsListening(false);
            };
        }
    }, []);

    const speak = (text) => {
        if (!synthRef) return;

        // Cancel any ongoing speech
        synthRef.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = i18n.language === 'hi' ? 'hi-IN' : 'en-IN';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);

        synthRef.speak(utterance);
    };

    const handleVoiceCommand = (text) => {
        const input = text.toLowerCase();
        setShowChat(true);

        // --- Intelligence Engine: Intent Parsing ---

        // 1. Navigation Commands
        if (input.includes('dashboard') || input.includes('home') || input.includes('shuruat')) {
            const path = user?.role?.toLowerCase() === 'operator' ? '/operator/dashboard' : '/farmer/dashboard';
            setReply(i18n.language === 'hi' ? "Dashboard khul raha hai." : "Opening your dashboard.");
            speak(i18n.language === 'hi' ? "Dashboard khul raha hai." : "Opening your dashboard.");
            setTimeout(() => navigate(path), 1500);
            return;
        }

        if (input.includes('booking') || input.includes('order')) {
            const path = user?.role?.toLowerCase() === 'operator' ? '/operator/dashboard' : '/farmer/bookings';
            setReply(i18n.language === 'hi' ? "Aapki bookings dikha raha hoon." : "Showing your bookings.");
            speak(i18n.language === 'hi' ? "Aapki bookings dikha raha hoon." : "Showing your bookings.");
            setTimeout(() => navigate(path), 1500);
            return;
        }

        if (input.includes('tractor') || input.includes('machine') || input.includes('rent')) {
            setReply(i18n.language === 'hi' ? "Aap yahan machines dhoond sakte hain." : "You can search for machines here.");
            speak(i18n.language === 'hi' ? "Aap yahan machines dhoond sakte hain." : "You can search for machines here.");
            setTimeout(() => navigate('/farmer/assets'), 1500);
            return;
        }

        if (input.includes('maintenance') || input.includes('service') || input.includes('repair')) {
            if (user?.role?.toLowerCase() === 'operator') {
                setReply(i18n.language === 'hi' ? "Service records khul rahe hain." : "Opening service records.");
                speak(i18n.language === 'hi' ? "Service records khul rahe hain." : "Opening service records.");
                setTimeout(() => navigate('/operator/maintenance'), 1500);
            } else {
                setReply("This feature is for machine owners only.");
                speak("This feature is for machine owners only.");
            }
            return;
        }

        // 2. Problem Solving / Info
        if (input.includes('money') || input.includes('payment') || input.includes('paisa')) {
            setReply(i18n.language === 'hi' ? "Payments safe hain. Kaam poora hone par paisa transfer ho jayega." : "Payments are secure via Escrow. Funds are released after the task is completed.");
            speak(i18n.language === 'hi' ? "Payments safe hain. Kaam poora hone par paisa transfer ho jayega." : "Payments are secure via Escrow. Funds are released after the task is completed.");
            return;
        }

        if (input.includes('help') || input.includes('madad')) {
            setReply(i18n.language === 'hi' ? "Main aapki navigation aur queries mein madad kar sakta hoon. Kuch bhi puchiye!" : "I can help you navigate and answer queries. Ask me anything!");
            speak(i18n.language === 'hi' ? "Main aapki navigation aur queries mein madad kar sakta hoon. Kuch bhi puchiye!" : "I can help you navigate and answer queries. Ask me anything!");
            return;
        }

        // Default 
        const defaultReply = i18n.language === 'hi' ? "Maaf kijiye, mujhe samajh nahi aaya. Phir se boliye?" : "I didn't quite get that. Could you repeat?";
        setReply(defaultReply);
        speak(defaultReply);
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            setTranscript('');
            setReply('');
            recognitionRef.current.lang = i18n.language === 'hi' ? 'hi-IN' : 'en-IN';
            recognitionRef.current?.start();
            setIsListening(true);
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
                            Vajra AI Assistant
                        </div>

                        {transcript && (
                            <div className="p-3 bg-slate-50 rounded-2xl text-xs font-bold text-slate-700 leading-relaxed">
                                <span className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">You said:</span>
                                "{transcript}"
                            </div>
                        )}

                        {reply && (
                            <div className="p-4 bg-green-600 text-white rounded-2xl text-xs font-bold leading-relaxed shadow-lg shadow-green-600/20">
                                <span className="text-[10px] text-green-100/70 block mb-1 uppercase tracking-wider">DHARA Assistant:</span>
                                {reply}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Main Mic Button with Pulse Orb */}
            <div className="relative">
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
