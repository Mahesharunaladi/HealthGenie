'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { mlApi } from '@/services/api';

interface PredictionResult {
    prediction_id: string;
    result: string;
    confidence_score: number;
    tumor_detected: boolean;
    risk_level: string;
    analysis: Record<string, any>;
    recommendations: string[];
}

export default function BrainTumorPrediction() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<PredictionResult | null>(null);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setResult(null);
            setError('');

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError('Please select an MRI image');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await mlApi.predictBrainTumor(file);
            setResult(response as PredictionResult);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Prediction failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (risk: string) => {
        switch (risk.toLowerCase()) {
            case 'low': return 'text-green-600 bg-green-100';
            case 'moderate': return 'text-yellow-600 bg-yellow-100';
            case 'high': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Link href="/patient/dashboard" className="text-blue-600 hover:text-blue-800">
                        ← Back to Dashboard
                    </Link>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Brain Tumor Detection</h1>
                        <p className="mt-2 text-gray-600">Upload an MRI scan for AI-powered analysis</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 text-red-800 rounded-md">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload MRI Scan
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition">
                                <div className="space-y-1 text-center">
                                    {preview ? (
                                        <img src={preview} alt="Preview" className="mx-auto h-48 object-contain" />
                                    ) : (
                                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                    <div className="flex text-sm text-gray-600">
                                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                            <span>Upload a file</span>
                                            <input
                                                type="file"
                                                className="sr-only"
                                                accept="image/*,.dcm,.nii"
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        PNG, JPG, DICOM, NIfTI up to 10MB
                                    </p>
                                </div>
                            </div>
                            {file && (
                                <p className="mt-2 text-sm text-gray-600">
                                    Selected: {file.name}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={!file || loading}
                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Analyzing...
                                </span>
                            ) : 'Analyze Scan'}
                        </button>
                    </form>

                    {result && (
                        <div className="mt-8 border-t pt-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Analysis Results</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-sm text-gray-600">Tumor Detected</div>
                                    <div className="text-2xl font-bold text-gray-900 mt-1">
                                        {result.tumor_detected ? 'Yes' : 'No'}
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-sm text-gray-600">Confidence Score</div>
                                    <div className="text-2xl font-bold text-gray-900 mt-1">
                                        {(result.confidence_score * 100).toFixed(1)}%
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-sm text-gray-600">Result</div>
                                    <div className="text-2xl font-bold text-gray-900 mt-1">
                                        {result.result}
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-sm text-gray-600">Risk Level</div>
                                    <div className="mt-1">
                                        <span className={`px-3 py-1 text-lg font-semibold rounded-full ${getRiskColor(result.risk_level)}`}>
                                            {result.risk_level}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {result.recommendations && result.recommendations.length > 0 && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 mb-2">Recommendations:</h3>
                                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                                        {result.recommendations.map((rec, index) => (
                                            <li key={index}>{rec}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="mt-6 flex space-x-4">
                                <Link
                                    href={`/patient/predictions/${result.prediction_id}`}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    View Full Report
                                </Link>
                                <button
                                    onClick={() => {
                                        setFile(null);
                                        setPreview('');
                                        setResult(null);
                                    }}
                                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                >
                                    New Analysis
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Medical Disclaimer</h3>
                    <p className="text-sm text-yellow-800">
                        This AI analysis is for informational purposes only and should not replace professional medical advice,
                        diagnosis, or treatment. Always consult with a qualified healthcare provider for medical decisions.
                    </p>
                </div>
            </div>
        </div>
    );
}
