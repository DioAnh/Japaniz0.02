import React from 'react';
import { Topic, VocabularyItem } from '../types';

interface ControlPanelProps {
    topics: Topic[];
    currentTopicIndex: number;
    currentWordInTopicIndex: number;
    currentWordList: VocabularyItem[];
    onSelectTopic: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onSelectWord: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
    topics, currentTopicIndex, currentWordInTopicIndex, currentWordList, onSelectTopic, onSelectWord
}) => {
    // Styles chung cho ô chọn để khớp chiều cao với nút bấm
    const selectClass = "w-full h-full p-3 bg-white border border-indigo-100 rounded-2xl shadow-sm text-slate-600 font-bold appearance-none cursor-pointer hover:shadow-md hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all";

    return (
        <>
            {/* Ô 1: Chọn Chủ đề */}
            <div className="relative h-full min-h-[56px]">
                <select
                    id="topic-select"
                    value={currentTopicIndex}
                    onChange={onSelectTopic}
                    className={selectClass}
                >
                    {topics.map((topic, index) => (
                        <option key={index} value={index}>{topic.topicName}</option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-indigo-300">
                    ▼
                </div>
            </div>

            {/* Ô 2: Chọn Từ vựng */}
            <div className="relative h-full min-h-[56px]">
                <select
                    id="word-select"
                    value={currentWordInTopicIndex}
                    onChange={onSelectWord}
                    className={selectClass}
                >
                    {currentWordList.map((word, index) => (
                        <option key={index} value={index}>{index + 1}. {word.japanese} ({word.vietnamese})</option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-indigo-300">
                    ▼
                </div>
            </div>
        </>
    );
};