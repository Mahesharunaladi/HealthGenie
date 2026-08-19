'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { mlApi } from '@/services/api';

interface PredictionDetail {
    id: string;
    prediction_type: string;
    result: string;
    confidence_score: number;
    risk_level: string;
    status: string;
    created_at: string;
    doctor_notes?: string;
    detailed_analysis?: Record<string, any>;
    input_data?: Record<string, any>;
    recommendations?: string[];
}

export default function PatientPredictionDetailPage() {
    const router = useRouter();
    const params = useParams();
    const predictionId = params.id as string;

    const [prediction, setPrediction] = useState<PredictionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }

        const userData = JSON.parse(storedUser);
        if (userData.role !== 'patient') {
            router.push('/doctor/dashboard');
            return;
        }

        loadPredictionDetail();
    }, [predictionId, router]);

    const loadPredictionDetail = async () => {
        try {
            setLoading(true);
            const data = await mlApi.getPrediction(predictionId);
            setPrediction(data as PredictionDetail);
        } catch (err: any) {
            setError('Failed to load prediction details');
            console.error('Error loading prediction:', err);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (risk: string) => {
        switch (risk?.toLowerCase()) {
            case 'low': return 'text-green-600 bg-green-50 border-green-200';
            case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'high': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'text-green-600 bg-green-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'rejected': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading prediction details...</p>
                </div>
            </div>
        );
    }

    if (!prediction) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto py-8 px-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <h2 className="text-2xl font-bold text-red-800 mb-2">Prediction Not Found</h2>
                        <p className="text-red-600 mb-4">{error || 'The prediction you are looking for does not exist.'}</p>
                        <Link href="/patient/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link href="/patient/dashboard" className="text-blue-600 hover:text-blue-800 font-medium mb-4 block">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Prediction Results</h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-md border border-red-200">
                        {error}
                    </div>
                )}

                <div className="bg-white shadow rounded-lg p-8 space-y-8">
                    {/* Prediction Summary */}
                    <div className="border-b pb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Prediction Summary</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-gray-600 mb-1">Prediction Type</p>
                                <p className="text-lg font-semibold text-gray-900 capitalize">
                                    {prediction.prediction_type?.replace('_', ' ')}
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(prediction.status)}`}>
                                    {prediction.status?.charAt(0).toUpperCase() + prediction.status?.slice(1)}
                                </span>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-gray-600 mb-1">Risk Level</p>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getRiskColor(prediction.risk_level)}`}>
                                    {prediction.risk_level?.charAt(0).toUpperCase() + prediction.risk_level?.slice(1)}
                                </span>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-gray-600 mb-1">Confidence Score</p>
                                <div className="flex items-center space-x-2">
                                    <div className="flex-1 bg-gray-300 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${(prediction.confidence_score || 0) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-lg font-semibold text-gray-900">
                                        {((prediction.confidence_score || 0) * 100).toFixed(1)}%
                                    </span>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                                <p className="text-sm font-medium text-gray-600 mb-1">Prediction Result</p>
                                <p className="text-lg font-semibold text-gray-900">{prediction.result}</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                                <p className="text-sm font-medium text-gray-600 mb-1">Created At</p>
                                <p className="text-gray-700">{new Date(prediction.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Analysis */}
                    {prediction.detailed_analysis && Object.keys(prediction.detailed_analysis).length > 0 && (
                        <div className="border-b pb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Detailed Analysis</h2>
                            <div className="space-y-4">
                                {Object.entries(prediction.detailed_analysis).map(([key, value]) => (
                                    <div key={key} className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                                        <p className="text-sm font-medium text-blue-900 mb-1 capitalize">
                                            {key.replace('_', ' ')}
                                        </p>
                                        <p className="text-blue-700">
                                            {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recommendations */}
                    {prediction.recommendations && prediction.recommendations.length > 0 && (
                        <div className="border-b pb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recommendations</h2>
                            <div className="space-y-3">
                                {prediction.recommendations.map((rec, idx) => (
                                    <div key={idx} className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-start">
                                        <div className="flex-shrink-0 mt-0.5">
                                            <div className="flex items-center justify-center h-5 w-5 rounded-full bg-green-600 text-white text-sm font-semibold">
                                                ✓
                                            </div>
                                        </div>
                                        <p className="ml-3 text-green-700">{rec}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Data */}
                    {prediction.input_data && Object.keys(prediction.input_data).length > 0 && (
                        <div className="border-b pb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Input Data</h2>
                            <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                                <pre className="text-sm text-gray-700">
                                    {JSON.stringify(prediction.input_data, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}

                    {/* Doctor Review Section */}
                    {prediction.status !== 'pending' && (
                        <div className={`${prediction.status === 'approved' ? 'bg-green-50 border-2 border-green-200' : prediction.status === 'rejected' ? 'bg-red-50 border-2 border-red-200' : 'bg-yellow-50 border-2 border-yellow-200'} p-8 rounded-lg`}>
                            <h2 className={`text-xl font-semibold mb-4 ${prediction.status === 'approved' ? 'text-green-900' : prediction.status === 'rejected' ? 'text-red-900' : 'text-yellow-900'}`}>
                                Doctor Review: {prediction.status?.charAt(0).toUpperCase() + prediction.status?.slice(1)}
                            </h2>
                            {prediction.doctor_notes && (
                                <div className={`${prediction.status === 'approved' ? 'text-green-700' : prediction.status === 'rejected' ? 'text-red-700' : 'text-yellow-700'}`}>
                                    <p className="font-semibold mb-2">Doctor Notes:</p>
                                    <p>{prediction.doctor_notes}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {prediction.status === 'pending' && (
                        <div className="bg-yellow-50 border-2 border-yellow-200 p-8 rounded-lg">
                            <h2 className="text-xl font-semibold text-yellow-900 mb-2">Pending Doctor Review</h2>
                            <p className="text-yellow-700">A healthcare professional is currently reviewing your prediction. You will be notified when the review is complete.</p>
                        </div>
                    )}

                    {/* Back to Dashboard */}
                    <div className="pt-6">
                        <Link
                            href="/patient/dashboard"
                            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
