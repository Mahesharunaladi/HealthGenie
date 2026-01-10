"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface FamilyMember {
    id: number;
    user_id: number;
    first_name: string;
    last_name: string;
    relationship: string;
    date_of_birth: string;
    gender: string;
    blood_type?: string;
    age?: number;
    chronic_conditions?: string[];
    allergies?: string[];
    current_medications?: string[];
    genetic_risks?: string[];
}

export default function FamilyHealthPage() {
    const router = useRouter();
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showSummary, setShowSummary] = useState(false);
    const [healthSummary, setHealthSummary] = useState<any>(null);

    useEffect(() => {
        fetchFamilyMembers();
    }, []);

    const fetchFamilyMembers = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8000/api/v1/family/members", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("Failed to fetch family members");

            const data = await response.json();
            setFamilyMembers(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchHealthSummary = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8000/api/v1/family/summary", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("Failed to fetch health summary");

            const data = await response.json();
            setHealthSummary(data);
            setShowSummary(true);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const deleteMember = async (memberId: number) => {
        if (!confirm("Are you sure you want to remove this family member?")) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `http://localhost:8000/api/v1/family/members/${memberId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) throw new Error("Failed to delete family member");

            fetchFamilyMembers();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const getRelationshipColor = (relationship: string) => {
        const colors: { [key: string]: string } = {
            parent: "bg-purple-100 text-purple-800",
            child: "bg-blue-100 text-blue-800",
            sibling: "bg-green-100 text-green-800",
            spouse: "bg-pink-100 text-pink-800",
            grandparent: "bg-yellow-100 text-yellow-800",
            grandchild: "bg-indigo-100 text-indigo-800",
            other: "bg-gray-100 text-gray-800",
        };
        return colors[relationship.toLowerCase()] || colors.other;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Loading family members...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                Family Health Records
                            </h1>
                            <p className="text-gray-600">
                                Manage your family's health information in one place
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={fetchHealthSummary}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                            >
                                📊 Health Summary
                            </button>
                            <button
                                onClick={() => router.push("/family/add")}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                ➕ Add Member
                            </button>
                            <button
                                onClick={() => router.push("/family/timeline")}
                                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                            >
                                📅 Timeline
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* Health Summary Modal */}
                {showSummary && healthSummary && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">Family Health Summary</h2>
                                <button
                                    onClick={() => setShowSummary(false)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Total Members */}
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-lg mb-2">Total Members</h3>
                                    <p className="text-3xl font-bold text-blue-600">
                                        {healthSummary.total_members}
                                    </p>
                                </div>

                                {/* Age Range */}
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-lg mb-2">Age Range</h3>
                                    <p className="text-xl text-purple-600">
                                        {healthSummary.age_range?.youngest} - {healthSummary.age_range?.oldest} years
                                    </p>
                                </div>

                                {/* Common Conditions */}
                                <div className="bg-red-50 p-4 rounded-lg col-span-1 md:col-span-2">
                                    <h3 className="font-semibold text-lg mb-2">Common Conditions</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {healthSummary.common_conditions?.map((condition: string, idx: number) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-sm"
                                            >
                                                {condition}
                                            </span>
                                        ))}
                                        {(!healthSummary.common_conditions || healthSummary.common_conditions.length === 0) && (
                                            <span className="text-gray-500">No common conditions</span>
                                        )}
                                    </div>
                                </div>

                                {/* Common Allergies */}
                                <div className="bg-yellow-50 p-4 rounded-lg col-span-1 md:col-span-2">
                                    <h3 className="font-semibold text-lg mb-2">Common Allergies</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {healthSummary.common_allergies?.map((allergy: string, idx: number) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm"
                                            >
                                                {allergy}
                                            </span>
                                        ))}
                                        {(!healthSummary.common_allergies || healthSummary.common_allergies.length === 0) && (
                                            <span className="text-gray-500">No common allergies</span>
                                        )}
                                    </div>
                                </div>

                                {/* Genetic Risks */}
                                <div className="bg-orange-50 p-4 rounded-lg col-span-1 md:col-span-2">
                                    <h3 className="font-semibold text-lg mb-2">Genetic Risk Factors</h3>
                                    <div className="space-y-2">
                                        {healthSummary.genetic_risk_factors?.map((risk: any, idx: number) => (
                                            <div key={idx} className="flex justify-between items-center">
                                                <span className="font-medium">{risk.risk}</span>
                                                <span className="px-3 py-1 bg-orange-200 text-orange-800 rounded-full text-sm">
                                                    {risk.count} {risk.count === 1 ? "member" : "members"}
                                                </span>
                                            </div>
                                        ))}
                                        {(!healthSummary.genetic_risk_factors || healthSummary.genetic_risk_factors.length === 0) && (
                                            <span className="text-gray-500">No genetic risks identified</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Family Members Grid */}
                {familyMembers.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                        <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
                        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                            No Family Members Yet
                        </h2>
                        <p className="text-gray-500 mb-6">
                            Start by adding your family members to track their health information
                        </p>
                        <button
                            onClick={() => router.push("/family/add")}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Add First Member
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {familyMembers.map((member) => (
                            <div
                                key={member.id}
                                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
                                onClick={() => router.push(`/family/${member.id}`)}
                            >
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">
                                            {member.first_name} {member.last_name}
                                        </h3>
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getRelationshipColor(
                                                member.relationship
                                            )}`}
                                        >
                                            {member.relationship}
                                        </span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteMember(member.id);
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        🗑️
                                    </button>
                                </div>

                                {/* Details */}
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center text-gray-600">
                                        <span className="mr-2">🎂</span>
                                        <span>
                                            {member.age} years old ({new Date(member.date_of_birth).toLocaleDateString()})
                                        </span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <span className="mr-2">{member.gender === "Male" ? "♂️" : "♀️"}</span>
                                        <span>{member.gender}</span>
                                    </div>
                                    {member.blood_type && (
                                        <div className="flex items-center text-gray-600">
                                            <span className="mr-2">🩸</span>
                                            <span>{member.blood_type}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Health Info */}
                                {(member.chronic_conditions?.length || 0) > 0 && (
                                    <div className="mt-4 pt-4 border-t">
                                        <p className="text-xs font-semibold text-gray-700 mb-2">
                                            Chronic Conditions:
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                            {member.chronic_conditions?.slice(0, 2).map((condition, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs"
                                                >
                                                    {condition}
                                                </span>
                                            ))}
                                            {(member.chronic_conditions?.length || 0) > 2 && (
                                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                                    +{(member.chronic_conditions?.length || 0) - 2} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {(member.allergies?.length || 0) > 0 && (
                                    <div className="mt-2">
                                        <p className="text-xs font-semibold text-gray-700 mb-2">Allergies:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {member.allergies?.slice(0, 2).map((allergy, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs"
                                                >
                                                    {allergy}
                                                </span>
                                            ))}
                                            {(member.allergies?.length || 0) > 2 && (
                                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                                    +{(member.allergies?.length || 0) - 2} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
