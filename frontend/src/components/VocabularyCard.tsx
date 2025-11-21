import React from 'react';
import { VocabularyItem, Feedback } from '../types';
import { SpeakerIcon } from './Icons';

interface VocabularyCardProps {
    word: VocabularyItem;
    isQuizMode: boolean;
    feedback: Feedback | null;
    onPlayAudio: () => void;
    disabled: boolean;
}

export const VocabularyCard: React.FC<VocabularyCardProps> = ({ word, isQuizMode, feedback, onPlayAudio, disabled }) => {
    const isHidden = isQuizMode && feedback?.type !== 'correct' && feedback?.type !== 'incorrect';

    return (
        <div className="glass rounded-[2.5rem] p-10 md:p-14 text-center relative overflow-hidden group hover:shadow-xl transition-shadow duration-500">
            
            {/* Nút Loa: Nổi nhẹ ở góc */}
            <button
                onClick={onPlayAudio}
                disabled={disabled}
                className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center bg-indigo-50 text-indigo-400 rounded-full hover:bg-indigo-100 hover:scale-110 transition-all"
            >
                <SpeakerIcon className="w-6 h-6" />
            </button>

            <div className="mt-4">
                {isHidden ? (
                    <div className="py-10 animate-pulse">
                        <span className="text-6xl">🤫</span>
                        <p className="text-slate-400 mt-6 font-medium">Nghe và lặp lại...</p>
                    </div>
                ) : (
                    <>
                        {/* Kanji: Màu mực tàu (xám đậm) */}
                        <p className="text-7xl md:text-9xl font-bold text-slate-800 mb-2 tracking-wider" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
                            {word.japanese}
                        </p>
                        
                        {/* Hiragana: Màu Pastel tím */}
                        <p className="text-3xl text-indigo-400 font-medium mb-6" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
                            {word.hiragana}
                        </p>

                        {/* Dải phân cách mờ */}
                        <div className="w-20 h-1 bg-slate-100 mx-auto rounded-full mb-6"></div>

                        {/* Romaji & Nghĩa: Font nhỏ, màu nhạt */}
                        <div className="space-y-1">
                            <p className="text-sm text-slate-400 font-mono uppercase tracking-widest">{word.romaji}</p>
                            <p className="text-xl font-bold text-slate-600">{word.vietnamese}</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};