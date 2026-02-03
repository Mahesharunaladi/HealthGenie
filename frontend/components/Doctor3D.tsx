"use client";

import React from 'react';

export default function Doctor3D() {
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <div className="doctor-container">
                {/* Doctor Head */}
                <div className="doctor-head">
                    <div className="face">
                        <div className="eyes">
                            <div className="eye left"></div>
                            <div className="eye right"></div>
                        </div>
                        <div className="nose"></div>
                        <div className="mouth"></div>
                    </div>
                    <div className="hair"></div>
                </div>

                {/* Doctor Body */}
                <div className="doctor-body">
                    {/* White Coat */}
                    <div className="coat">
                        <div className="collar left-collar"></div>
                        <div className="collar right-collar"></div>
                        <div className="coat-button"></div>
                        <div className="coat-button" style={{ top: '40px' }}></div>
                        <div className="coat-button" style={{ top: '70px' }}></div>

                        {/* Stethoscope */}
                        <div className="stethoscope">
                            <div className="steth-tube"></div>
                            <div className="steth-head"></div>
                        </div>
                    </div>

                    {/* Arms */}
                    <div className="arm left-arm">
                        <div className="hand left-hand"></div>
                    </div>
                    <div className="arm right-arm">
                        <div className="hand right-hand">
                            <div className="clipboard">
                                <div className="clipboard-paper"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Legs */}
                <div className="legs">
                    <div className="leg left-leg"></div>
                    <div className="leg right-leg"></div>
                </div>
            </div>

            <style jsx>{`
        .doctor-container {
          position: relative;
          width: 200px;
          height: 350px;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        /* Head */
        .doctor-head {
          position: absolute;
          width: 80px;
          height: 90px;
          background: #f5d5b8;
          border-radius: 50% 50% 45% 45%;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
        }

        .face {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .eyes {
          position: absolute;
          top: 35px;
          left: 50%;
          transform: translateX(-50%);
          width: 50px;
          display: flex;
          justify-content: space-between;
        }

        .eye {
          width: 8px;
          height: 8px;
          background: #2c3e50;
          border-radius: 50%;
          animation: blink 4s infinite;
        }

        @keyframes blink {
          0%, 48%, 52%, 100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(0.1);
          }
        }

        .nose {
          position: absolute;
          width: 8px;
          height: 12px;
          background: #e6bc9a;
          border-radius: 0 0 50% 50%;
          top: 50px;
          left: 50%;
          transform: translateX(-50%);
        }

        .mouth {
          position: absolute;
          width: 25px;
          height: 12px;
          border: 2px solid #d4886f;
          border-top: none;
          border-radius: 0 0 15px 15px;
          top: 65px;
          left: 50%;
          transform: translateX(-50%);
        }

        .hair {
          position: absolute;
          width: 85px;
          height: 40px;
          background: #3d2817;
          border-radius: 50% 50% 0 0;
          top: -5px;
          left: 50%;
          transform: translateX(-50%);
        }

        /* Body */
        .doctor-body {
          position: absolute;
          width: 120px;
          height: 140px;
          top: 85px;
          left: 50%;
          transform: translateX(-50%);
        }

        .coat {
          position: relative;
          width: 100%;
          height: 100%;
          background: linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%);
          border-radius: 20px 20px 10px 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        .collar {
          position: absolute;
          width: 30px;
          height: 50px;
          background: #ffffff;
          top: 0;
        }

        .left-collar {
          left: 10px;
          border-radius: 10px 0 0 0;
          transform: rotate(-10deg);
        }

        .right-collar {
          right: 10px;
          border-radius: 0 10px 0 0;
          transform: rotate(10deg);
        }

        .coat-button {
          position: absolute;
          width: 8px;
          height: 8px;
          background: #3498db;
          border-radius: 50%;
          left: 50%;
          transform: translateX(-50%);
          top: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        /* Stethoscope */
        .stethoscope {
          position: absolute;
          right: 15px;
          top: 10px;
        }

        .steth-tube {
          width: 3px;
          height: 60px;
          background: #34495e;
          border-radius: 2px;
          margin-left: 10px;
        }

        .steth-head {
          width: 20px;
          height: 20px;
          background: #2c3e50;
          border-radius: 50%;
          margin-top: -5px;
          border: 3px solid #34495e;
        }

        /* Arms */
        .arm {
          position: absolute;
          width: 35px;
          height: 90px;
          background: #ffffff;
          border-radius: 10px;
          top: 10px;
        }

        .left-arm {
          left: -25px;
          transform: rotate(-20deg);
          animation: wave 2s ease-in-out infinite;
        }

        @keyframes wave {
          0%, 100% {
            transform: rotate(-20deg);
          }
          50% {
            transform: rotate(-30deg);
          }
        }

        .right-arm {
          right: -25px;
          transform: rotate(20deg);
        }

        .hand {
          position: absolute;
          width: 25px;
          height: 25px;
          background: #f5d5b8;
          border-radius: 50%;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
        }

        /* Clipboard */
        .clipboard {
          position: absolute;
          width: 35px;
          height: 45px;
          background: #8b7355;
          border-radius: 3px;
          bottom: -35px;
          left: 50%;
          transform: translateX(-50%);
        }

        .clipboard-paper {
          position: absolute;
          width: 30px;
          height: 38px;
          background: white;
          top: 5px;
          left: 50%;
          transform: translateX(-50%);
          border-radius: 2px;
          box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
        }

        .clipboard-paper::before {
          content: '';
          position: absolute;
          width: 20px;
          height: 2px;
          background: #3498db;
          top: 8px;
          left: 5px;
        }

        .clipboard-paper::after {
          content: '';
          position: absolute;
          width: 20px;
          height: 2px;
          background: #e0e0e0;
          top: 15px;
          left: 5px;
          box-shadow: 0 7px 0 #e0e0e0, 0 14px 0 #e0e0e0;
        }

        /* Legs */
        .legs {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 100px;
          top: 220px;
        }

        .leg {
          position: absolute;
          width: 30px;
          height: 70px;
          background: #2c3e50;
          border-radius: 5px 5px 0 0;
          bottom: 0;
        }

        .left-leg {
          left: 10px;
        }

        .right-leg {
          right: 10px;
        }

        .leg::after {
          content: '';
          position: absolute;
          width: 35px;
          height: 15px;
          background: #1a252f;
          border-radius: 10px;
          bottom: -5px;
          left: -2px;
        }
      `}</style>
        </div>
    );
}
