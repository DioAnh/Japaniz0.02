// frontend/src/components/Header.tsx

import React from 'react';
import { ConnectButton } from '@mysten/dapp-kit';
import { MizuBalance } from './WalletComponents';
import { WalletIcon } from './Icons';

interface HeaderProps {
    score: number;
    handleClaimMizu: () => void;
    isClaiming: boolean;
    hasAccount: boolean;
    pointsToClaim: number;
}

export const Header: React.FC<HeaderProps> = ({ score, handleClaimMizu, isClaiming, hasAccount, pointsToClaim }) => {
    const canClaim = score >= pointsToClaim && hasAccount;

    return (
        <header className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 w-full">
            
            {/* --- LOGO --- */}
            <div className="flex items-center gap-3 select-none">
                <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-200">
                    JP
                </div>
                <h1 className="text-2xl font-black text-slate-700 tracking-tight">JAPANIZ</h1>
            </div>
            
            {/* --- CỤM ĐIỀU KHIỂN --- */}
            <div className="flex flex-wrap items-center justify-center gap-3">
                
                {/* Hộp thông tin (Điểm & Mizu) */}
                <div className="flex items-center bg-white/80 backdrop-blur-md border border-white rounded-2xl px-2 py-1.5 shadow-sm">
                    
                    {/* 1. CỘT ĐIỂM SỐ (Căn giữa + Width cố định) */}
                    <div className="flex flex-col items-center justify-center min-w-[60px]">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Score</span>
                        <span className="text-sm font-black text-slate-700 leading-none">{score}</span>
                    </div>

                    {/* Đường kẻ dọc */}
                    <div className="w-px h-8 bg-slate-200 mx-1"></div>

                    {/* 2. CỘT MIZU (Căn giữa + Width cố định) */}
                    <div className="flex flex-col items-center justify-center min-w-[70px]">
                        <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider leading-none mb-1">Mizu</span>
                        <span className="text-sm font-black text-yellow-600 leading-none">
                            <MizuBalanceWrapper />
                        </span>
                    </div>

                    {/* 3. NÚT ĐỔI (Tách riêng ra, có margin trái) */}
                    <div className="pl-2 border-l border-slate-100 ml-1">
                         <button
                            onClick={handleClaimMizu}
                            disabled={!canClaim || isClaiming}
                            className={`h-8 px-3 rounded-lg text-[10px] font-bold transition-all transform active:scale-95 flex items-center justify-center
                                ${canClaim 
                                    ? 'bg-yellow-400 text-white shadow-md shadow-yellow-200 hover:bg-yellow-500' 
                                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                }`}
                        >
                            {isClaiming ? "..." : "Đổi"}
                        </button>
                    </div>
                </div>

                {/* --- NÚT VÍ CUSTOM --- */}
                <div className="relative group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-all duration-300
                        ${hasAccount 
                            ? 'bg-indigo-600 text-white shadow-indigo-200 group-hover:bg-indigo-700' 
                            : 'bg-white text-slate-400 border-2 border-dashed border-slate-300 group-hover:border-indigo-400 group-hover:text-indigo-500'
                        }`}
                    >
                        <WalletIcon className="w-5 h-5" />
                    </div>
                    <div className="absolute inset-0 opacity-0 overflow-hidden rounded-xl">
                        <ConnectButton 
                            className="!w-full !h-full !p-0 !m-0" 
                            style={{ width: '100%', height: '100%' }} 
                        />
                    </div>
                </div>
            </div>
        </header>
    );
};

// Helper wrapper
import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import { PACKAGE_ID, MIST_PER_MIZU } from '../config';
function MizuBalanceWrapper() {
    const account = useCurrentAccount();
    const { data } = useSuiClientQuery('getBalance', {
        owner: account?.address || '',
        coinType: `${PACKAGE_ID}::mizucoin::MIZUCOIN`,
    }, { enabled: !!account });
    if (!account || !data) return <span>0.00</span>;
    const balance = Number(data.totalBalance) / MIST_PER_MIZU;
    return <span>{balance.toFixed(2)}</span>;
}