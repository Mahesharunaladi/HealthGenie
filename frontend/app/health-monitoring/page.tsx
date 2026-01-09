'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface HealthMetric {
    id: string;
    metric_type: string;
    value: number;
    unit: string;
    systolic?: number;
    diastolic?: number;
    is_alert: boolean;
    alert_message?: string;
    recorded_at: string;
}

interface HealthStats {
    metric_type: string;
    average: number;
    min: number;
    max: number;
    latest: number;
    trend: string;
    unit: string;
}

export default function HealthMonitoring() {
    const [metrics, setMetrics] = useState<HealthMetric[]>([]);
    const [stats, setStats] = useState<HealthStats[]>([]);
    const [selectedMetric, setSelectedMetric] = useState('heart_rate');
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newMetric, setNewMetric] = useState({
        metric_type: 'heart_rate',
        value: '',
        systolic: '',
        diastolic: ''
    });
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }

        fetchMetrics();
        fetchStats();
    }, [router]);

    const fetchMetrics = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://localhost:8000/api/v1/health/metrics?days=7', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setMetrics(data);
            }
        } catch (error) {
            console.error('Error fetching metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://localhost:8000/api/v1/health/stats?days=30', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const addMetric = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const data: any = {
                metric_type: newMetric.metric_type,
                value: parseFloat(newMetric.value),
                unit: getUnitForMetric(newMetric.metric_type)
            };

            if (newMetric.metric_type === 'blood_pressure') {
                data.systolic = parseFloat(newMetric.systolic);
                data.diastolic = parseFloat(newMetric.diastolic);
                data.value = data.systolic; // Store systolic as main value
            }

            const response = await fetch('http://localhost:8000/api/v1/health/metrics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                setShowAddForm(false);
                setNewMetric({ metric_type: 'heart_rate', value: '', systolic: '', diastolic: '' });
                fetchMetrics();
                fetchStats();
                
                const result = await response.json();
                if (result.is_alert) {
                    alert(`⚠️ Alert: ${result.alert_message}`);
                }
            }
        } catch (error) {
            console.error('Error adding metric:', error);
            alert('Failed to add metric');
        }
    };

    const getUnitForMetric = (type: string): string => {
        const units: Record<string, string> = {
            'heart_rate': 'bpm',
            'blood_pressure': 'mmHg',
            'glucose': 'mg/dL',
            'oxygen': '%',
            'temperature': '°F'
        };
        return units[type] || '';
    };

    const getMetricLabel = (type: string): string => {
        const labels: Record<string, string> = {
            'heart_rate': 'Heart Rate',
            'blood_pressure': 'Blood Pressure',
            'glucose': 'Blood Glucose',
            'oxygen': 'Oxygen Saturation',
            'temperature': 'Body Temperature'
        };
        return labels[type] || type;
    };

    const getChartData = (metricType: string) => {
        const filteredMetrics = metrics
            .filter(m => m.metric_type === metricType)
            .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
            .slice(-20); // Last 20 readings

        return {
            labels: filteredMetrics.map(m => 
                new Date(m.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            ),
            datasets: [
                {
                    label: getMetricLabel(metricType),
                    data: filteredMetrics.map(m => m.value),
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        };
    };

    const getTrendIcon = (trend: string) => {
        if (trend === 'increasing') return '📈';
        if (trend === 'decreasing') return '📉';
        return '➡️';
    };

    const getTrendColor = (trend: string, metricType: string) => {
        // For some metrics, increasing is bad; for others, it's neutral
        if (metricType === 'oxygen') {
            return trend === 'increasing' ? 'text-green-600' : 'text-red-600';
        }
        if (metricType === 'heart_rate' || metricType === 'blood_pressure' || metricType === 'glucose') {
            return trend === 'increasing' ? 'text-red-600' : trend === 'decreasing' ? 'text-green-600' : 'text-gray-600';
        }
        return 'text-gray-600';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading health data...</p>
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
                            <h1 className="text-3xl font-bold text-gray-900">📊 Health Monitoring</h1>
                            <p className="text-gray-600 mt-1">Track your vital signs and health metrics</p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowAddForm(!showAddForm)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                ➕ Add Metric
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

                {/* Add Metric Form */}
                {showAddForm && (
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">Add New Measurement</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Metric Type
                                </label>
                                <select
                                    value={newMetric.metric_type}
                                    onChange={(e) => setNewMetric({ ...newMetric, metric_type: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="heart_rate">Heart Rate</option>
                                    <option value="blood_pressure">Blood Pressure</option>
                                    <option value="glucose">Blood Glucose</option>
                                    <option value="oxygen">Oxygen Saturation</option>
                                    <option value="temperature">Body Temperature</option>
                                </select>
                            </div>

                            {newMetric.metric_type === 'blood_pressure' ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Systolic (mmHg)
                                        </label>
                                        <input
                                            type="number"
                                            value={newMetric.systolic}
                                            onChange={(e) => setNewMetric({ ...newMetric, systolic: e.target.value })}
                                            className="w-full p-2 border border-gray-300 rounded-lg"
                                            placeholder="120"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Diastolic (mmHg)
                                        </label>
                                        <input
                                            type="number"
                                            value={newMetric.diastolic}
                                            onChange={(e) => setNewMetric({ ...newMetric, diastolic: e.target.value })}
                                            className="w-full p-2 border border-gray-300 rounded-lg"
                                            placeholder="80"
                                        />
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Value ({getUnitForMetric(newMetric.metric_type)})
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={newMetric.value}
                                        onChange={(e) => setNewMetric({ ...newMetric, value: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                        placeholder="Enter value"
                                    />
                                </div>
                            )}

                            <div className="flex items-end">
                                <button
                                    onClick={addMetric}
                                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                >
                                    Save Measurement
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {stats.map((stat) => (
                        <div key={stat.metric_type} className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {getMetricLabel(stat.metric_type)}
                                </h3>
                                <span className={`text-2xl ${getTrendColor(stat.trend, stat.metric_type)}`}>
                                    {getTrendIcon(stat.trend)}
                                </span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Latest:</span>
                                    <span className="font-semibold">{stat.latest} {stat.unit}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Average:</span>
                                    <span className="font-medium">{stat.average} {stat.unit}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Range:</span>
                                    <span className="text-gray-700">{stat.min} - {stat.max} {stat.unit}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Chart Section */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-4">Trends Over Time</h2>
                        <div className="flex flex-wrap gap-2">
                            {['heart_rate', 'blood_pressure', 'glucose', 'oxygen', 'temperature'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setSelectedMetric(type)}
                                    className={`px-4 py-2 rounded-lg transition ${
                                        selectedMetric === type
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {getMetricLabel(type)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[400px]">
                        <Line
                            data={getChartData(selectedMetric)}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        display: true,
                                        position: 'top' as const,
                                    },
                                    title: {
                                        display: false,
                                    },
                                },
                                scales: {
                                    y: {
                                        beginAtZero: false,
                                    },
                                },
                            }}
                        />
                    </div>
                </div>

                {/* Recent Measurements */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4">Recent Measurements</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Value</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {metrics.slice(0, 10).map((metric) => (
                                    <tr key={metric.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm">
                                            {getMetricLabel(metric.metric_type)}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium">
                                            {metric.metric_type === 'blood_pressure' 
                                                ? `${metric.systolic}/${metric.diastolic} ${metric.unit}`
                                                : `${metric.value} ${metric.unit}`
                                            }
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {new Date(metric.recorded_at).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {metric.is_alert ? (
                                                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                                    ⚠️ Alert
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                                    ✓ Normal
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
