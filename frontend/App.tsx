// frontend/App.tsx

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { VOCABULARY_LIST } from './constants';
import type { VocabularyItem, Feedback, EvaluationResult } from './types';

// --- SVG Icons ---
const SpeakerIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
  </svg>
);
const MicIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m12 7.5v-1.5a6 6 0 0 0-6-6v0a6 6 0 0 0-6 6v1.5m6 7.5v-1.5" />
  </svg>
);
const NextIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
);

// --- Audio Utility Functions ---
const decode = (base64: string): Uint8Array => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const App: React.FC = () => {
    const [score, setScore] = useState(0);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showNextButton, setShowNextButton] = useState(false);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingTimeoutRef = useRef<number | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const isInitialRender = useRef(true);
    
    const currentWord = VOCABULARY_LIST[currentWordIndex];



    const playCurrentWordAudio = useCallback(async () => {
        // 1. Gọi backend function MỚI
        const response = await fetch("/.netlify/functions/getElevenLabsTTS", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                textToSpeak: currentWord.hiragana 
            }),
        });

        if (!response.ok) {
            throw new Error("Lỗi gọi API ElevenLabs TTS");
        }

        // 2. Lấy Base64 MP3 và loại MIME
        const { base64Audio, mimeType } = await response.json();

        // 3. Chuyển Base64 sang Blob
        // (Hàm 'decode' ở đầu file của bạn vẫn được giữ lại)
        const audioData = decode(base64Audio);
        const audioBlob = new Blob([audioData], { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // 4. Phát âm thanh
        const audio = new Audio(audioUrl);
        audio.play();

        // 5. Trả về một Promise để các hàm khác (như handlePlayAudio) 
        // có thể 'await' cho đến khi phát xong.
        return new Promise<void>((resolve) => {
            audio.onended = () => {
                URL.revokeObjectURL(audioUrl); // Dọn dẹp
                resolve();
            };
        });
    }, [currentWord.hiragana]);



    const handlePlayAudio = useCallback(async () => {
        if (isProcessing || isRecording) return;
        setIsProcessing(true);
        setFeedback({ type: 'info', message: 'Đang phát âm mẫu...' });
        let hasError = false;
        try {
            // Đảm bảo có 'await' ở đây
            await playCurrentWordAudio(); 
        } catch (error) {
            hasError = true;
            console.error("Error generating TTS:", error);
            setFeedback({ type: 'error', message: 'Lỗi phát âm. Vui lòng thử lại.' });
        } finally {
            if (!hasError) {
                setFeedback(null);
            }
            setIsProcessing(false);
        }
    }, [isProcessing, isRecording, playCurrentWordAudio]);

    // SỬA: Dùng Web Speech API

    const playFeedbackAudio = useCallback(async (text: string) => {
        if (!text || !text.trim()) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'vi-VN';
        window.speechSynthesis.speak(utterance);

        return Promise.resolve();

    }, []);

