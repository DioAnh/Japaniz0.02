import React from 'react';
import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import { PACKAGE_ID, MIST_PER_MIZU } from '../config';

export function MizuBalance() {
    const account = useCurrentAccount();
    const { data, isPending, error } = useSuiClientQuery('getBalance', {
        owner: account?.address || '',
        coinType: `${PACKAGE_ID}::mizucoin::MIZUCOIN`,
    }, {
        enabled: !!account,
        refetchInterval: 10000,
    });

    if (!account) return null;
    if (isPending) return <div className="text-sm px-4 py-2">Đang tải...</div>;
    if (error) return <div className="text-sm text-red-500 px-4 py-2">Lỗi tải coin</div>;

    const balance = Number(data.totalBalance);
    const mizuAmount = balance / MIST_PER_MIZU;

    return (
        <div className="bg-yellow-100 rounded-full px-4 py-2 text-lg font-bold text-yellow-800 shadow-md">
            MIZU: {mizuAmount.toFixed(2)}
        </div>
    );
}

export function ConnectedAccount() {
    const account = useCurrentAccount();
    if (!account) {
        return (
            <div>
                <h2 className="text-xl font-bold text-slate-700 mb-2">Kết nối Ví Sui</h2>
                <p className="text-slate-600">Vui lòng kết nối ví của bạn ở góc trên bên phải.</p>
            </div>
        );
    }
    return (
        <div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">Ví đã kết nối</h2>
            <p className="text-slate-600 break-all">Địa chỉ: {account.address}</p>
            <hr className="my-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">NFT Thành Tích:</h3>
            <OwnedObjects address={account.address} />
        </div>
    );
}

function OwnedObjects({ address }: { address: string }) {
    const { data, isPending, error } = useSuiClientQuery('getOwnedObjects', {
        owner: address,
        filter: { StructType: `${PACKAGE_ID}::achievement::JapanizAchievement` },
        options: { showDisplay: true },
    });

    if (isPending) return <div>Đang tải NFT...</div>;
    if (error) return <div>Lỗi tải NFT: {error.message}</div>;
    if (!data || data.data.length === 0) return <div>Bạn chưa có NFT thành tích nào.</div>;

    return (
        <ul className="list-disc list-inside h-40 overflow-y-auto font-mono break-all">
            {data.data.map((object) => (
                <li key={object.data?.objectId}>
                    {object.data?.display?.data?.name || object.data?.objectId}
                </li>
            ))}
        </ul>
    );
}