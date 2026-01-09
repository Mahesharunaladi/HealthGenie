'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { mlApi } from '@/services/api';

interface DiabetesData {
    pregnancies: number;
    glucose_level: number;
    blood_pressure: number;
    skin_thickness: number;
    insulin: number;
    bmi: number;
    diabetes_pedigree: number;
    age: number;
}

interface PredictionResult {
    prediction_id: string;
    result: string;
    probability: number;
    risk_level: string;
    risk_factors: string[];
    recommendations: string[];
}

export default function DiabetesPrediction() {
    const router = useRouter();
    const [formData, setFormData] = useState<DiabetesData>({
        pregnancies: 0,
        glucose_level: 0,
        blood_pressure: 0,
        skin_thickness: 0,
        insulin: 0,
        bmi: 0,
        diabetes_pedigree: 0,
        age: 0
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<PredictionResult | null>(null);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: parseFloat(value) || 0
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await mlApi.predictDiabetes(formData);
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
                        <h1 className="text-3xl font-bold text-gray-900">Diabetes Risk Assessment</h1>
                        <p className="mt-2 text-gray-600">Enter your clinical data for risk prediction</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 text-red-800 rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Number of Pregnancies
                                </label>
                                <input
                                    type="number"
                                    name="pregnancies"
                                    min="0"
                                    max="20"
                                    required
                                    value={formData.pregnancies}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Glucose Level (mg/dL)
                                </label>
                                <input
                                    type="number"
                                    name="glucose_level"
                                    min="0"
                                    max="300"
                                    required
                                    value={formData.glucose_level}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Blood Pressure (mm Hg)
                                </label>
                                <input
                                    type="number"
                                    name="blood_pressure"
                                    min="0"
                                    max="200"
                                    required
                                    value={formData.blood_pressure}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Skin Thickness (mm)
                                </label>
                                <input
                                    type="number"
                                    name="skin_thickness"
                                    min="0"
                                    max="100"
                                    required
                                    value={formData.skin_thickness}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Insulin (μU/mL)
                                </label>
                                <input
                                    type="number"
                                    name="insulin"
                                    min="0"
                                    max="900"
                                    required
                                    value={formData.insulin}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    BMI (Body Mass Index)
                                </label>
                                <input
                                    type="number"
                                    name="bmi"
                                    min="0"
                                    max="70"
                                    step="0.1"
                                    required
                                    value={formData.bmi}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Diabetes Pedigree Function
                                </label>
                                <input
                                    type="number"
                                    name="diabetes_pedigree"
                                    min="0"
                                    max="3"
                                    step="0.001"
                                    required
                                    value={formData.diabetes_pedigree}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Age (years)
                                </label>
                                <input
                                    type="number"
                                    name="age"
                                    min="1"
                                    max="120"
                                    required
                                    value={formData.age}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
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
                            ) : 'Predict Risk'}
                        </button>
                    </form>

                    {result && (
                        <div className="mt-8 border-t pt-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Assessment Results</h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-sm text-gray-600">Result</div>
                                    <div className="text-2xl font-bold text-gray-900 mt-1">
                                        {result.result}
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-sm text-gray-600">Probability</div>
                                    <div className="text-2xl font-bold text-gray-900 mt-1">
                                        {(result.probability * 100).toFixed(1)}%
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

                            {result.risk_factors && result.risk_factors.length > 0 && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                    <h3 className="font-semibold text-gray-900 mb-2">Risk Factors:</h3>
                                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                                        {result.risk_factors.map((factor, index) => (
                                            <li key={index}>{factor}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

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
                                    onClick={() => setResult(null)}
                                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                >
                                    New Assessment
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Medical Disclaimer</h3>
                    <p className="text-sm text-yellow-800">
                        This risk assessment is for informational purposes only and should not replace professional medical advice,
                        diagnosis, or treatment. Always consult with a qualified healthcare provider for medical decisions.
                    </p>
                </div>
            </div>
        </div>
    );
}
