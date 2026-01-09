'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Appointment {
    id: string;
    patient_id: string;
    doctor_id: string;
    appointment_date: string;
    appointment_type: string;
    duration: number;
    video_room_id?: string;
    status: string;
    notes?: string;
    payment_status: string;
    payment_amount?: number;
    created_at: string;
}

interface Doctor {
    id: string;
    specialization: string;
    years_of_experience: number;
    hospital_affiliation?: string;
    user: {
        full_name: string;
        email: string;
    };
}

export default function Telemedicine() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [showBooking, setShowBooking] = useState(false);
    const [bookingForm, setBookingForm] = useState({
        doctor_id: '',
        appointment_date: '',
        appointment_type: 'video_call',
        duration: 30,
        notes: ''
    });
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }

        fetchAppointments();
        fetchDoctors();
    }, [router]);

    const fetchAppointments = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://localhost:8000/api/v1/telemedicine/appointments', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAppointments(data);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDoctors = async () => {
        try {
            const token = localStorage.getItem('access_token');
            // Mock doctors for now - in production, fetch from backend
            setDoctors([
                {
                    id: '1',
                    specialization: 'Cardiologist',
                    years_of_experience: 15,
                    hospital_affiliation: 'City Hospital',
                    user: {
                        full_name: 'Dr. Sarah Johnson',
                        email: 'sarah.johnson@hospital.com'
                    }
                },
                {
                    id: '2',
                    specialization: 'Neurologist',
                    years_of_experience: 10,
                    hospital_affiliation: 'Medical Center',
                    user: {
                        full_name: 'Dr. Michael Chen',
                        email: 'michael.chen@medcenter.com'
                    }
                }
            ]);
        } catch (error) {
            console.error('Error fetching doctors:', error);
        }
    };

    const bookAppointment = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://localhost:8000/api/v1/telemedicine/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...bookingForm,
                    appointment_date: new Date(bookingForm.appointment_date).toISOString()
                })
            });

            if (response.ok) {
                alert('Appointment booked successfully!');
                setShowBooking(false);
                setBookingForm({
                    doctor_id: '',
                    appointment_date: '',
                    appointment_type: 'video_call',
                    duration: 30,
                    notes: ''
                });
                fetchAppointments();
            } else {
                const error = await response.json();
                alert(`Failed to book appointment: ${error.detail}`);
            }
        } catch (error) {
            console.error('Error booking appointment:', error);
            alert('Failed to book appointment');
        }
    };

    const joinVideoCall = async (appointmentId: string) => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(
                `http://localhost:8000/api/v1/telemedicine/appointments/${appointmentId}/start-video`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                router.push(`/telemedicine/room/${data.room_id}`);
            } else {
                alert('Failed to start video call');
            }
        } catch (error) {
            console.error('Error starting video call:', error);
            alert('Failed to start video call');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled':
                return 'bg-blue-100 text-blue-800';
            case 'in_progress':
                return 'bg-green-100 text-green-800';
            case 'completed':
                return 'bg-gray-100 text-gray-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'refunded':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading appointments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">📹 Telemedicine</h1>
                            <p className="text-gray-600 mt-1">Virtual consultations with healthcare professionals</p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowBooking(!showBooking)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                📅 Book Appointment
                            </button>
                            <Link
                                href="/patient/dashboard"
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                            >
                                ← Back
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Booking Form */}
                {showBooking && (
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">Book New Appointment</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Doctor *
                                </label>
                                <select
                                    value={bookingForm.doctor_id}
                                    onChange={(e) => setBookingForm({ ...bookingForm, doctor_id: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    required
                                >
                                    <option value="">Choose a doctor...</option>
                                    {doctors.map((doctor) => (
                                        <option key={doctor.id} value={doctor.id}>
                                            {doctor.user.full_name} - {doctor.specialization} ({doctor.years_of_experience} years)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Appointment Type *
                                </label>
                                <select
                                    value={bookingForm.appointment_type}
                                    onChange={(e) => setBookingForm({ ...bookingForm, appointment_type: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="video_call">Video Call - $75</option>
                                    <option value="consultation">Consultation - $50</option>
                                    <option value="follow_up">Follow-up - $30</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date & Time *
                                </label>
                                <input
                                    type="datetime-local"
                                    value={bookingForm.appointment_date}
                                    onChange={(e) => setBookingForm({ ...bookingForm, appointment_date: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Duration (minutes)
                                </label>
                                <select
                                    value={bookingForm.duration}
                                    onChange={(e) => setBookingForm({ ...bookingForm, duration: parseInt(e.target.value) })}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="15">15 minutes</option>
                                    <option value="30">30 minutes</option>
                                    <option value="45">45 minutes</option>
                                    <option value="60">60 minutes</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={bookingForm.notes}
                                    onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    rows={3}
                                    placeholder="Describe your symptoms or concerns..."
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowBooking(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={bookAppointment}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                disabled={!bookingForm.doctor_id || !bookingForm.appointment_date}
                            >
                                Confirm Booking
                            </button>
                        </div>
                    </div>
                )}

                {/* Appointments List */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4">Your Appointments</h2>
                    
                    {appointments.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 mb-4">No appointments scheduled yet</p>
                            <button
                                onClick={() => setShowBooking(true)}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Book Your First Appointment
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {appointments.map((appointment) => (
                                <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {appointment.appointment_type.replace('_', ' ').toUpperCase()}
                                                </h3>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                                                    {appointment.status}
                                                </span>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentColor(appointment.payment_status)}`}>
                                                    {appointment.payment_status}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
                                                <div>
                                                    <span className="font-medium">Date:</span> {new Date(appointment.appointment_date).toLocaleString()}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Duration:</span> {appointment.duration} minutes
                                                </div>
                                                {appointment.payment_amount && (
                                                    <div>
                                                        <span className="font-medium">Amount:</span> ${appointment.payment_amount}
                                                    </div>
                                                )}
                                            </div>
                                            {appointment.notes && (
                                                <p className="mt-2 text-sm text-gray-600">
                                                    <span className="font-medium">Notes:</span> {appointment.notes}
                                                </p>
                                            )}
                                        </div>

                                        <div className="ml-4">
                                            {appointment.status === 'scheduled' && appointment.appointment_type === 'video_call' && (
                                                <button
                                                    onClick={() => joinVideoCall(appointment.id)}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                                >
                                                    📹 Join Call
                                                </button>
                                            )}
                                            {appointment.status === 'completed' && (
                                                <span className="text-green-600 font-medium">✓ Completed</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
