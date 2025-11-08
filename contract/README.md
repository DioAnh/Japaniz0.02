Minting NFT contract information:

Transaction Digest: G8pLiY5V14d45hdNwPYG1sbNH5bcT3AwmAYca2G5SNTh
Owner: 0xa9008f618a6885e6d5ab99eb1173ddbca23c4368b146ccf3d5f32be1e8181b46
PackageID: 0x7390eda149bea5fb0256f78abd331e9ecefd9dea3ecfbaf38487757a6d49eb0f
Mizu Treasury Cap ID: 0x1d6e35eb94f74318f78572b8c6b80e53ed5a80c28ee5947b84478f049399fadc
Version: 1 





Cách Admin Mint vé sự kiện
Sau khi bạn publish lại package với code mới này, bạn (Admin) có thể gọi hàm minting bằng cách truyền các thông tin sự kiện vào:

Mint vé A (Sự kiện Nhật Bản):

Bash

sui client call --module ticketnft --function mint_event_ticket \
--package <PACKAGE_ID_MỚI> \
--args '[10, 20, 30]' '[40, 50, 60]' \ # <-- Truyền mảng byte
--gas-budget 100000000

Lưu ý: Vì các tham số là vector<u8> (byte array), bạn sẽ cần gửi chúng dưới dạng mảng byte.

Cách gọi dễ hơn (dùng Rust-style strings):

Bash

sui client call --module ticketnft --function mint_event_ticket \
--package <PACKAGE_ID_MỚI> \
--args 'utf8(Sự kiện Nhật Bản Mùa Hè)' 'utf8(https://link.ảnh.sựkiện.png)' \
--gas-budget 100000000

Mỗi NFT được mint từ bây giờ sẽ có tên và hình ảnh riêng biệt theo thông tin bạn cung cấp.