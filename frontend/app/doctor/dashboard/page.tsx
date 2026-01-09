'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { mlApi, doctorApi } from '@/services/api';
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
    patient_id: string;
}

interface Profile {
    id: string;
    specialization?: string;
    license_number?: string;
    years_of_experience?: number;
    phone?: string;
    bio?: string;
}

export default function DoctorDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
    const [reviewNotes, setReviewNotes] = useState('');
    const [showReviewModal, setShowReviewModal] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }

        const userData = JSON.parse(storedUser);
        if (userData.role !== 'doctor') {
            router.push('/patient/dashboard');
            return;
        }

        setUser(userData);
        loadDashboardData();
    }, [router]);

    const loadDashboardData = async () => {
        try {
            const [profileData, predictionsData] = await Promise.all([
                doctorApi.getProfile(),
                mlApi.getPredictions()
            ]);
            setProfile(profileData as Profile);
            setPredictions(predictionsData as Prediction[]);
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

    const openReviewModal = (prediction: Prediction) => {
        setSelectedPrediction(prediction);
        setReviewNotes(prediction.doctor_notes || '');
        setShowReviewModal(true);
    };

    const handleReview = async (approve: boolean) => {
        if (!selectedPrediction) return;

        try {
            await doctorApi.reviewPrediction(selectedPrediction.id, reviewNotes, approve);
            await loadDashboardData();
            setShowReviewModal(false);
            setSelectedPrediction(null);
            setReviewNotes('');
        } catch (error) {
            console.error('Error reviewing prediction:', error);
            alert('Failed to review prediction');
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
                        <h1 className="text-2xl font-bold text-gray-900">CuraGenie Doctor Dashboard</h1>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-600">Dr. {user?.full_name}</span>
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
                {/* Quick Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900">Specialization</h3>
                                <p className="text-sm text-gray-600">{profile?.specialization || 'Not set'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900">Experience</h3>
                                <p className="text-sm text-gray-600">{profile?.years_of_experience || 0} years</p>
                            </div>
                        </div>
                    </div>

                    <Link href="/doctor/profile" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
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
                        <div className="text-sm font-medium text-gray-600">Total Cases</div>
                        <div className="mt-2 text-3xl font-bold text-gray-900">{predictions.length}</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-sm font-medium text-gray-600">Pending Review</div>
                        <div className="mt-2 text-3xl font-bold text-yellow-600">
                            {predictions.filter(p => p.status === 'pending').length}
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-sm font-medium text-gray-600">Reviewed</div>
                        <div className="mt-2 text-3xl font-bold text-green-600">
                            {predictions.filter(p => p.status !== 'pending').length}
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-sm font-medium text-gray-600">High Risk Cases</div>
                        <div className="mt-2 text-3xl font-bold text-red-600">
                            {predictions.filter(p => p.risk_level === 'high').length}
                        </div>
                    </div>
                </div>

                {/* Predictions Table */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-900">Patient Predictions</h2>
                        <div className="flex space-x-2">
                            <button className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                                All
                            </button>
                            <button className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                                Pending
                            </button>
                            <button className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                                High Risk
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        {predictions.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No predictions yet</h3>
                                <p className="mt-1 text-sm text-gray-500">Predictions will appear here when patients submit them.</p>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient ID</th>
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
                                                {prediction.patient_id.substring(0, 8)}...
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <Link href={`/doctor/predictions/${prediction.id}`} className="text-blue-600 hover:text-blue-900">
                                                    View
                                                </Link>
                                                {prediction.status === 'pending' && (
                                                    <button
                                                        onClick={() => openReviewModal(prediction)}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        Review
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>

            {/* Review Modal */}
            {showReviewModal && selectedPrediction && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowReviewModal(false)}></div>

                        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Review Prediction
                                </h3>

                                <div className="mb-4">
                                    <div className="text-sm text-gray-600 mb-2">
                                        <span className="font-medium">Type:</span> {selectedPrediction.prediction_type}
                                    </div>
                                    <div className="text-sm text-gray-600 mb-2">
                                        <span className="font-medium">Result:</span> {selectedPrediction.result}
                                    </div>
                                    <div className="text-sm text-gray-600 mb-2">
                                        <span className="font-medium">Risk:</span> {selectedPrediction.risk_level}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Doctor Notes
                                    </label>
                                    <textarea
                                        value={reviewNotes}
                                        onChange={(e) => setReviewNotes(e.target.value)}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter your clinical notes and recommendations..."
                                    />
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => handleReview(true)}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleReview(false)}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => setShowReviewModal(false)}
                                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
