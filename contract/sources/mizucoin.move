
module contract::mizucoin {
    use sui::coin::{Self, TreasuryCap};
    use sui::url;

    // --- SỬA LỖI 1: Tên OTW phải là MIZUCOIN ---
    public struct MIZUCOIN has drop {}

    /// Số tiền thưởng mỗi lần claim: 1 MIZU
    const CLAIM_AMOUNT: u64 = 1_000_000_000; // (1 MIZU, với 9 chữ số 0)

    /// Hàm 'init' chạy 1 lần khi publish
    #[allow(lint(share_owned))]
    // --- SỬA LỖI 2: Dùng MIZUCOIN làm tham số ---
    fun init(otw: MIZUCOIN, ctx: &mut TxContext) {
        let (treasury_cap, metadata) = coin::create_currency(
            otw, // <-- 'otw' bây giờ có kiểu là MIZUCOIN
            9, 
            b"MIZU", 
            b"Mizu Token", 
            b"Token thuong cua Japaniz", 
            option::some(url::new_unsafe_from_bytes(b"https://chocolate-high-aardvark-770.mypinata.cloud/ipfs/bafybeihpvelpcoboxhpz226dsey6we66zp4ci4t6oacvyuhyqj2fka76nq")),
            ctx
        );

        transfer::public_share_object(metadata);
        transfer::public_share_object(treasury_cap);
    }

    /// Hàm "Vòi nước" (Faucet)
    public fun claim(
        // --- SỬA LỖI 3: TreasuryCap phải có kiểu MIZU_COIN ---
        treasury_cap: &mut TreasuryCap<MIZUCOIN>, 
        ctx: &mut TxContext
    ) {
        coin::mint_and_transfer(
            treasury_cap, 
            CLAIM_AMOUNT, 
            tx_context::sender(ctx),
            ctx
        );
    }
}