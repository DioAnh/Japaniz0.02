// frontend/src/App.tsx

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useCurrentAccount, useSuiClient, useSignTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { bcs } from '@mysten/sui/bcs';

import { TOPIC_LIST } from './constants';
import type { Feedback, EvaluationResult, VocabularyItem } from './types';
import { PACKAGE_ID, ADMIN_ADDRESS, MIZU_TREASURY_CAP_ID, POINTS_TO_CLAIM_MIZU, QUIZ_LENGTH, QUIZ_TIME_LIMIT } from './config';
import { decode, blobToBase64, selectRandomWords } from './utils';

// Components
import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { GameButtons } from './components/GameButtons';
import { VocabularyCard } from './components/VocabularyCard';
import { Controls } from './components/Controls';
import { ConnectedAccount } from './components/WalletComponents';

// Helper localStorage
const getSavedState = () => {
    const savedTopicIndex = Number(localStorage.getItem('japaniz_topic_index') || 0);
    const savedWordIndex = Number(localStorage.getItem('japaniz_word_index') || 0);
    if (savedTopicIndex >= 0 && savedTopicIndex < TOPIC_LIST.length) {
        if (savedWordIndex >= 0 && savedWordIndex < TOPIC_LIST[savedTopicIndex].vocabulary.length) {
            return { topicIndex: savedTopicIndex, wordIndex: savedWordIndex };
        }
    }
    return { topicIndex: 0, wordIndex: 0 };
};

