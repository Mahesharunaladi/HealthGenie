'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { mlApi, patientApi } from '@/services/api';
import { User } from '@/types/auth';

interface Prediction {
    id: string;
    prediction_type: string;
    result: string;
    confidence_score: number;
    risk_level: string;
    status: string;
    created_at: string;
    doctor_notes?: string;
}

interface Profile {
    id: string;
    date_of_birth?: string;
    gender?: string;
    blood_group?: string;
    phone?: string;
    address?: string;
}

export default function PatientDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [loading, setLoading] = useState(true);

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

        setUser(userData);
        loadDashboardData();
    }, [router]);

    const loadDashboardData = async () => {
        try {
            const [profileData, predictionsData] = await Promise.all([
                patientApi.getProfile(),
                mlApi.getPredictions()
            ]);
            setProfile(profileData);
            setPredictions(predictionsData);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const getRiskColor = (risk: string) => {
        switch (risk.toLowerCase()) {
            case 'low': return 'text-green-600 bg-green-100';
            case 'moderate': return 'text-yellow-600 bg-yellow-100';
            case 'high': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved': return 'text-green-600 bg-green-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'rejected': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900">CuraGenie Patient Dashboard</h1>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-600">Welcome, {user?.full_name}</span>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Link href="/patient/predict/brain-tumor" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900">Brain Tumor Detection</h3>
                                <p className="text-sm text-gray-600">Upload MRI scan</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/patient/predict/diabetes" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900">Diabetes Risk</h3>
                                <p className="text-sm text-gray-600">Check your risk</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/patient/profile" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                                <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900">My Profile</h3>
                                <p className="text-sm text-gray-600">Update information</p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-sm font-medium text-gray-600">Total Predictions</div>
                        <div className="mt-2 text-3xl font-bold text-gray-900">{predictions.length}</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-sm font-medium text-gray-600">Pending Review</div>
                        <div className="mt-2 text-3xl font-bold text-yellow-600">
                            {predictions.filter(p => p.status === 'pending').length}
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-sm font-medium text-gray-600">Approved</div>
                        <div className="mt-2 text-3xl font-bold text-green-600">
                            {predictions.filter(p => p.status === 'approved').length}
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-sm font-medium text-gray-600">High Risk</div>
                        <div className="mt-2 text-3xl font-bold text-red-600">
                            {predictions.filter(p => p.risk_level === 'high').length}
                        </div>
                    </div>
                </div>

                {/* Recent Predictions */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">Recent Predictions</h2>
                    </div>
                    <div className="overflow-x-auto">
                        {predictions.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No predictions yet</h3>
                                <p className="mt-1 text-sm text-gray-500">Get started by creating your first prediction.</p>
                                <div className="mt-6">
                                    <Link href="/patient/predict/brain-tumor" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                                        New Prediction
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {predictions.map((prediction) => (
                                        <tr key={prediction.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {prediction.prediction_type.replace('_', ' ').toUpperCase()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {prediction.result}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(prediction.risk_level)}`}>
                                                    {prediction.risk_level}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {(prediction.confidence_score * 100).toFixed(1)}%
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(prediction.status)}`}>
                                                    {prediction.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(prediction.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Link href={`/patient/predictions/${prediction.id}`} className="text-blue-600 hover:text-blue-900">
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
