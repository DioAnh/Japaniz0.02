// sources/ticketnft.move

module contract::ticketnft {
    use std::string::{Self, String};
    use sui::coin::{Self, Coin};
    use sui::package;
    use sui::display;

    /// NFT vé sự kiện (NFT tiêu hao)
    public struct EventTicket has key, store {
        id: UID,
        name: String,
        event_image_url: String,
        is_used: bool
    }

    // --- Cấu trúc One-Time-Witness (OTW) ---
    public struct TICKETNFT has drop {}

    /// Hàm 'init' để tạo Display Object
    #[allow(lint(share_owned))]
    fun init(otw: TICKETNFT, ctx: &mut TxContext) {
        let publisher = package::claim(otw, ctx); 
        let mut display = display::new<EventTicket>(&publisher, ctx);

        // Cấu hình Display
        display::add(&mut display, string::utf8(b"name"), string::utf8(b"Event Ticket: {name}")); 
        display::add(&mut display, string::utf8(b"description"), string::utf8(b"Vé tham gia sự kiện độc quyền Japaniz. Dùng 1 lần."));
        display::add(&mut display, string::utf8(b"image_url"), string::utf8(b"{event_image_url}")); // <--- THAY LINK ẢNH NÀY
        display::add(&mut display, string::utf8(b"is_used"), string::utf8(b"{is_used}"));

        display::update_version(&mut display);
        transfer::public_transfer(publisher, tx_context::sender(ctx));
        transfer::public_share_object(display);
    }

    /// Hàm mint NFT vé - Chỉ admin mới được gọi
    public fun mint_event_ticket(
        event_name: vector<u8>,
        image_url: vector<u8>,
        ctx: &mut TxContext
    ): EventTicket {
        EventTicket {
            id: object::new(ctx),
            name: string::utf8(event_name), // <-- Dùng tên Admin input
            event_image_url: string::utf8(image_url), // <-- Dùng URL Admin input
            is_used: false
        }
    }

    /// Hàm Mua Vé (Entry function) - Người dùng gọi để đổi Coin lấy Vé
    public fun purchase_ticket( 
        ticket: EventTicket, 
        payment: Coin<contract::mizucoin::MIZUCOIN>, 
        ctx: &mut TxContext
    ) {
        let required_amount: u64 = 10_000_000_000; // (10 MIZU)
        
        // 1. Kiểm tra số tiền
        assert!(coin::value(&payment) >= required_amount, 0); 
        
        // 2. Tính toán số tiền cần trả lại (THÊM DÒNG NÀY)
        let amount_to_return = coin::value(&payment) - required_amount;
        
        let mut payment_mut = payment; 

        // 3. Tách phần tiền thừa (change)
        // SỬA LỖI: Bây giờ chúng ta dùng biến 'amount_to_return' đã tính toán
        let change = coin::split(
            &mut payment_mut, 
            amount_to_return, // <-- DÙNG BIẾN ĐÃ TÍNH TOÁN
            ctx
        );

        // 4. Trả lại tiền thừa
        transfer::public_transfer(change, tx_context::sender(ctx));

        // 5. Đốt Coin (payment_mut chỉ còn 10 MIZU)
        coin::destroy_zero(payment_mut); 

        // 6. Gửi vé cho người mua
        transfer::public_transfer(ticket, tx_context::sender(ctx));
    }

    /// Hàm Tiêu thụ Vé (Dùng sau khi sự kiện kết thúc)
    public fun consume_ticket(ticket: EventTicket) {
        // Logic sẽ là thay đổi is_used = true, sau đó event::emit
        // Nhưng để đơn giản, chúng ta chỉ cần đốt NFT
        let EventTicket { id, name: _, event_image_url: _, is_used: _, } = ticket;
        object::delete(id);
    }
}