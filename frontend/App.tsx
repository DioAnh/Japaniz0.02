// frontend/App.tsx (Đã cập nhật cho Topic, Sui, và Quiz Mode)

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { TOPIC_LIST } from './constants'; 
import type { VocabularyItem, Feedback, EvaluationResult } from './types';
import {
    ConnectButton,
    useCurrentAccount,
    useSuiClientQuery,
    // SỬA: Dùng hook và client mới
    useSuiClient,
    useSignTransaction,
} from '@mysten/dapp-kit';
// --- THÊM MỚI: Class TransactionBlock của Sui ---
import { Transaction } from '@mysten/sui/transactions';
import { bcs } from '@mysten/sui/bcs';
import { TransactionBlock } from '@mysten/sui.js/transactions'; 


// --- SVG Icons ---
// (Giữ nguyên các Icon: SpeakerIcon, MicIcon, NextIcon, PrevIcon)
// --- (Tôi đã xóa ShuffleIcon theo yêu cầu của bạn) ---
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
const PrevIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
);



// --- THÊM MỚI: Cấu hình Quiz và NFT ---
// !!! QUAN TRỌNG: Hãy thay thế bằng Package ID của bạn sau khi deploy contract
const PACKAGE_ID = "0x7390eda149bea5fb0256f78abd331e9ecefd9dea3ecfbaf38487757a6d49eb0f";
const ADMIN_ADDRESS = "0xa9008f618a6885e6d5ab99eb1173ddbca23c4368b146ccf3d5f32be1e8181b46"; 
const QUIZ_TIME_LIMIT = 120;
const MIZU_TREASURY_CAP_ID = "0x1d6e35eb94f74318f78572b8c6b80e53ed5a80c28ee5947b84478f049399fadc";
const QUIZ_LENGTH = 1; // 10 từ
const POINTS_TO_CLAIM_MIZU = 30;
const TEMP_TICKET_ID = "0x0000000000000000000000000000000000000000000000000000000000000000"; 
// ---

// --- Audio Utility Functions ---
// (Giữ nguyên: decode, blobToBase64)
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

// --- Helper Functions for localStorage ---
// (Giữ nguyên: getSavedState)
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

// --- THÊM MỚI: Helper chọn từ ngẫu nhiên ---
const selectRandomWords = (count: number): VocabularyItem[] => {
    // 1. Gộp tất cả từ vựng từ mọi topic
    const allWords = TOPIC_LIST.flatMap(topic => topic.vocabulary);
    
    // 2. Xáo trộn danh sách
    const shuffled = allWords.sort(() => 0.5 - Math.random());
    
    // 3. Lấy 10 từ đầu tiên
    return shuffled.slice(0, count);
};


