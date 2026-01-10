'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VideoRoom() {
    const params = useParams();
    const router = useRouter();
    const [connected, setConnected] = useState(false);
    const [micOn, setMicOn] = useState(true);
    const [cameraOn, setCameraOn] = useState(true);
    const [screenSharing, setScreenSharing] = useState(false);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }

        startLocalStream();

        return () => {
            // Cleanup: stop all tracks
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [router]);

    const startLocalStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            setConnected(true);
        } catch (error) {
            console.error('Error accessing media devices:', error);
            alert('Failed to access camera/microphone. Please check permissions.');
        }
    };

    const toggleMic = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setMicOn(audioTrack.enabled);
            }
        }
    };

    const toggleCamera = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setCameraOn(videoTrack.enabled);
            }
        }
    };

    const toggleScreenShare = async () => {
        try {
            if (!screenSharing) {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true
                });

                // Replace video track with screen share
                const videoTrack = screenStream.getVideoTracks()[0];
                const sender = localStream?.getVideoTracks()[0];

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = screenStream;
                }

                setScreenSharing(true);

                videoTrack.onended = () => {
                    setScreenSharing(false);
                    startLocalStream();
                };
            } else {
                startLocalStream();
                setScreenSharing(false);
            }
        } catch (error) {
            console.error('Error sharing screen:', error);
        }
    };

    const endCall = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        router.push('/telemedicine');
    };

    return (
        <div className="min-h-screen bg-gray-900 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gray-800 rounded-lg shadow-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <h1 className="text-xl font-semibold text-white">
                                Video Consultation - Room {params.roomId}
                            </h1>
                        </div>
                        <div className="text-gray-400 text-sm">
                            {connected ? 'Connected' : 'Connecting...'}
                        </div>
                    </div>
                </div>

                {/* Video Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    {/* Local Video */}
                    <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-4 left-4 px-3 py-1 bg-black bg-opacity-50 text-white text-sm rounded-full">
                            You {!cameraOn && '(Camera Off)'}
                        </div>
                        {!cameraOn && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <span className="text-3xl text-white">👤</span>
                                    </div>
                                    <p className="text-white">Camera Off</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Remote Video */}
                    <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-4 left-4 px-3 py-1 bg-black bg-opacity-50 text-white text-sm rounded-full">
                            Doctor
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <span className="text-3xl text-white">👨‍⚕️</span>
                                </div>
                                <p className="text-white">Waiting for doctor to join...</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-center space-x-4">
                        <button
                            onClick={toggleMic}
                            className={`p-4 rounded-full transition ${micOn
                                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                    : 'bg-red-600 hover:bg-red-700 text-white'
                                }`}
                            title={micOn ? 'Mute Microphone' : 'Unmute Microphone'}
                        >
                            <span className="text-2xl">{micOn ? '🎤' : '🔇'}</span>
                        </button>

                        <button
                            onClick={toggleCamera}
                            className={`p-4 rounded-full transition ${cameraOn
                                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                    : 'bg-red-600 hover:bg-red-700 text-white'
                                }`}
                            title={cameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
                        >
                            <span className="text-2xl">{cameraOn ? '📹' : '📷'}</span>
                        </button>

                        <button
                            onClick={toggleScreenShare}
                            className={`p-4 rounded-full transition ${screenSharing
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                                }`}
                            title={screenSharing ? 'Stop Sharing' : 'Share Screen'}
                        >
                            <span className="text-2xl">🖥️</span>
                        </button>

                        <button
                            onClick={endCall}
                            className="p-4 px-8 bg-red-600 hover:bg-red-700 text-white rounded-full transition"
                            title="End Call"
                        >
                            <span className="text-xl font-semibold">End Call</span>
                        </button>
                    </div>

                    <div className="mt-4 text-center text-gray-400 text-sm">
                        <p>⚠️ This is a demo video interface. In production, this would use WebRTC with Twilio/Agora.</p>
                        <p className="mt-1">For full functionality, integrate with a video calling service.</p>
                    </div>
                </div>

                {/* Info Panel */}
                <div className="mt-4 bg-gray-800 rounded-lg shadow-lg p-4">
                    <h3 className="text-white font-semibold mb-3">Session Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-400">Room ID:</span>
                            <span className="text-white ml-2">{params.roomId}</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Status:</span>
                            <span className="text-green-400 ml-2">Active</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Quality:</span>
                            <span className="text-white ml-2">HD</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Duration:</span>
                            <span className="text-white ml-2">00:00:00</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
