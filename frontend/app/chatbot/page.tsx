'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Camera, Mic, MicOff } from 'lucide-react';

interface ClinicOption {
    id: string;
    label: string;
}

interface ClinicState {
    complete?: boolean;
    question?: string;
    options?: ClinicOption[];
    multi?: boolean;
    step_index?: number;
    total_steps?: number;
    urgency?: string;
    likely_condition?: string;
    title?: string;
    care_plan?: {
        do_now?: string[];
        avoid?: string[];
        red_flags?: string[];
        otc_options?: { name: string; use: string; note: string }[];
        recovery?: string;
    };
    spoken?: string;
}

interface RashFinding {
    condition: string;
    confidence: number;
    summary: string;
    likely_causes: string[];
    home_care: string[];
    avoid: string[];
    see_doctor_if: string[];
    urgency: string;
}

interface RashResult {
    primary_condition: string;
    urgency: string;
    confidence: number;
    findings: RashFinding[];
    care_plan: { do_now: string[]; avoid: string[]; red_flags: string[] };
    quality_notes: string[];
    disclaimer: string;
    spoken_summary: string;
}

interface FirstAidCard {
    id: string;
    title: string;
    urgency: string;
    steps: string[];
}

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    imageUrl?: string;
    rash?: RashResult;
    clinic?: ClinicState;
    firstAid?: FirstAidCard[];
    urgency?: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AIChatbot() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const [listening, setListening] = useState(false);
    const [speakReplies, setSpeakReplies] = useState(true);
    const [micSupported, setMicSupported] = useState(false);
    const [clinic, setClinic] = useState<ClinicState | null>(null);
    const [picked, setPicked] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<any>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }

        setSessionId(`session_${Date.now()}`);
        const speechWindow = window as any;
        setMicSupported(!!(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition));

        setMessages([{
            id: '1',
            role: 'assistant',
            content: `Hello! I'm HealthGenie AI. I can **talk with you**, screen a **rash photo**, and guide **cold and cough** home care.

I can help with:
• Voice chat — tap the mic, then I speak the answer
• Rash photo screening and precautions
• Step-by-step cold / cough clinic
• First-aid cards

**Important:** I cannot diagnose or replace a doctor. For emergencies, call local emergency services.

How can I help you today?`,
            timestamp: new Date()
        }]);
    }, [router]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    useEffect(() => {
        return () => {
            window.speechSynthesis?.cancel();
            recognitionRef.current?.stop?.();
        };
    }, []);

    const speak = (text?: string) => {
        if (!speakReplies || !text || typeof window === 'undefined' || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text.replace(/\*\*/g, ''));
        utterance.rate = 0.96;
        utterance.pitch = 1;
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find((v) => /en-(IN|US|GB)/i.test(v.lang) && /female|natural|samantha|google/i.test(v.name))
            || voices.find((v) => v.lang.startsWith('en'));
        if (preferred) utterance.voice = preferred;
        window.speechSynthesis.speak(utterance);
    };

    const token = () => localStorage.getItem('access_token') || '';

    const pushAssistant = (payload: {
        response: string;
        spoken_text?: string;
        rash?: RashResult;
        clinic?: ClinicState;
        first_aid?: FirstAidCard[];
        urgency?: string;
        imageUrl?: string;
    }, userContent?: string, userImage?: string) => {
        const now = Date.now();
        const next: Message[] = [];
        if (userContent) {
            next.push({
                id: String(now),
                role: 'user',
                content: userContent,
                timestamp: new Date(),
                imageUrl: userImage,
            });
        }
        next.push({
            id: String(now + 1),
            role: 'assistant',
            content: payload.response,
            timestamp: new Date(),
            rash: payload.rash,
            clinic: payload.clinic,
            firstAid: payload.first_aid,
            urgency: payload.urgency,
        });
        setMessages((prev) => [...prev, ...next]);
        if (payload.clinic && !payload.clinic.complete) {
            setClinic(payload.clinic);
            setPicked([]);
        } else if (payload.clinic?.complete) {
            setClinic(null);
            setPicked([]);
        }
        speak(payload.spoken_text || payload.clinic?.spoken || payload.response);
    };

    const sendMessage = async (raw?: string) => {
        const text = (raw ?? input).trim();
        if (!text || loading) return;

        setInput('');
        setLoading(true);
        window.speechSynthesis?.cancel();

        setMessages((prev) => [...prev, {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: new Date()
        }]);

        try {
            const response = await fetch(`${API}/api/v1/chatbot/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token()}`,
                },
                body: JSON.stringify({ message: text, session_id: sessionId, speak: speakReplies }),
            });
            if (!response.ok) throw new Error('Failed to get response');
            const data = await response.json();
            setMessages((prev) => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response,
                timestamp: new Date(data.timestamp),
                clinic: data.clinic,
                firstAid: data.first_aid,
                urgency: data.urgency,
            }]);
            if (data.clinic && !data.clinic.complete) {
                setClinic(data.clinic);
                setPicked([]);
            } else {
                setClinic(null);
            }
            speak(data.spoken_text || data.response);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages((prev) => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Sorry, I could not reach the health assistant. Check that the backend is running on port 8000.',
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const toggleMic = () => {
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) {
            alert('Speech recognition is not supported in this browser. Try Chrome or Edge.');
            return;
        }
        if (listening) {
            recognitionRef.current?.stop();
            setListening(false);
            return;
        }
        const recognition = new SR();
        recognition.lang = 'en-IN';
        recognition.interimResults = false;
        recognition.continuous = false;
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            sendMessage(transcript);
        };
        recognition.onerror = () => setListening(false);
        recognition.onend = () => setListening(false);
        recognitionRef.current = recognition;
        recognition.start();
        setListening(true);
    };

    const onRashFile = async (file: File) => {
        if (!file.type.startsWith('image/')) return;
        const preview = URL.createObjectURL(file);
        setLoading(true);
        setMessages((prev) => [...prev, {
            id: Date.now().toString(),
            role: 'user',
            content: 'Please screen this rash photo and tell me what it might be, plus precautions.',
            timestamp: new Date(),
            imageUrl: preview,
        }]);
        try {
            const form = new FormData();
            form.append('file', file);
            form.append('session_id', sessionId);
            const response = await fetch(`${API}/api/v1/chatbot/analyze-rash`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token()}` },
                body: form,
            });
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.detail || 'Upload failed');
            }
            const data = await response.json();
            setMessages((prev) => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response,
                timestamp: new Date(),
                rash: data.rash,
                urgency: data.urgency,
            }]);
            speak(data.spoken_text);
        } catch (error: any) {
            setMessages((prev) => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: error.message || 'I could not read that photo. Please try a closer, brighter picture.',
                timestamp: new Date(),
            }]);
        } finally {
            setLoading(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    const submitClinic = async () => {
        if (!picked.length || loading) return;
        setLoading(true);
        try {
            const response = await fetch(`${API}/api/v1/chatbot/symptom-check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token()}`,
                },
                body: JSON.stringify({ session_id: sessionId, selected: picked }),
            });
            if (!response.ok) throw new Error('Clinic step failed');
            const data = await response.json();
            pushAssistant(data, picked.map((id) => clinic?.options?.find((o) => o.id === id)?.label || id).join(', '));
        } catch {
            setMessages((prev) => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: 'The symptom clinic had a problem. You can type your symptoms instead.',
                timestamp: new Date(),
            }]);
        } finally {
            setLoading(false);
        }
    };

    const startMode = (prompt: string) => sendMessage(prompt);

    const toggleOption = (id: string) => {
        if (clinic?.multi) {
            if (id === 'none') {
                setPicked(['none']);
                return;
            }
            setPicked((prev) => {
                const withoutNone = prev.filter((x) => x !== 'none');
                return withoutNone.includes(id) ? withoutNone.filter((x) => x !== id) : [...withoutNone, id];
            });
        } else {
            setPicked([id]);
        }
    };

    const quickActions = [
        { label: 'Cold & cough clinic', prompt: 'I have a cold and cough, please guide me' },
        { label: 'I have a rash', prompt: 'I have a skin rash, how do I scan it?' },
        { label: 'First aid', prompt: 'Show me first aid cards' },
        { label: 'Fever at home', prompt: 'How should I treat a mild fever at home?' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 p-4">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 border border-slate-100">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center shadow">
                                <span className="text-white text-xl">🩺</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">HealthGenie Voice Clinic</h1>
                                <p className="text-sm text-gray-600">Talk • Scan rashes • Cold & cough care</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    setSpeakReplies((v) => {
                                        if (v) window.speechSynthesis?.cancel();
                                        return !v;
                                    });
                                }}
                                className={`px-3 py-2 text-sm rounded-lg border ${speakReplies ? 'bg-teal-50 border-teal-300 text-teal-800' : 'bg-gray-50 text-gray-600'}`}
                            >
                                {speakReplies ? '🔊 Voice on' : '🔇 Voice off'}
                            </button>
                            <Link href="/patient/dashboard" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                                ← Dashboard
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {quickActions.map((action) => (
                        <button
                            key={action.label}
                            onClick={() => startMode(action.prompt)}
                            className="bg-white rounded-xl p-3 text-left shadow-sm hover:shadow border border-slate-100 text-sm font-medium text-slate-800"
                        >
                            {action.label}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 h-[520px] overflow-y-auto border border-slate-100">
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[88%] rounded-2xl p-4 ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-gray-900'}`}>
                                    {message.imageUrl && (
                                        <img src={message.imageUrl} alt="Uploaded skin photo" className="rounded-lg mb-3 max-h-48 object-cover" />
                                    )}
                                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                                    {message.rash && <RashCard rash={message.rash} />}
                                    {message.clinic?.complete && message.clinic.care_plan && (
                                        <CarePlan plan={message.clinic} />
                                    )}
                                    {message.firstAid && (
                                        <div className="mt-3 grid gap-2">
                                            {message.firstAid.map((card) => (
                                                <div key={card.id} className="bg-white rounded-xl p-3 text-slate-800 border">
                                                    <div className="font-semibold flex justify-between">
                                                        {card.title}
                                                        <UrgencyBadge level={card.urgency} />
                                                    </div>
                                                    <ol className="list-decimal ml-4 mt-2 text-sm space-y-1">
                                                        {card.steps.map((step) => <li key={step}>{step}</li>)}
                                                    </ol>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                                        {new Date(message.timestamp).toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 rounded-lg p-4">
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {clinic && !clinic.complete && (
                    <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 border border-teal-100">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-teal-800">
                                Cold & cough clinic · step {(clinic.step_index || 0) + 1} of {clinic.total_steps}
                            </p>
                            <button className="text-xs text-gray-500" onClick={() => setClinic(null)}>Close</button>
                        </div>
                        <p className="text-gray-900 mb-3">{clinic.question}</p>
                        <div className="flex flex-wrap gap-2">
                            {clinic.options?.map((option) => {
                                const active = picked.includes(option.id);
                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => toggleOption(option.id)}
                                        className={`px-3 py-2 rounded-full text-sm border ${active ? 'bg-teal-600 text-white border-teal-600' : 'bg-teal-50 text-teal-900 border-teal-100'}`}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={submitClinic}
                            disabled={!picked.length || loading}
                            className="mt-3 px-4 py-2 bg-teal-600 text-white rounded-lg disabled:bg-gray-300"
                        >
                            {clinic.multi ? 'Continue' : 'Next'}
                        </button>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100">
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onRashFile(file);
                        }}
                    />
                    <div className="flex space-x-3 items-end">
                        <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            className="px-3 py-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-100"
                            title="Upload rash photo"
                        >
                            <Camera className="h-5 w-5" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            onClick={toggleMic}
                            className={`px-3 py-3 rounded-xl border ${listening ? 'bg-red-600 text-white animate-pulse' : 'bg-indigo-50 text-indigo-800 border-indigo-100'}`}
                            title="Speak to the assistant"
                        >
                            {listening ? <MicOff className="h-5 w-5" aria-hidden="true" /> : <Mic className="h-5 w-5" aria-hidden="true" />}
                        </button>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                            placeholder={listening ? 'Listening… speak your symptoms' : 'Type, tap the mic to talk, or upload a rash photo…'}
                            className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={2}
                            disabled={loading}
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={loading || !input.trim()}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 self-end"
                        >
                            Send
                        </button>
                    </div>
                    <p className="mt-3 text-xs text-gray-500 text-center">
                        Voice replies {speakReplies ? 'are on' : 'are off'}. {micSupported ? 'Microphone is available.' : 'Use Chrome for voice input.'} Screening only — not a diagnosis.
                    </p>
                </div>
            </div>
        </div>
    );
}

function UrgencyBadge({ level }: { level: string }) {
    const map: Record<string, string> = {
        green: 'bg-emerald-100 text-emerald-800',
        yellow: 'bg-amber-100 text-amber-800',
        red: 'bg-red-100 text-red-800',
    };
    return <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${map[level] || map.green}`}>{level}</span>;
}

function RashCard({ rash }: { rash: RashResult }) {
    return (
        <div className="mt-3 space-y-2">
            <div className="bg-white rounded-xl p-3 text-slate-800 border">
                <div className="flex justify-between items-start gap-2">
                    <div>
                        <p className="text-xs text-slate-500">Most likely pattern</p>
                        <p className="font-semibold">{rash.primary_condition}</p>
                    </div>
                    <div className="text-right">
                        <UrgencyBadge level={rash.urgency} />
                        <p className="text-xs text-slate-500 mt-1">{Math.round(rash.confidence * 100)}% match</p>
                    </div>
                </div>
            </div>
            {rash.findings.map((finding) => (
                <div key={finding.condition} className="bg-white rounded-xl p-3 text-slate-800 border">
                    <p className="font-medium">{finding.condition} · {Math.round(finding.confidence * 100)}%</p>
                    <p className="text-sm mt-1 text-slate-600">{finding.summary}</p>
                    <p className="text-xs font-semibold mt-2">Home care</p>
                    <ul className="text-sm list-disc ml-4">
                        {finding.home_care.slice(0, 3).map((item) => <li key={item}>{item}</li>)}
                    </ul>
                </div>
            ))}
            <p className="text-xs text-slate-500">{rash.quality_notes.join(' ')}</p>
        </div>
    );
}

function CarePlan({ plan }: { plan: ClinicState }) {
    const care = plan.care_plan;
    if (!care) return null;
    return (
        <div className="mt-3 bg-white rounded-xl p-3 text-slate-800 border space-y-2">
            <div className="flex justify-between">
                <p className="font-semibold">{plan.title}</p>
                {plan.urgency && <UrgencyBadge level={plan.urgency} />}
            </div>
            <p className="text-sm text-slate-600">{plan.likely_condition}</p>
            {care.otc_options && (
                <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">Pharmacist options (not a prescription)</p>
                    {care.otc_options.map((otc) => (
                        <p key={otc.name} className="text-sm mt-1"><strong>{otc.name}</strong> — {otc.use}. {otc.note}</p>
                    ))}
                </div>
            )}
        </div>
    );
}
