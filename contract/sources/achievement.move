// sources/achievement.move

/// This module creates "Achievement" objects for the Japaniz app
module contract::achievement {
    use std::string::{Self, String};
    use sui::package; 
    use sui::display; 

    /// This is your "Achievement" NFT.
    public struct JapanizAchievement has key, store {
        id: UID,
        topic_name: String,
        score: u64,
        image_url: String
    }

    /// One-time-witness, dùng 1 lần khi publish
    public struct ACHIEVEMENT has drop {}

    /// Hàm 'init' chạy 1 lần khi publish
    #[allow(lint(share_owned))]
    fun init(otw: ACHIEVEMENT, ctx: &mut TxContext) {
        // 1. Tạo một 'Publisher' (để chứng minh bạn là chủ contract)
        let publisher = package::claim(otw, ctx); 

        // 2. Tạo 'Display Object' cho kiểu JapanizAchievement
        let mut display = display::new<JapanizAchievement>(&publisher, ctx);

        // 3. Dùng 'display::add' và string::utf8()
        display::add(&mut display, string::utf8(b"name"), string::utf8(b"Japaniz Achievement: {topic_name}")); 
        display::add(&mut display, string::utf8(b"description"), string::utf8(b"Chứng nhận hoàn thành Japaniz Quiz!"));
        
        // Cung cấp nhiều key cho hình ảnh
        display::add(&mut display, string::utf8(b"image_url"), string::utf8(b"{image_url}")); 
        display::add(&mut display, string::utf8(b"url"), string::utf8(b"{image_url}")); 
        display::add(&mut display, string::utf8(b"thumbnail_url"), string::utf8(b"{image_url}"));
        
        display::add(&mut display, string::utf8(b"score"), string::utf8(b"{score}"));
        
        // 4. Áp dụng các thay đổi
        display.update_version();

        // 5. Publish
        transfer::public_transfer(publisher, tx_context::sender(ctx));
        transfer::public_share_object(display);
    }


    /// Hàm mint NFT
    public fun mint_achievement(
        topic_name: vector<u8>,
        score: u64, 
        image_url: vector<u8>, 
        recipient: address,
        ctx: &mut TxContext
    ) {
        let achievement = JapanizAchievement {
            id: object::new(ctx), 
            topic_name: string::utf8(topic_name),
            score: score,
            image_url: string::utf8(image_url)
        };
        transfer::public_transfer(achievement, recipient); 
    }
}