// SỬA HÀM NÀY
    const evaluatePronunciation = useCallback(async (audioBase64: string) => {
        setIsProcessing(true);
        setFeedback({ type: 'info', message: 'Đang phân tích phát âm của bạn...' });

        try {
            const response = await fetch("/.netlify/functions/evaluatePronunciation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    audioBase64: audioBase64,
                    japaneseWord: currentWord.japanese,
                    hiraganaWord: currentWord.hiragana, 
                    romajiWord: currentWord.romaji
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Lỗi server khi đánh giá");
            }

            const result: EvaluationResult = await response.json();
            
            const feedbackMessage = result.feedback || (result.isCorrect ? "Rất tốt!" : "Hãy thử lại nhé, bạn có thể làm được!");

            if (result.isCorrect) {
                setScore(s => s + 10);
                setFeedback({ type: 'correct', message: feedbackMessage });
            } else {
                setFeedback({ type: 'incorrect', message: feedbackMessage });
            }
            setShowNextButton(true);

            await playCurrentWordAudio(); 

        } catch (error) {
            console.error("Lỗi trong quá trình đánh giá:", error);
            const errorMessage = 'Đã xảy ra lỗi phân tích. Vui lòng thử lại.';
            setFeedback({ type: 'error', message: errorMessage });
            
            await playFeedbackAudio.catch(audioError => {
                console.error("Không thể phát âm thanh báo lỗi chung.", audioError);
            });
        } finally {
            setIsProcessing(false);
        }
    }, [currentWord, playFeedbackAudio, playCurrentWordAudio]);


    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }
        if (recordingTimeoutRef.current) {
            clearTimeout(recordingTimeoutRef.current);
            recordingTimeoutRef.current = null;
        }
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
        setIsRecording(false);
    }, []);

    const startRecording = useCallback(async () => {
        if (isRecording) return;
        
        setFeedback({ type: 'info', message: 'Hãy nói và nhấn nút lần nữa để dừng...' });
        setShowNextButton(false);
        audioChunksRef.current = [];

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            recorder.onstop = async () => {
                if (audioChunksRef.current.length === 0) {
                     setFeedback({ type: 'info', message: 'Không nhận được âm thanh. Vui lòng thử lại.' });
                     return;
                }
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioBase64 = await blobToBase64(audioBlob);
                evaluatePronunciation(audioBase64);
            };

            recorder.start();
            setIsRecording(true);

            recordingTimeoutRef.current = window.setTimeout(stopRecording, 5000);

        } catch (err) {
            console.error('Error starting recording:', err);
            setFeedback({ type: 'error', message: 'Không thể truy cập micro. Vui lòng cấp quyền.' });
            setIsRecording(false);
        }
    }, [isRecording, stopRecording, evaluatePronunciation]);

    useEffect(() => {
        return () => {
           stopRecording();
        };
    }, [stopRecording]);

    // (Đã vô hiệu hóa useEffect tự động phát)

    const handleNextWord = () => {
        setShowNextButton(false);
        setFeedback(null);
        if (currentWordIndex < VOCABULARY_LIST.length - 1) {
            setCurrentWordIndex(prev => prev + 1);
        } else {
            setFeedback({ type: 'info', message: `Hoàn thành! Bạn đã đạt ${score} điểm. Bắt đầu lại.` });
            setCurrentWordIndex(0);
            setScore(0);
        }
    };
    
    const feedbackColor = {
        correct: 'text-green-600 bg-green-100 border-green-500',
        incorrect: 'text-red-600 bg-red-100 border-red-500',
        info: 'text-blue-600 bg-blue-100 border-blue-500',
        error: 'text-yellow-600 bg-yellow-100 border-yellow-500',
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 p-4">
            <div className="w-full max-w-md mx-auto">
                
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-slate-700">Luyện phát âm</h1>
                    <div className="bg-white rounded-full px-4 py-2 text-lg font-bold text-indigo-600 shadow-md">
                        Điểm: {score}
                    </div>
                </header>

                <main className="bg-white rounded-2xl shadow-xl p-6 md:p-8 text-center space-y-6">
                    {/* Vocabulary Card */}
                    <div className="relative">
                        <p className="text-5xl md:text-6xl font-bold text-slate-800 mb-2" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
                            {currentWord.japanese}
                        </p>
                        <p className="text-2xl text-slate-600" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
                            {currentWord.hiragana}
                        </p>
                        <p className="text-xl text-slate-500">{currentWord.romaji}</p>
                        <p className="text-lg font-medium text-indigo-600 mt-2">{currentWord.vietnamese}</p>
                        <button
                            onClick={handlePlayAudio}
                            disabled={isProcessing || isRecording}
                            className="absolute top-0 right-0 p-2 text-slate-500 hover:text-indigo-600 disabled:text-slate-300 transition-colors"
                            aria-label="Nghe phát âm mẫu"
                         >
                            <SpeakerIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Feedback Display */}
                    <div className="h-24 flex items-center justify-center p-2">
                        {feedback && (
                            <div key={feedback.message} className={`w-full p-3 rounded-lg border ${feedbackColor[feedback.type]} animate-fadeIn`}>
                                <p className="font-medium">{feedback.message}</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Controls */}
                     <div className="flex items-center justify-center space-x-4 h-24">
                        <button
                            onClick={isRecording ? stopRecording : startRecording}
                            disabled={isProcessing}
                            className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50
                                ${isRecording
                                    ? 'bg-red-500 text-white shadow-lg scale-110 focus:ring-red-400'
                                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md focus:ring-indigo-500'}`
                            }
                           >
                            {isRecording && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                            <MicIcon className="w-10 h-10" />
                        </button>
                        
                        {showNextButton && (
                             <button
                                   onClick={handleNextWord}
                                className="flex items-center justify-center w-24 h-24 bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-offset-2 transition-all"
                                aria-label="Từ tiếp theo"
                             >
                                <NextIcon className="w-10 h-10"/>
                             </button>
                        )}
                    </div>

                </main>
                <footer className="text-center mt-6 text-slate-500 text-sm">
                    <p>Cung cấp bởi Google Gemini API</p>
                 </footer>
               </div>
        </div>
    );
};

export default App;