const App: React.FC = () => {
    const [score, setScore] = useState(() => Number(localStorage.getItem('japaniz_score') || 0));
    const [currentTopicIndex, setCurrentTopicIndex] = useState(getSavedState().topicIndex);
    const [currentWordInTopicIndex, setCurrentWordInTopicIndex] = useState(getSavedState().wordIndex);
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);
    
    type GameMode = 'practice' | 'quiz' | 'quiz_failed' | 'quiz_passed';
    const [gameMode, setGameMode] = useState<GameMode>('practice');
    const [quizWords, setQuizWords] = useState<VocabularyItem[]>([]);
    const [currentQuizWordIndex, setCurrentQuizWordIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(QUIZ_TIME_LIMIT);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingTimeoutRef = useRef<number | null>(null);
    
    const account = useCurrentAccount();
    const client = useSuiClient(); 
    const { mutateAsync: signTransaction } = useSignTransaction(); 

    const currentWord = useMemo(() => {
        if (gameMode === 'quiz' || gameMode === 'quiz_failed') {
            return quizWords[currentQuizWordIndex];
        }
        return TOPIC_LIST[currentTopicIndex].vocabulary[currentWordInTopicIndex];
    }, [gameMode, quizWords, currentQuizWordIndex, currentTopicIndex, currentWordInTopicIndex]);
    
    const currentWordList = TOPIC_LIST[currentTopicIndex].vocabulary;

    // --- EFFECTS ---
    useEffect(() => {
        if (gameMode === 'practice') {
            localStorage.setItem('japaniz_topic_index', String(currentTopicIndex));
            localStorage.setItem('japaniz_word_index', String(currentWordInTopicIndex));
        }
    }, [currentTopicIndex, currentWordInTopicIndex, gameMode]);

    useEffect(() => { localStorage.setItem('japaniz_score', String(score)); }, [score]);

    useEffect(() => {
        if (gameMode !== 'quiz' || isProcessing) return;
        if (timeLeft <= 0) {
            setFeedback({ type: 'error', message: 'Hết giờ! Bạn đã thua.' });
            setGameMode('quiz_failed');
            return;
        }
        const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timerId);
    }, [gameMode, timeLeft, isProcessing]);

    // --- LOGIC HANDLERS ---

    const playCurrentWordAudio = useCallback(async () => {
        const response = await fetch("/.netlify/functions/getElevenLabsTTS", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ textToSpeak: currentWord.hiragana }),
        });
        if (!response.ok) throw new Error("Lỗi gọi API ElevenLabs TTS");
        const { base64Audio, mimeType } = await response.json();
        const audioBlob = new Blob([decode(base64Audio)], { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
        return new Promise<void>((resolve) => {
            audio.onended = () => { URL.revokeObjectURL(audioUrl); resolve(); };
        });
    }, [currentWord]);

    const handlePlayAudio = useCallback(async () => {
        if (isProcessing || isRecording) return;
        setIsProcessing(true);
        setFeedback({ type: 'info', message: 'Đang phát âm mẫu...' });
        try { await playCurrentWordAudio(); } 
        catch (error) { setFeedback({ type: 'error', message: 'Lỗi phát âm.' }); } 
        finally { 
             // Nếu không có lỗi, xóa feedback info
             setFeedback((prev) => prev?.type === 'info' ? null : prev);
             setIsProcessing(false); 
        }
    }, [isProcessing, isRecording, playCurrentWordAudio]);

    const playFeedbackAudio = useCallback(async (text: string) => {
        if (!text || !text.trim()) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'vi-VN';
        window.speechSynthesis.speak(utterance);
        return Promise.resolve();
    }, []);

    const handleQuizAnswer = (isCorrect: boolean) => {
        if (!isCorrect) {
            setFeedback({ type: 'incorrect', message: 'Phát âm chưa đúng! Hãy thử lại.' });
            return; 
        }
        setFeedback({ type: 'correct', message: 'Chính xác!' });
        const nextWordIndex = currentQuizWordIndex + 1;
        if (nextWordIndex >= QUIZ_LENGTH) {
            setGameMode('quiz_passed');
            setFeedback({ type: 'correct', message: 'Chúc mừng! Bạn đã hoàn thành Quiz!' });
        } else {
            setTimeout(() => {
                setCurrentQuizWordIndex(nextWordIndex);
                setFeedback(null);
            }, 1500); 
        }
    };

    const evaluatePronunciation = useCallback(async (audioBase64: string) => {
        setIsProcessing(true);
        setFeedback({ type: 'info', message: 'Đang phân tích...' });
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
            if (!response.ok) throw new Error("Lỗi server đánh giá");
            
            const result: EvaluationResult = await response.json();

            if (gameMode === 'practice') {
                const feedbackMessage = result.feedback || (result.isCorrect ? "Rất tốt!" : "Thử lại nhé!");
                if (result.isCorrect) {
                    setScore(s => s + 10);
                    setFeedback({ type: 'correct', message: feedbackMessage });
                } else {
                    setFeedback({ type: 'incorrect', message: feedbackMessage });
                }
                await playCurrentWordAudio(); 
            } else if (gameMode === 'quiz') {
                handleQuizAnswer(result.isCorrect);
            }
        } catch (error) {
            console.error("Lỗi đánh giá:", error);
            setFeedback({ type: 'error', message: 'Lỗi phân tích. Thử lại.' });
            await playFeedbackAudio('Đã xảy ra lỗi');
        } finally {
            setIsProcessing(false);
        }
    }, [currentWord, playFeedbackAudio, playCurrentWordAudio, gameMode, currentQuizWordIndex]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }
        if (recordingTimeoutRef.current) {
            clearTimeout(recordingTimeoutRef.current);
            recordingTimeoutRef.current = null;
        }
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        setIsRecording(false);
    }, []);

    const startRecording = useCallback(async () => {
        if (isRecording) return;
        setFeedback({ type: 'info', message: 'Hãy nói và nhấn nút lần nữa để dừng...' });
        audioChunksRef.current = [];
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = recorder;
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };
            recorder.onstop = async () => {
                if (audioChunksRef.current.length > 0) {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    const audioBase64 = await blobToBase64(audioBlob);
                    evaluatePronunciation(audioBase64);
                }
            };
            recorder.start();
            setIsRecording(true);
            recordingTimeoutRef.current = window.setTimeout(stopRecording, 5000);
        } catch (err) {
            console.error('Lỗi mic:', err);
            setFeedback({ type: 'error', message: 'Không thể truy cập micro.' });
            setIsRecording(false);
        }
    }, [isRecording, stopRecording, evaluatePronunciation]);

    const handleNextWord = () => {
        setFeedback(null);
        if (currentWordInTopicIndex < currentWordList.length - 1) {
            setCurrentWordInTopicIndex(prev => prev + 1);
        } else if (currentTopicIndex < TOPIC_LIST.length - 1) {
            setCurrentTopicIndex(prev => prev + 1); 
            setCurrentWordInTopicIndex(0); 
        } else {
            setFeedback({ type: 'info', message: `Hoàn thành danh sách!` });
            setCurrentTopicIndex(0); 
            setCurrentWordInTopicIndex(0); 
        }
    };
    
    const handlePrevWord = () => {
        setFeedback(null);
        if (currentWordInTopicIndex > 0) {
            setCurrentWordInTopicIndex(prev => prev - 1);
        } else if (currentTopicIndex > 0) {
            const prevIndex = currentTopicIndex - 1;
            setCurrentTopicIndex(prevIndex); 
            setCurrentWordInTopicIndex(TOPIC_LIST[prevIndex].vocabulary.length - 1); 
        }
    };

    const handleRandomWord = useCallback(() => {
        const rTopic = Math.floor(Math.random() * TOPIC_LIST.length);
        const rWord = Math.floor(Math.random() * TOPIC_LIST[rTopic].vocabulary.length);
        setCurrentTopicIndex(rTopic);
        setCurrentWordInTopicIndex(rWord);
        setFeedback(null);
    }, []);

    const handleMintTicket = () => {
        if (!account || account.address !== ADMIN_ADDRESS) {
            alert("Chỉ Admin mới được thực hiện."); return;
        }
        setFeedback({ type: 'info', message: 'ADMIN: Đang tạo vé NFT...' });
        const txb = new Transaction();
        const newTicket = txb.moveCall({
            target: `${PACKAGE_ID}::ticketnft::mint_event_ticket`,
            arguments: [
                txb.pure.string("Summer Event 2026"),
                txb.pure.string("https://link.ảnh.sựkiện.png"),
            ],
        });
        txb.transferObjects([newTicket], txb.pure.address(ADMIN_ADDRESS));
        signTransaction({ transaction: txb }, {
            onSuccess: async (result) => {
                const executeResult = await client.executeTransactionBlock({
                    transactionBlock: result.bytes, signature: result.signature, options: { showObjectChanges: true }
                });
                console.log("Mint NFT thành công!", executeResult);
                setFeedback(null);
            },
            onError: (err) => alert(`Lỗi: ${err.message}`),
        });
    };

    const handleClaimNft = useCallback(async () => {
        if (!account) { setFeedback({ type: 'error', message: 'Lỗi: Mất kết nối ví!' }); return; }
        setIsClaiming(true);
        setFeedback({ type: 'info', message: 'Đang tạo ảnh...' });
        try {
            const imgRes = await fetch("/.netlify/functions/generateImage", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic: "Japaniz Quiz Champion" }),
            });
            if (!imgRes.ok) throw new Error("Lỗi tạo ảnh");
            const { imageUrl } = await imgRes.json();
            
            setFeedback({ type: 'info', message: 'Ký giao dịch...' });
            const txb = new Transaction();
            const pureVectorU8 = (str: string) => txb.pure(bcs.vector(bcs.u8()).serialize(new TextEncoder().encode(str)));
            
            txb.moveCall({
                target: `${PACKAGE_ID}::achievement::mint_achievement`,
                arguments: [pureVectorU8("Japaniz Quiz Challenge"), txb.pure(100, 'u64'), pureVectorU8(imageUrl), txb.pure(account.address, 'address')],
            });

            const { bytes, signature } = await signTransaction({ transaction: txb });
            const executeResult = await client.executeTransactionBlock({
                transactionBlock: bytes, signature, options: { showRawEffects: true },
            });
            console.log('Minted!', executeResult);
            setFeedback({ type: 'correct', message: 'Nhận NFT thành công!' });
            setTimeout(goToPracticeMode, 3000);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error.message });
        } finally { setIsClaiming(false); }
    }, [account, client, signTransaction]);

    const handleClaimMizu = useCallback(async () => {
        if (!account || score < POINTS_TO_CLAIM_MIZU) return;
        setIsClaiming(true);
        try {
            const txb = new Transaction();
            txb.moveCall({
                target: `${PACKAGE_ID}::mizucoin::claim`,
                arguments: [txb.object(MIZU_TREASURY_CAP_ID)],
            });
            const { bytes, signature } = await signTransaction({ transaction: txb });
            await client.executeTransactionBlock({ transactionBlock: bytes, signature });
            setScore(s => s - POINTS_TO_CLAIM_MIZU);
            setFeedback({ type: 'correct', message: 'Nhận 1 MIZU thành công!' });
        } catch (err: any) { setFeedback({ type: 'error', message: err.message }); }
        finally { setIsClaiming(false); }
    }, [account, score, client, signTransaction]);

    const goToPracticeMode = () => {
        setFeedback(null);
        setGameMode('practice');
        setQuizWords([]);
        setTimeLeft(QUIZ_TIME_LIMIT);
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
                <Header score={score} handleClaimMizu={handleClaimMizu} isClaiming={isClaiming} hasAccount={!!account} pointsToClaim={POINTS_TO_CLAIM_MIZU} />
                
                {gameMode === 'practice' && (
                    <>
                        <ControlPanel 
                            topics={TOPIC_LIST} 
                            currentTopicIndex={currentTopicIndex} 
                            currentWordInTopicIndex={currentWordInTopicIndex} 
                            currentWordList={currentWordList}
                            onSelectTopic={(e) => { setCurrentTopicIndex(Number(e.target.value)); setCurrentWordInTopicIndex(0); setFeedback(null); }}
                            onSelectWord={(e) => { setCurrentWordInTopicIndex(Number(e.target.value)); setFeedback(null); }}
                        />
                        <GameButtons 
                            onRandom={handleRandomWord} 
                            onStartQuiz={() => {
                                if (!account) { setFeedback({ type: 'error', message: 'Kết nối ví để chơi!' }); return; }
                                setFeedback(null); setQuizWords(selectRandomWords(QUIZ_LENGTH)); setCurrentQuizWordIndex(0); setTimeLeft(QUIZ_TIME_LIMIT); setGameMode('quiz');
                            }} 
                            onAdminMint={handleMintTicket}
                            disabled={isProcessing || isRecording} 
                            hasAccount={!!account}
                            isAdmin={account?.address === ADMIN_ADDRESS}
                        />
                    </>
                )}

                {(gameMode === 'quiz' || gameMode === 'quiz_failed') && (
                     <div className="mb-6 bg-white rounded-2xl shadow-xl p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">
                            Thời gian: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                        </div>
                        <div className="text-lg font-medium text-slate-700 mt-2">
                            Câu: {currentQuizWordIndex + 1} / {QUIZ_LENGTH}
                        </div>
                        {gameMode === 'quiz_failed' && (
                            <button onClick={goToPracticeMode} className="mt-4 w-full p-2 bg-gray-500 text-white rounded-md">Quay lại</button>
                        )}
                    </div>
                )}

                {gameMode === 'quiz_passed' && (
                    <div className="mb-6 bg-green-100 border border-green-500 rounded-2xl shadow-xl p-4 text-center">
                        <h2 className="text-2xl font-bold text-green-700">CHIẾN THẮNG!</h2>
                        <button onClick={handleClaimNft} disabled={isProcessing} className="mt-4 w-full p-2 bg-purple-600 text-white rounded-md">
                            {isProcessing ? "Đang xử lý..." : "Nhận NFT"}
                        </button>
                    </div>
                )}

                <main className="bg-white rounded-2xl shadow-xl p-6 md:p-8 text-center space-y-6">
                    <VocabularyCard 
                        word={currentWord} 
                        isQuizMode={gameMode === 'quiz'} 
                        feedback={feedback} 
                        onPlayAudio={handlePlayAudio} 
                        disabled={isProcessing || isRecording} 
                    />
                    <div className="h-20 flex items-center justify-center p-2">
                        {feedback && (
                            <div className={`w-full p-3 rounded-lg border ${feedbackColor[feedback.type]} animate-fadeIn`}>
                                <p className="font-medium">{feedback.message}</p>
                            </div>
                        )}
                    </div>
                    <Controls 
                        onPrev={handlePrevWord} 
                        onNext={handleNextWord} 
                        onRecord={isRecording ? stopRecording : startRecording} 
                        isRecording={isRecording} 
                        isProcessing={isProcessing} 
                        showNavButtons={gameMode === 'practice'}
                    />
                </main>

                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mt-6">
                    <ConnectedAccount />
                </div>
                <footer className="text-center mt-6 text-slate-500 text-sm"><p>Powered by Google Gemini & ElevenLabs</p></footer>
            </div>
        </div>
    );
};

export default App;