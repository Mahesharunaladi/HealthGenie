'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

export default function AIChatbot() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        // Check authentication
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }

        // Generate session ID
        setSessionId(`session_${Date.now()}`);

        // Add welcome message
        setMessages([{
            id: '1',
            role: 'assistant',
            content: `Hello! I'm HealthGenie AI, your medical assistant. I'm here to help answer your health questions and provide information.

I can help you with:
• General health information
• Understanding medical conditions
• Explaining symptoms
• Preventive care tips
• Medication information

**Important:** I cannot diagnose conditions or replace professional medical care. For emergencies, please call emergency services immediately.

How can I assist you today?`,
            timestamp: new Date()
        }]);
    }, [router]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://localhost:8000/api/v1/chatbot/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: input,
                    session_id: sessionId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response,
                timestamp: new Date(data.timestamp)
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again or contact support if the issue persists.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const quickQuestions = [
        "What are the symptoms of diabetes?",
        "How can I lower my blood pressure?",
        "What is a healthy heart rate?",
        "Tell me about brain tumors",
        "How to manage stress?"
    ];

    const handleQuickQuestion = (question: string) => {
        setInput(question);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-xl">🤖</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">HealthGenie AI Assistant</h1>
                                <p className="text-sm text-gray-600">Your 24/7 medical information companion</p>
                            </div>
                        </div>
                        <Link
                            href="/patient/dashboard"
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
                        >
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>

                {/* Quick Questions */}
                {messages.length === 1 && (
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Questions:</h3>
                        <div className="flex flex-wrap gap-2">
                            {quickQuestions.map((question, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleQuickQuestion(question)}
                                    className="px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition"
                                >
                                    {question}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Chat Messages */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-4 h-[500px] overflow-y-auto">
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg p-4 ${message.role === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-900'
                                        }`}
                                >
                                    <div className="whitespace-pre-wrap">{message.content}</div>
                                    <div
                                        className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                                            }`}
                                    >
                                        {new Date(message.timestamp).toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 rounded-lg p-4">
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex space-x-3">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your health question here... (Press Enter to send)"
                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={3}
                            disabled={loading}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition self-end"
                        >
                            {loading ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                    <div className="mt-3 text-xs text-gray-500 text-center">
                        ⚠️ This AI assistant provides general information only. Always consult healthcare professionals for medical advice.
                    </div>
                </div>
            </div>
        </div>
    );
}
