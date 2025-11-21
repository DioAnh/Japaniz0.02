// frontend/src/components/Controls.tsx

import React from 'react';
import { MicIcon, NextIcon, PrevIcon } from './Icons';

interface ControlsProps {
    onPrev: () => void;
    onNext: () => void;
    onRecord: () => void;
    isRecording: boolean;
    isProcessing: boolean;
    showNavButtons: boolean; 
}

export const Controls: React.FC<ControlsProps> = ({ onPrev, onNext, onRecord, isRecording, isProcessing, showNavButtons }) => {
    return (
        // SỬA Ở ĐÂY: Đổi 'mt-10' thành 'mt-4' hoặc xóa hẳn class mt
        <div className="flex items-center justify-center gap-8 mt-4">
            {showNavButtons && (
                <button 
                    onClick={onPrev} 
                    disabled={isProcessing || isRecording} 
                    className="w-14 h-14 flex items-center justify-center rounded-full bg-white text-slate-400 shadow-sm hover:text-indigo-500 hover:shadow-md hover:-translate-x-1 transition-all disabled:opacity-30"
                >
                    <PrevIcon className="w-6 h-6" />
                </button>
            )}

            <div className="relative">
                {isRecording && (
                    <>
                        <span className="absolute -inset-4 rounded-full bg-rose-200 opacity-50 animate-ping"></span>
                        <span className="absolute -inset-8 rounded-full bg-rose-100 opacity-30 animate-pulse"></span>
                    </>
                )}
                
                <button
                    onClick={onRecord}
                    disabled={isProcessing}
                    className={`relative w-24 h-24 flex items-center justify-center rounded-full shadow-xl shadow-indigo-200/50 transition-all transform hover:scale-105 active:scale-95 border-[6px] border-white
                        ${isRecording 
                            ? 'bg-gradient-to-br from-rose-400 to-pink-500 text-white' 
                            : isProcessing
                                ? 'bg-slate-200 text-slate-400 cursor-wait'
                                : 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'}`}
                >
                    <MicIcon className="w-10 h-10" />
                </button>
            </div>

            {showNavButtons && (
                <button 
                    onClick={onNext} 
                    disabled={isProcessing || isRecording} 
                    className="w-14 h-14 flex items-center justify-center rounded-full bg-white text-slate-400 shadow-sm hover:text-indigo-500 hover:shadow-md hover:translate-x-1 transition-all disabled:opacity-30"
                >
                    <NextIcon className="w-6 h-6" />
                </button>
            )}
        </div>
    );
};