const App: React.FC = () => {
    // State Luyện tập
    const [score, setScore] = useState(() => Number(localStorage.getItem('japaniz_score') || 0));
    const [currentTopicIndex, setCurrentTopicIndex] = useState(getSavedState().topicIndex);
    const [currentWordInTopicIndex, setCurrentWordInTopicIndex] = useState(getSavedState().wordIndex);

    // State Chung
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Dùng cho nút Claim
    const [isClaiming, setIsClaiming] = useState(false);

    // --- THÊM MỚI: State cho Quiz Mode ---
    type GameMode = 'practice' | 'quiz' | 'quiz_failed' | 'quiz_passed';
    const [gameMode, setGameMode] = useState<GameMode>('practice');
    const [quizWords, setQuizWords] = useState<VocabularyItem[]>([]);
    const [currentQuizWordIndex, setCurrentQuizWordIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(QUIZ_TIME_LIMIT);
    // ---

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingTimeoutRef = useRef<number | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    
    // --- THÊM MỚI: Hooks của Sui ---
    const account = useCurrentAccount();
    const client = useSuiClient(); // Thêm dòng này
    const { mutateAsync: signTransaction } = useSignTransaction(); // Sửa hook và tên biến


    const handleMintTicket = () => {
    if (!account || account.address !== ADMIN_ADDRESS) {
        alert("Chức năng chỉ dành cho Admin!");
        return;
    }
    
    // Bắt đầu xử lý
    setFeedback({ type: 'info', message: 'ADMIN: Đang tạo vé NFT, vui lòng ký...' });
    
    // Dùng Transaction mới
    const txb = new Transaction(); 

    // 1. Gọi hàm mint_event_ticket
    const newTicket = txb.moveCall({
        target: `${PACKAGE_ID}::ticketnft::mint_event_ticket`,
        arguments: [
            txb.pure.string("Summer Event 2026"), // Tên vé
            txb.pure.string("https://chocolate-high-aardvark-770.mypinata.cloud/ipfs/bafybeices7ku37fvsisiwm7y7guxl5zokl7zbhnvc6nervmfivi364tmym"), // Link ảnh
        ],
    });

    // 2. Chuyển NFT về ví Admin
    // Dùng txb.transfer cho Transaction mới
    txb.transferObjects([newTicket], txb.pure.address(ADMIN_ADDRESS));

    // Thực thi giao dịch (dùng flow 2 bước: signTransaction + executeTransactionBlock)
    signTransaction({
        transaction: txb, 
    }, {
        onSuccess: async (result) => {
            // Chuyển sang execute (như trong tài liệu Sui)
            const executeResult = await client.executeTransactionBlock({
                transactionBlock: result.bytes,
                signature: result.signature,
                options: {
                    showRawEffects: true,
                },
            });

            console.log("Mint NFT thành công!", executeResult);
            alert("Mint NFT thành công! Kiểm tra console để xem chi tiết Object ID.");

            // LOGIC QUAN TRỌNG: Tìm Object ID của NFT mới tạo
            const newObject = executeResult.objectChanges?.find(
                (change) => change.type === "created" && change.objectType.includes("EventTicket")
            );
            if (newObject && 'objectId' in newObject) {
                console.log("=========================================");
                console.log("ID VÉ NFT MỚI (Cần dùng cho App.tsx):", newObject.objectId);
                console.log("=========================================");
            }
            setFeedback(null);
        },
        onError: (error) => {
            console.error("Mint NFT thất bại:", error);
            alert(`Mint NFT thất bại: ${error.message}`);
            setFeedback(null);
        },
    });
};
    



    // --- SỬA ĐỔI: 'currentWord' giờ phụ thuộc vào gameMode ---
    const currentWord = useMemo(() => {
        if (gameMode === 'quiz' || gameMode === 'quiz_failed') {
            return quizWords[currentQuizWordIndex];
        }
        // Mặc định là 'practice' hoặc 'quiz_passed' (hiển thị từ cuối)
        return TOPIC_LIST[currentTopicIndex].vocabulary[currentWordInTopicIndex];
    }, [gameMode, quizWords, currentQuizWordIndex, currentTopicIndex, currentWordInTopicIndex]);
    
    const currentWordList = TOPIC_LIST[currentTopicIndex].vocabulary;
    // ---

    // useEffect để lưu state (Giữ nguyên)
    useEffect(() => {
        // Chỉ lưu state khi ở chế độ luyện tập
        if (gameMode === 'practice') {
            localStorage.setItem('japaniz_topic_index', String(currentTopicIndex));
            localStorage.setItem('japaniz_word_index', String(currentWordInTopicIndex));
        }
    }, [currentTopicIndex, currentWordInTopicIndex, gameMode]);

    useEffect(() => {
        localStorage.setItem('japaniz_score', String(score));
    }, [score]);

    // --- THÊM MỚI: useEffect cho đồng hồ đếm ngược Quiz ---
    useEffect(() => {
        if (gameMode !== 'quiz' || isProcessing) {
            return; // Dừng lại nếu không trong quiz hoặc đang xử lý
        }

        if (timeLeft <= 0) {
            // Hết giờ!
            setFeedback({ type: 'error', message: 'Hết giờ! Bạn đã thua.' });
            setGameMode('quiz_failed');
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        // Cleanup function
        return () => clearInterval(timerId);

    }, [gameMode, timeLeft, isProcessing]);
    // ---


    const playCurrentWordAudio = useCallback(async () => {
        // (Code giữ nguyên)
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
        const { base64Audio, mimeType } = await response.json();
        const audioData = decode(base64Audio);
        const audioBlob = new Blob([audioData], { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
        return new Promise<void>((resolve) => {
            audio.onended = () => {
                URL.revokeObjectURL(audioUrl); 
                resolve();
            };
        });
    }, [currentWord]); 

    const handlePlayAudio = useCallback(async () => {
        // (Code giữ nguyên)
        if (isProcessing || isRecording) return;
        setIsProcessing(true);
        setFeedback({ type: 'info', message: 'Đang phát âm mẫu...' });
        let hasError = false;
        try {
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

    const playFeedbackAudio = useCallback(async (text: string) => {
        // (Code giữ nguyên)
        if (!text || !text.trim()) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'vi-VN';
        window.speechSynthesis.speak(utterance);
        return Promise.resolve();
    }, []);


    // --- THÊM MỚI: Hàm xử lý kết quả Quiz ---
    const handleQuizAnswer = (isCorrect: boolean) => {
        if (!isCorrect) {
            setFeedback({ type: 'incorrect', message: 'Phát âm chưa đúng! Hãy thử lại.' });
            return; // Cho phép người dùng thử lại từ này
        }

        // Nếu đúng
        setFeedback({ type: 'correct', message: 'Chính xác!' });

        const nextWordIndex = currentQuizWordIndex + 1;

        if (nextWordIndex >= QUIZ_LENGTH) {
            // THẮNG QUIZ!
            setGameMode('quiz_passed');
            setFeedback({ type: 'correct', message: 'Chúc mừng! Bạn đã hoàn thành Quiz!' });
        } else {
            // Chuyển sang từ tiếp theo
            setTimeout(() => {
                setCurrentQuizWordIndex(nextWordIndex);
                setFeedback(null);
            }, 1500); // Chờ 1.5s rồi chuyển
        }
    };
    // ---


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

            // --- SỬA ĐỔI: Phân luồng logic Practice / Quiz ---
            if (gameMode === 'practice') {
                const feedbackMessage = result.feedback || (result.isCorrect ? "Rất tốt!" : "Hãy thử lại nhé, bạn có thể làm được!");
                if (result.isCorrect) {
                    setScore(s => s + 10);
                    setFeedback({ type: 'correct', message: feedbackMessage });
                } else {
                    setFeedback({ type: 'incorrect', message: feedbackMessage });
                }
                await playCurrentWordAudio(); 
            } 
            else if (gameMode === 'quiz') {
                handleQuizAnswer(result.isCorrect);
            }
            // ---

        } catch (error) {
            console.error("Lỗi trong quá trình đánh giá:", error);
            const errorMessage = 'Đã xảy ra lỗi phân tích. Vui lòng thử lại.';
            setFeedback({ type: 'error', message: errorMessage });
            await playFeedbackAudio('Đã xảy ra lỗi').catch(audioError => {
                console.error("Không thể phát âm thanh báo lỗi chung.", audioError);
            });
        } finally {
            setIsProcessing(false);
        }
    }, [currentWord, playFeedbackAudio, playCurrentWordAudio, score, gameMode, currentQuizWordIndex]); // THÊM dependency

    const stopRecording = useCallback(() => {
        // (Code giữ nguyên)
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
        // (Code giữ nguyên)
        if (isRecording) return;
        setFeedback({ type: 'info', message: 'Hãy nói và nhấn nút lần nữa để dừng...' });
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

    // --- Các hàm xử lý của Practice Mode (Giữ nguyên) ---
    const handleNextWord = () => {
        setFeedback(null);
        if (currentWordInTopicIndex < currentWordList.length - 1) {
            setCurrentWordInTopicIndex(prev => prev + 1);
        } 
        else if (currentTopicIndex < TOPIC_LIST.length - 1) {
            setCurrentTopicIndex(prev => prev + 1); 
            setCurrentWordInTopicIndex(0); 
        }
        else {
            setFeedback({ type: 'info', message: `Hoàn thành! Bạn đã đạt ${score} điểm. Bắt đầu lại.` });
            setCurrentTopicIndex(0); 
            setCurrentWordInTopicIndex(0); 
            setScore(0);
        }
    };
    const handlePrevWord = () => {
        setFeedback(null);
        if (currentWordInTopicIndex > 0) {
            setCurrentWordInTopicIndex(prev => prev - 1);
        }
        else if (currentTopicIndex > 0) {
            const prevTopicIndex = currentTopicIndex - 1;
            const prevTopicWordCount = TOPIC_LIST[prevTopicIndex].vocabulary.length;
            setCurrentTopicIndex(prevTopicIndex); 
            setCurrentWordInTopicIndex(prevTopicWordCount - 1); 
        }
        else {
            const lastTopicIndex = TOPIC_LIST.length - 1;
            const lastTopicWordCount = TOPIC_LIST[lastTopicIndex].vocabulary.length;
            setCurrentTopicIndex(lastTopicIndex); 
            setCurrentWordInTopicIndex(lastTopicWordCount - 1); 
        }
    };
    const handleSelectTopic = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newTopicIndex = Number(e.target.value);
        setCurrentTopicIndex(newTopicIndex);
        setCurrentWordInTopicIndex(0); 
        setFeedback(null);
    };
    const handleSelectWord = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newWordIndex = Number(e.target.value);
        setCurrentWordInTopicIndex(newWordIndex);
        setFeedback(null);
    };
    const handleRandomWord = useCallback(() => {
        const randomTopicIndex = Math.floor(Math.random() * TOPIC_LIST.length);
        const randomTopic = TOPIC_LIST[randomTopicIndex];
        const randomWordIndex = Math.floor(Math.random() * randomTopic.vocabulary.length);
        setCurrentTopicIndex(randomTopicIndex);
        setCurrentWordInTopicIndex(randomWordIndex);
        setFeedback(null);
        setIsProcessing(false);
        setIsRecording(false);
    }, []); 
    // ---


    // --- THÊM MỚI: Các hàm xử lý của Quiz Mode ---
    const startQuiz = () => {
        if (!account) {
            setFeedback({ type: 'error', message: 'Vui lòng kết nối ví Sui để bắt đầu Quiz!' });
            return;
        }
        setFeedback(null);
        setQuizWords(selectRandomWords(QUIZ_LENGTH));
        setCurrentQuizWordIndex(0);
        setTimeLeft(QUIZ_TIME_LIMIT);
        setGameMode('quiz');
    };



// --- SỬA LỖI: Viết lại hoàn toàn hàm handleClaimNft

const handleClaimNft = useCallback(async () => {
        if (!account) {
            setFeedback({ type: 'error', message: 'Lỗi: Mất kết nối ví!' });
            return;
        }

        setIsProcessing(true); // Bắt đầu xử lý
        setFeedback({ type: 'info', message: 'Đang tạo ảnh NFT, vui lòng đợi...' });

        try {
            // --- BƯỚC 1: Gọi backend để tạo ảnh ---
            const imageResponse = await fetch("/.netlify/functions/generateImage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    topic: "Japaniz Quiz Champion" // Gửi một chủ đề chung
                }),
            });

            if (!imageResponse.ok) {
                throw new Error("Lỗi khi tạo ảnh NFT.");
            }

            const { imageUrl } = await imageResponse.json();

            if (!imageUrl) {
                 throw new Error("Không nhận được ảnh từ server.");
            }

            // --- BƯỚC 2: Chuẩn bị giao dịch Sui ---
            setFeedback({ type: 'info', message: 'Ảnh đã sẵn sàng! Vui lòng ký giao dịch...' });

            const txb = new Transaction();
            
            // Helper để chuyển string thành 'pure' vector<u8>
            const pureVectorU8 = (str: string) => txb.pure(
                bcs.vector(bcs.u8()).serialize(new TextEncoder().encode(str))
            );

            txb.moveCall({
                target: `${PACKAGE_ID}::achievement::mint_achievement`,
                arguments: [
                    pureVectorU8("Japaniz Quiz Challenge"),
                    txb.pure.u64(100),
                    pureVectorU8(imageUrl),
                    txb.pure.address(account.address),
                ],
            });

            // --- BƯỚC 3: Yêu cầu người dùng ký (dùng flow 2-bước) ---
            const { bytes, signature, reportTransactionEffects } = await signTransaction({
                transaction: txb,
            });
            
            setFeedback({ type: 'info', message: 'Đã ký! Đang gửi lên blockchain...' });

            // --- BƯỚC 4: Thực thi giao dịch ---
            const executeResult = await client.executeTransactionBlock({
                transactionBlock: bytes,
                signature,
                options: {
                    showRawEffects: true, // Bắt buộc
                },
            });

            // --- BƯỚC 5: Báo cáo kết quả về ví ---
            reportTransactionEffects(executeResult.rawEffects!);

            // --- BƯỚC 6: Xử lý thành công ---
            console.log('NFT Minted!', executeResult);
            setFeedback({ type: 'correct', message: 'Nhận NFT thành công! Kiểm tra ví của bạn.' });
            setTimeout(goToPracticeMode, 3000); 

        } catch (error: any) {
            console.error('Lỗi trong quá trình claim:', error);
            setFeedback({ type: 'error', message: error.message || 'Lỗi không xác định' });
            setIsProcessing(false);
        }

    }, [account, currentTopicIndex, signTransaction, client]); // THAY ĐỔI: dependencies
    // ---


// --- THÊM MỚI: Hàm Claim 1 MIZU ---
    const handleClaimMizu = useCallback(async () => {
        if (!account) {
            setFeedback({ type: 'error', message: 'Lỗi: Vui lòng kết nối ví!' });
            return;
        }
        
        // 1. Kiểm tra điểm
        if (score < POINTS_TO_CLAIM_MIZU) {
            setFeedback({ type: 'error', message: `Bạn cần ${POINTS_TO_CLAIM_MIZU} điểm để đổi 1 MIZU!` });
            return;
        }

        setIsClaiming(true);
        setFeedback({ type: 'info', message: 'Đang đổi 1 MIZU, vui lòng ký giao dịch...' });

        try {
            const txb = new Transaction();
            
            // Thêm TreasuryCap (Shared Object) vào giao dịch
            const treasuryCapArg = txb.object(MIZU_TREASURY_CAP_ID);

            txb.moveCall({
                target: `${PACKAGE_ID}::mizucoin::claim`,
                arguments: [
                    treasuryCapArg, // treasury_cap: &mut TreasuryCap
                    // ctx được tự động thêm vào
                ],
            });

            // 2. Yêu cầu ký
            const { bytes, signature, reportTransactionEffects } = await signTransaction({
                transaction: txb,
            });
            
            setFeedback({ type: 'info', message: 'Đã ký! Đang gửi...' });

            // 3. Thực thi
            const executeResult = await client.executeTransactionBlock({
                transactionBlock: bytes,
                signature,
                options: { showRawEffects: true },
            });
            reportTransactionEffects(executeResult.rawEffects!);

            // 4. Thành công: Trừ điểm!
            console.log('Claimed MIZU!', executeResult);
            setFeedback({ type: 'correct', message: 'Nhận 1 MIZU thành công!' });
            setScore(s => s - POINTS_TO_CLAIM_MIZU); // Trừ điểm
            setIsClaiming(false);

        } catch (error: any) {
            console.error('Lỗi Claim MIZU:', error);
            setFeedback({ type: 'error', message: error.message || 'Lỗi không xác định' });
            setIsClaiming(false);
        }

    }, [account, signTransaction, client, score]); // Thêm 'score' vào dependency
    // ---



// --- THÊM MỚI: Hàm Mua Ticket NFT

    const handleBuyTicket = useCallback(async () => {
    if (!account) {
        setFeedback({ type: 'error', message: 'Vui lòng kết nối ví!' });
        return;
    }
    
    // Giá vé là 10 MIZU (tức 10 tỷ MIST)
    // LƯU Ý: Vì bạn chỉ có 1 MIZU (1 tỷ MIST), bạn CẦN ít nhất 10 MIZU 
    // để mua vé. Nếu không, giao dịch sẽ THẤT BẠI vì 'Insufficient balance'.
    const MIZU_PRICE = 1 * 1_000_000_000; 
    const TICKET_ID = TEMP_TICKET_ID; // Dùng ID vé Admin đã mint

    if (TICKET_ID === "0x0000000000000000000000000000000000000000000000000000000000000000") {
        setFeedback({ type: 'error', message: 'Lỗi: Admin chưa thiết lập ID vé NFT.' });
        return;
    }

    setIsClaiming(true);
    setFeedback({ type: 'info', message: 'Đang mua vé (10 MIZU), vui lòng ký giao dịch...' });

    try {
        // --- BƯỚC 1: LẤY VẬT PHẨM COIN MIZU ---
        const mizuCoinType = `${PACKAGE_ID}::mizucoin::MIZUCOIN`;
        const coinResponse = await client.getCoins({
            owner: account.address,
            coinType: mizuCoinType,
        });

        if (!coinResponse.data || coinResponse.data.length === 0) {
            throw new Error("Không tìm thấy Coin MIZU để thanh toán.");
        }
        
        // Lấy ID của Coin MIZU đầu tiên (Object ID)
        const coinToSplitId = coinResponse.data[0].coinObjectId;
        
        // --- BƯỚC 2: TẠO TRANSACTION BLOCK ---
        const txb = new Transaction();
        
        // 1. TẠO OBJECT TỪ ID
        const coinObject = txb.object(coinToSplitId);
        
        // 2. CHIA NHỎ COIN: Lấy chính xác 10 MIZU
        // (Nếu số dư nhỏ hơn MIZU_PRICE, lỗi sẽ xảy ra ở đây)
        const [paymentCoin] = txb.splitCoin(
             coinObject, 
             MIZU_PRICE
        );

        // 3. GỌI HÀM MOVE
        txb.moveCall({
            target: `${PACKAGE_ID}::ticketnft::purchase_ticket`,
            arguments: [
                txb.object(TICKET_ID), // 1. ticket: EventTicket (ID Admin đã mint)
                paymentCoin,          // 2. payment: Coin<MIZUCOIN> (Vật phẩm vừa split)
            ],
        });

        // --- BƯỚC 4: Ký và Thực thi ---
        const { bytes, signature } = await signTransaction({ transaction: txb });
        
        setFeedback({ type: 'info', message: 'Đã ký! Đang gửi lên blockchain...' });

        const executeResult = await client.executeTransactionBlock({
            transactionBlock: bytes, signature, options: { showRawEffects: true },
        });
        
        reportTransactionEffects(executeResult.rawEffects!);
        console.log('Mua vé thành công!', executeResult);
        setFeedback({ type: 'correct', message: 'Mua vé thành công! Kiểm tra NFT của bạn.' });
        setIsClaiming(false);

    } catch (error: any) {
        console.error('Lỗi Mua Vé:', error);
        setFeedback({ 
            type: 'error', 
            message: `Lỗi mua vé: ${(error.message || 'Lỗi không xác định').substring(0, 100)}` 
        });
        setIsClaiming(false);
    }
}, [account, client, signTransaction]);


    const goToPracticeMode = () => {
        setFeedback(null);
        setGameMode('practice');
        setQuizWords([]);
        setCurrentQuizWordIndex(0);
        setTimeLeft(QUIZ_TIME_LIMIT);
    };
    // ---


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
                    <h1 className="text-2xl font-bold text-slate-700">
                        Luyện phát âm
                    </h1>
                    {/* SỬA: Thêm nút Claim MIZU */}
                    <div className="flex items-center gap-2">
                        <div className="bg-white rounded-full px-4 py-2 text-lg font-bold text-indigo-600 shadow-md">
                            Điểm: {score}
                        </div>
                        <MizuBalance />
                        <button
                            onClick={handleClaimMizu}
                            disabled={score < POINTS_TO_CLAIM_MIZU || isClaiming || !account}
                            className="px-3 py-2 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            title={
                                !account ? "Kết nối ví để đổi điểm" :
                                score < POINTS_TO_CLAIM_MIZU ? `Cần ${POINTS_TO_CLAIM_MIZU} điểm` : "Đổi 1000 điểm lấy 1 MIZU"
                            }
                        >
                            {isClaiming ? "..." : "Đổi MIZU"}
                        </button>
                        <ConnectButton />
                    </div>
                </header>
                
                {/* --- SỬA ĐỔI: Giao diện điều khiển theo gameMode --- */}

                {/* === CHẾ ĐỘ PRACTICE (LUYỆN TẬP) === */}
                {gameMode === 'practice' && (
                    <>
                        {/* THÊM NÚT ADMIN MINTING TẠM THỜI Ở ĐÂY */}
                        {account?.address === ADMIN_ADDRESS && (
                            <div className="mb-4">
                                <button
                                    onClick={handleMintTicket}
                                    className="w-full flex items-center justify-center p-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
                                    title="Tạo NFT Ticket để người dùng có thể mua"
                                >
                                    ADMIN: Mint Vé Sự Kiện (EventTicket)
                                </button>
                            </div>
                        )}
                        {/* KẾT THÚC THÊM NÚT ADMIN MINTING */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label htmlFor="topic-select" className="block text-sm font-medium text-slate-700 mb-1">
                                    Chủ đề
                                </label>
                                <select
                                    id="topic-select"
                                    value={currentTopicIndex}
                                    onChange={handleSelectTopic}
                                    className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    {TOPIC_LIST.map((topic, index) => (
                                        <option key={index} value={index}>
                                            {topic.topicName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="word-select" className="block text-sm font-medium text-slate-700 mb-1">
                                    Từ vựng
                                </label>
                                <select
                                    id="word-select"
                                    value={currentWordInTopicIndex}
                                    onChange={handleSelectWord}
                                    className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    {currentWordList.map((word, index) => (
                                        <option key={index} value={index}>
                                            {index + 1}. {word.japanese}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="mb-6 grid grid-cols-2 gap-4">
                            <button
                                onClick={handleRandomWord}
                                disabled={isProcessing || isRecording}
                                className="w-full flex items-center justify-center p-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors font-medium"
                            >
                                Từ ngẫu nhiên
                            </button>
                            <button
                                onClick={startQuiz}
                                disabled={isProcessing || isRecording || !account}
                                className="w-full flex items-center justify-center p-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors font-medium"
                                title={!account ? "Vui lòng kết nối ví để chơi Quiz" : "Bắt đầu thử thách"}
                            >
                                Bắt đầu Quiz (NFT)
                            </button>
                        </div>
                    </>
                )}

                {/* === CHẾ ĐỘ QUIZ (ĐANG CHƠI) === */}
                {(gameMode === 'quiz' || gameMode === 'quiz_failed') && (
                    <div className="mb-6 bg-white rounded-2xl shadow-xl p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">
                            Thời gian: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                        </div>
                        <div className="text-lg font-medium text-slate-700 mt-2">
                            Tiến độ: {currentQuizWordIndex + 1} / {QUIZ_LENGTH}
                        </div>
                        {gameMode === 'quiz_failed' && (
                             <button
                                onClick={goToPracticeMode}
                                className="mt-4 w-full p-2 bg-gray-500 text-white rounded-md shadow-sm hover:bg-gray-600"
                            >
                                Quay lại Luyện tập
                            </button>
                        )}
                    </div>
                )}

                {/* === CHẾ ĐỘ QUIZ PASSED (THẮNG) === */}
                {gameMode === 'quiz_passed' && (
                    <div className="mb-6 bg-green-100 border border-green-500 rounded-2xl shadow-xl p-4 text-center">
                        <h2 className="text-2xl font-bold text-green-700">CHIẾN THẮNG!</h2>
                        <p className="text-slate-700 mt-2">Bạn đã hoàn thành 10 từ trong thời gian quy định. Hãy nhận NFT!</p>
                        <button
                            onClick={handleClaimNft}
                            disabled={isProcessing || !account}
                            className="mt-4 w-full p-2 bg-purple-600 text-white rounded-md shadow-sm hover:bg-purple-700 disabled:opacity-50 font-medium"
                        >
                            {isProcessing ? "Đang xử lý..." : "Nhận NFT Thành Tích"}
                        </button>
                    </div>
                )}
                
                {/* --- KẾT THÚC SỬA ĐỔI GIAO DIỆN --- */}


                <main className="bg-white rounded-2xl shadow-xl p-6 md:p-8 text-center space-y-6">
                    {/* Vocabulary Card (Giữ nguyên) */}
                    <div className="relative">
                        <>
                            <p className="text-5xl md:text-6xl font-bold text-slate-800 mb-2" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
                                {currentWord.japanese}
                            </p>
                            <p className="text-2xl text-slate-600" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
                                {currentWord.hiragana}
                            </p>
                            <p className="text-xl text-slate-500 mt-2">{currentWord.romaji}</p>
                            <p className="text-lg font-medium text-indigo-600 mt-2">{currentWord.vietnamese}</p>
                        </>
                        <button
                            onClick={handlePlayAudio}
                            disabled={isProcessing || isRecording}
                            className="absolute top-0 right-0 p-2 text-slate-500 hover:text-indigo-600 disabled:text-slate-300 transition-colors"
                            aria-label="Nghe phát âm mẫu"
                         >
                            <SpeakerIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Feedback Display (Giữ nguyên) */}
                    <div className="h-24 flex items-center justify-center p-2">
                        {feedback && (
                            <div key={feedback.message} className={`w-full p-3 rounded-lg border ${feedbackColor[feedback.type]} animate-fadeIn`}>
                                <p className="font-medium">{feedback.message}</p>
                            </div>
                        )}
                    </div>
                    
                    {/* --- SỬA ĐỔI: Nút điều khiển theo gameMode --- */}
                     <div className="flex items-center justify-center space-x-4 h-24">
                        
                        {/* Nút của Practice Mode */}
                        {gameMode === 'practice' && (
                            <>
                                <button
                                onClick={handlePrevWord}
                                    disabled={isProcessing || isRecording}
                                className="flex items-center justify-center w-20 h-20 bg-gray-300 text-slate-700 rounded-full shadow-md hover:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-300 focus:ring-offset-2 transition-all disabled:opacity-50"
                                aria-label="Từ phía trước"
                            >
                                <PrevIcon className="w-8 h-8"/>
                            </button>
                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                disabled={isProcessing}
                                className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50
                                    ${isRecording ? 'bg-red-500 text-white shadow-lg scale-110 focus:ring-red-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md focus:ring-indigo-500'}`}
                               >
                                {isRecording && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                                <MicIcon className="w-10 h-10" />
                            </button>
                            <button
                                onClick={handleNextWord}
                                    disabled={isProcessing || isRecording}
                                className="flex items-center justify-center w-20 h-20 bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-offset-2 transition-all disabled:opacity-50"
                                aria-label="Từ tiếp theo"
                            >
                                <NextIcon className="w-8 h-8"/>
                            </button>
                            </>
                        )}

                        {/* Nút của Quiz Mode */}
                        {(gameMode === 'quiz' || gameMode === 'quiz_failed') && (
                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                disabled={isProcessing || gameMode === 'quiz_failed'}
                                className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50
                                ${isRecording ? 'bg-red-500 text-white shadow-lg scale-110 focus:ring-red-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md focus:ring-indigo-500'}`}
                           >
                                {isRecording && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                                <MicIcon className="w-10 h-10" />
                        </button>
                        )}
                    </div>

                </main>
                
                {/* Component hiển thị ví (Giữ nguyên) */}
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mt-6">
                    <ConnectedAccount />
                </div>

                <footer className="text-center mt-6 text-slate-500 text-sm">
                    <p>Google Gemini & ElevenLabs API</p>
                 </footer>
               </div>
        </div>
    );
};


// Component hiển thị thông tin ví (Giữ nguyên)
function ConnectedAccount() {
    const account = useCurrentAccount();
    if (!account) {
        return (
            <div>
                <h2 className="text-xl font-bold text-slate-700 mb-2">
                    Kết nối Ví Sui
                </h2>
                <p className="text-slate-600">
                    Vui lòng kết nối ví của bạn ở góc trên bên phải để xem thông tin và chơi Quiz.
                </p>
            </div>
        );
    }
    return (
        <div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">
                Ví đã kết nối
            </h2>
            <p className="text-slate-600" style={{ wordWrap: 'break-word' }}>
                Địa chỉ: {account.address}
            </p>
            <hr className="my-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
                NFT Thành Tích (trên Testnet):
            </h3>
            <OwnedObjects address={account.address} />
        </div>
    );
}

// Component hiển thị vật phẩm (Giữ nguyên)
function OwnedObjects({ address }: { address: string }) {
    const { data, isPending, error } = useSuiClientQuery('getOwnedObjects', {
        owner: address,
        // --- THÊM MỚI: Lọc để chỉ hiển thị NFT của bạn ---
        // (Sử dụng cấu trúc Type của NFT: PackageID::module::Struct)
        filter: { StructType: `${PACKAGE_ID}::achievement::JapanizAchievement` },
        options: { showDisplay: true }, // Yêu cầu hiển thị metadata
    });

    if (isPending) {
        return <div>Đang tải NFT...</div>;
    }
    if (error) {
        return <div>Lỗi tải NFT: {error.message}</div>;
    }
    if (!data || data.data.length === 0) {
        return <div>Bạn chưa có NFT thành tích nào. Hãy thắng Quiz!</div>;
    }
    return (
        <ul
            className="list-disc list-inside h-40 overflow-y-auto"
            style={{ fontFamily: 'monospace', wordWrap: 'break-word' }}
        >
            {data.data.map((object) => (
                <li key={object.data?.objectId}>
                    {/* Hiển thị tên từ metadata nếu có */}
                    {object.data?.display?.data?.name || object.data?.objectId}
                </li>
            ))}
        </ul>
    );
}



const MIST_PER_MIZU = 1_000_000_000; 

function MizuBalance() {
    const account = useCurrentAccount();
    // Lệnh query để lấy số dư Coin MIZU của địa chỉ
    const { data, isPending, error } = useSuiClientQuery('getBalance', {
        owner: account?.address || '',
        coinType: `${PACKAGE_ID}::mizucoin::MIZUCOIN`,
    }, {
        // Chỉ chạy query khi có tài khoản
        enabled: !!account,
        refetchInterval: 10000, // Cập nhật sau mỗi 10 giây
    });

    if (!account) return null;
    if (isPending) return <div className="text-sm px-4 py-2">Đang tải MIZU...</div>;
    if (error) return <div className="text-sm text-red-500 px-4 py-2">Lỗi tải coin</div>;

    // Tính toán số MIZU (tổng MIST / 1 tỷ)
    const balance = Number(data.totalBalance);
    const mizuAmount = balance / MIST_PER_MIZU;

    return (
        <div className="bg-yellow-100 rounded-full px-4 py-2 text-lg font-bold text-yellow-800 shadow-md">
            MIZU: {mizuAmount.toFixed(2)}
        </div>
    );
}



export default App;