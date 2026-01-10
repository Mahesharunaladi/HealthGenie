"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddFamilyMemberPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        relationship: "child",
        date_of_birth: "",
        gender: "Male",
        blood_type: "",
        phone: "",
        email: "",
        address: "",
        emergency_contact: "",
        medical_history: "",
        chronic_conditions: "",
        allergies: "",
        current_medications: "",
        genetic_risks: "",
        insurance_provider: "",
        insurance_policy_number: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");

            // Convert comma-separated strings to arrays
            const payload = {
                ...formData,
                chronic_conditions: formData.chronic_conditions
                    ? formData.chronic_conditions.split(",").map((s) => s.trim())
                    : [],
                allergies: formData.allergies
                    ? formData.allergies.split(",").map((s) => s.trim())
                    : [],
                current_medications: formData.current_medications
                    ? formData.current_medications.split(",").map((s) => s.trim())
                    : [],
                genetic_risks: formData.genetic_risks
                    ? formData.genetic_risks.split(",").map((s) => s.trim())
                    : [],
                blood_type: formData.blood_type || null,
                phone: formData.phone || null,
                email: formData.email || null,
                address: formData.address || null,
                emergency_contact: formData.emergency_contact || null,
                medical_history: formData.medical_history || null,
                insurance_provider: formData.insurance_provider || null,
                insurance_policy_number: formData.insurance_policy_number || null,
            };

            const response = await fetch("http://localhost:8000/api/v1/family/members", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Failed to add family member");
            }

            router.push("/family");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push("/family")}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            ← Back
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Add Family Member</h1>
                            <p className="text-gray-600">Enter details of your family member</p>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Relationship *
                                </label>
                                <select
                                    name="relationship"
                                    value={formData.relationship}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="parent">Parent</option>
                                    <option value="child">Child</option>
                                    <option value="sibling">Sibling</option>
                                    <option value="spouse">Spouse</option>
                                    <option value="grandparent">Grandparent</option>
                                    <option value="grandchild">Grandchild</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date of Birth *
                                </label>
                                <input
                                    type="date"
                                    name="date_of_birth"
                                    value={formData.date_of_birth}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Blood Type
                                </label>
                                <select
                                    name="blood_type"
                                    value={formData.blood_type}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select...</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Emergency Contact
                                </label>
                                <input
                                    type="text"
                                    name="emergency_contact"
                                    value={formData.emergency_contact}
                                    onChange={handleChange}
                                    placeholder="Name and phone number"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Medical Information */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Medical Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Medical History
                                </label>
                                <textarea
                                    name="medical_history"
                                    value={formData.medical_history}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Any significant medical history..."
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Chronic Conditions
                                </label>
                                <input
                                    type="text"
                                    name="chronic_conditions"
                                    value={formData.chronic_conditions}
                                    onChange={handleChange}
                                    placeholder="Comma-separated (e.g., Diabetes, Hypertension)"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                                <input
                                    type="text"
                                    name="allergies"
                                    value={formData.allergies}
                                    onChange={handleChange}
                                    placeholder="Comma-separated (e.g., Penicillin, Peanuts)"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Medications
                                </label>
                                <input
                                    type="text"
                                    name="current_medications"
                                    value={formData.current_medications}
                                    onChange={handleChange}
                                    placeholder="Comma-separated (e.g., Aspirin, Lisinopril)"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Genetic Risk Factors
                                </label>
                                <input
                                    type="text"
                                    name="genetic_risks"
                                    value={formData.genetic_risks}
                                    onChange={handleChange}
                                    placeholder="Comma-separated (e.g., Heart Disease, Cancer)"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Insurance Information */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Insurance Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Insurance Provider
                                </label>
                                <input
                                    type="text"
                                    name="insurance_provider"
                                    value={formData.insurance_provider}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Policy Number
                                </label>
                                <input
                                    type="text"
                                    name="insurance_policy_number"
                                    value={formData.insurance_policy_number}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => router.push("/family")}
                            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                        >
                            {loading ? "Adding..." : "Add Family Member"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
