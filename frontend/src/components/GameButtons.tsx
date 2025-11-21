import React from 'react';

interface GameButtonsProps {
    onRandom: () => void;
    onStartQuiz: () => void;
    onAdminMint: () => void;
    disabled: boolean;
    hasAccount: boolean;
    isAdmin: boolean;
}

export const GameButtons: React.FC<GameButtonsProps> = ({ onRandom, onStartQuiz, onAdminMint, disabled, hasAccount, isAdmin }) => {
    return (
        <>
             {isAdmin && (
                <div className="mb-4">
                    <button onClick={onAdminMint} className="w-full flex items-center justify-center p-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 transition-colors font-medium">
                        ADMIN: Mint Vé Sự Kiện
                    </button>
                </div>
            )}
            <div className="mb-6 grid grid-cols-2 gap-4">
                <button onClick={onRandom} disabled={disabled} className="w-full flex items-center justify-center p-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors font-medium">
                    Từ ngẫu nhiên
                </button>
                <button 
                    onClick={onStartQuiz} 
                    disabled={disabled || !hasAccount} 
                    className="w-full flex items-center justify-center p-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
                    title={!hasAccount ? "Vui lòng kết nối ví" : "Bắt đầu thử thách"}
                >
                    Bắt đầu Quiz (NFT)
                </button>
            </div>
        </>
    );
};