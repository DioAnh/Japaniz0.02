// frontend/constants.ts

import type { VocabularyItem, Topic } from './types';

// =========================================
// DANH SÁCH TỪ VỰNG CHI TIẾT
// =========================================

// 1. Chào hỏi & Giao tiếp cơ bản (15)
const greetings: VocabularyItem[] = [
  { japanese: 'こんにちは', hiragana: 'こんにちは', romaji: 'Konnichiwa', vietnamese: 'Xin chào (ban ngày)' },
  { japanese: 'おはよう', hiragana: 'おはようございます', romaji: 'Ohayou Gozaimasu', vietnamese: 'Chào buổi sáng (lịch sự)' },
  { japanese: 'こんばんは', hiragana: 'こんばんは', romaji: 'Konbanwa', vietnamese: 'Chào buổi tối' },
  { japanese: 'ありがとう', hiragana: 'ありがとう', romaji: 'Arigatou', vietnamese: 'Cảm ơn' },
  { japanese: 'すみません', hiragana: 'すみません', romaji: 'Sumimasen', vietnamese: 'Xin lỗi / Cho hỏi' },
  { japanese: 'ごめんなさい', hiragana: 'ごめんなさい', romaji: 'Gomennasai', vietnamese: 'Tôi xin lỗi (thân mật)' },
  { japanese: 'はい', hiragana: 'はい', romaji: 'Hai', vietnamese: 'Vâng / Đúng' },
  { japanese: 'いいえ', hiragana: 'いいえ', romaji: 'Iie', vietnamese: 'Không' },
  { japanese: 'さようなら', hiragana: 'さようなら', romaji: 'Sayounara', vietnamese: 'Tạm biệt' },
  { japanese: 'じゃあね', hiragana: 'じゃあね', romaji: 'Jaa ne', vietnamese: 'Tạm biệt (thân mật)' },
  { japanese: 'お願いします', hiragana: 'おねがいします', romaji: 'Onegaishimasu', vietnamese: 'Làm ơn / Xin vui lòng' },
  { japanese: '大丈夫', hiragana: 'だいじょうぶ', romaji: 'Daijoubu', vietnamese: 'Không sao / Ổn' },
  { japanese: 'どうぞ', hiragana: 'どうぞ', romaji: 'Douzo', vietnamese: 'Xin mời' },
  { japanese: 'はじめまして', hiragana: 'はじめまして', romaji: 'Hajimemashite', vietnamese: 'Rất vui được gặp bạn (lần đầu)' },
  { japanese: 'おやすみ', hiragana: 'おやすみなさい', romaji: 'Oyasuminasai', vietnamese: 'Chúc ngủ ngon' },
];

// 2. Con người & Gia đình (20)
const people: VocabularyItem[] = [
  { japanese: '私', hiragana: 'わたし', romaji: 'Watashi', vietnamese: 'Tôi' },
  { japanese: 'あなた', hiragana: 'あなた', romaji: 'Anata', vietnamese: 'Bạn' },
  { japanese: '学生', hiragana: 'がくせい', romaji: 'Gakusei', vietnamese: 'Học sinh' },
  { japanese: '先生', hiragana: 'せんせい', romaji: 'Sensei', vietnamese: 'Giáo viên' },
  { "japanese": "友達", "hiragana": "ともだち", "romaji": "Tomodachi", "vietnamese": "Bạn bè" },
  { "japanese": "人", "hiragana": "ひと", "romaji": "Hito", "vietnamese": "Người" },
  { "japanese": "男", "hiragana": "おとこ", "romaji": "Otoko", "vietnamese": "Đàn ông" },
  { "japanese": "女", "hiragana": "おんな", "romaji": "Onna", "vietnamese": "Phụ nữ" },
  { "japanese": "子", "hiragana": "こ", "romaji": "Ko", "vietnamese": "Đứa trẻ" },
  { "japanese": "家族", "hiragana": "かぞく", "romaji": "Kazoku", "vietnamese": "Gia đình" },
  { "japanese": "父", "hiragana": "ちち", "romaji": "Chichi", "vietnamese": "Bố (của mình)" },
  { "japanese": "母", "hiragana": "はは", "romaji": "Haha", "vietnamese": "Mẹ (của mình)" },
  { "japanese": "お父さん", "hiragana": "おとうさん", "romaji": "Otousan", "vietnamese": "Bố (của người khác)" },
  { "japanese": "お母さん", "hiragana": "おかあさん", "romaji": "Okaasan", "vietnamese": "Mẹ (của người khác)" },
  { "japanese": "兄", "hiragana": "あに", "romaji": "Ani", "vietnamese": "Anh trai (của mình)" },
  { "japanese": "姉", "hiragana": "あね", "romaji": "Ane", "vietnamese": "Chị gái (của mình)" },
  { "japanese": "弟", "hiragana": "おとうと", "romaji": "Otouto", "vietnamese": "Em trai (của mình)" },
  { "japanese": "妹", "hiragana": "いもうと", "romaji": "Imouto", "vietnamese": "Em gái (của mình)" },
  { "japanese": "兄弟", "hiragana": "きょうだい", "romaji": "Kyoudai", "vietnamese": "Anh chị em" },
  { "japanese": "医者", "hiragana": "いしゃ", "romaji": "Isha", "vietnamese": "Bác sĩ" },
];

// 3. Thời gian & Lịch (20)
const timeAndDate: VocabularyItem[] = [
  { "japanese": "今日", "hiragana": "きょう", "romaji": "Kyou", "vietnamese": "Hôm nay" },
  { "japanese": "明日", "hiragana": "あした", "romaji": "Ashita", "vietnamese": "Ngày mai" },
  { "japanese": "昨日", "hiragana": "きのう", "romaji": "Kinou", "vietnamese": "Hôm qua" },
  { "japanese": "一昨日", "hiragana": "おととい", "romaji": "Ototoi", "vietnamese": "Hôm kia" },
  { "japanese": "明後日", "hiragana": "あさって", "romaji": "Asatte", "vietnamese": "Ngày kia" },
  { "japanese": "時間", "hiragana": "じかん", "romaji": "Jikan", "vietnamese": "Thời gian" },
  { "japanese": "今", "hiragana": "いま", "romaji": "Ima", "vietnamese": "Bây giờ" },
  { "japanese": "朝", "hiragana": "あさ", "romaji": "Asa", "vietnamese": "Buổi sáng" },
  { "japanese": "昼", "hiragana": "ひる", "romaji": "Hiru", "vietnamese": "Buổi trưa" },
  { "japanese": "夜", "hiragana": "よる", "romaji": "Yoru", "vietnamese": "Buổi tối (đêm)" },
  { "japanese": "時", "hiragana": "じ", "romaji": "Ji", "vietnamese": "Giờ" },
  { "japanese": "分", "hiragana": "ふん / ぷん", "romaji": "Fun / Pun", "vietnamese": "Phút" },
  { "japanese": "毎日", "hiragana": "まいにち", "romaji": "Mainichi", "vietnamese": "Hàng ngày" },
  { "japanese": "毎週", "hiragana": "まいしゅう", "romaji": "Maishuu", "vietnamese": "Hàng tuần" },
  { "japanese": "毎月", "hiragana": "まいつき", "romaji": "Maitsuki", "vietnamese": "Hàng tháng" },
  { "japanese": "毎年", "hiragana": "まいとし", "romaji": "Mainen / Maitoshi", "vietnamese": "Hàng năm" },
  { "japanese": "週", "hiragana": "しゅう", "romaji": "Shuu", "vietnamese": "Tuần" },
  { "japanese": "月曜日", "hiragana": "げつようび", "romaji": "Getsuyoubi", "vietnamese": "Thứ Hai" },
  { "japanese": "火曜日", "hiragana": "かようび", "romaji": "Kayoubi", "vietnamese": "Thứ Ba" },
  { "japanese": "水曜日", "hiragana": "すいようび", "romaji": "Suiyoubi", "vietnamese": "Thứ Tư" },
  // 5 từ nữa để đủ 200, thêm vào cuối
];

// 4. Địa điểm & Công việc (20)
const placesAndWork: VocabularyItem[] = [
  { japanese: '日本', hiragana: 'にほん', romaji: 'Nihon', vietnamese: 'Nhật Bản' },
  { "japanese": "学校", "hiragana": "がっこう", "romaji": "Gakkou", "vietnamese": "Trường học" },
  { "japanese": "駅", "hiragana": "えき", "romaji": "Eki", "vietnamese": "Nhà ga" },
  { "japanese": "家", "hiragana": "いえ", "romaji": "Ie", "vietnamese": "Nhà (vật lý)" },
  { "japanese": "うち", "hiragana": "うち", "romaji": "Uchi", "vietnamese": "Nhà (tổ ấm)" },
  { "japanese": "会社", "hiragana": "かいしゃ", "romaji": "Kaisha", "vietnamese": "Công ty" },
  { "japanese": "仕事", "hiragana": "しごと", "romaji": "Shigoto", "vietnamese": "Công việc" },
  { "japanese": "店", "hiragana": "みせ", "romaji": "Mise", "vietnamese": "Cửa hàng" },
  { "japanese": "国", "hiragana": "くに", "romaji": "Kuni", "vietnamese": "Đất nước" },
  { "japanese": "大学", "hiragana": "だいがく", "romaji": "Daigaku", "vietnamese": "Trường đại học" },
  { "japanese": "病院", "hiragana": "びょういん", "romaji": "Byouin", "vietnamese": "Bệnh viện" },
  { "japanese": "銀行", "hiragana": "ぎんこう", "romaji": "Ginkou", "vietnamese": "Ngân hàng" },
  { "japanese": "郵便局", "hiragana": "ゆうびんきょく", "romaji": "Yuubinkyoku", "vietnamese": "Bưu điện" },
  { "japanese": "図書館", "hiragana": "としょかん", "romaji": "Toshokan", "vietnamese": "Thư viện" },
  { "japanese": "レストラン", "hiragana": "レストラン", "romaji": "Resutoran", "vietnamese": "Nhà hàng" },
  { "japanese": "ホテル", "hiragana": "ホテル", "romaji": "Hoteru", "vietnamese": "Khách sạn" },
  { "japanese": "コンビニ", "hiragana": "コンビニ", "romaji": "Konbini", "vietnamese": "Cửa hàng tiện lợi" },
  { "japanese": "公園", "hiragana": "こうえん", "romaji": "Kouen", "vietnamese": "Công viên" },
  { "japanese": "スーパー", "hiragana": "スーパー", "romaji": "Suupaa", "vietnamese": "Siêu thị" },
  { "japanese": "アパート", "hiragana": "アパート", "romaji": "Apaato", "vietnamese": "Căn hộ" },
];

// 5. Đồ ăn & Đồ uống (20)
const foodAndDrink: VocabularyItem[] = [
  { "japanese": "食べ物", "hiragana": "たべもの", "romaji": "Tabemono", "vietnamese": "Đồ ăn" },
  { "japanese": "飲み物", "hiragana": "のみもの", "romaji": "Nomimono", "vietnamese": "Đồ uống" },
  { "japanese": "水", "hiragana": "みず", "romaji": "Mizu", "vietnamese": "Nước" },
  { "japanese": "魚", "hiragana": "さかな", "romaji": "Sakana", "vietnamese": "Con cá" },
  { "japanese": "肉", "hiragana": "にく", "romaji": "Niku", "vietnamese": "Thịt" },
  { "japanese": "野菜", "hiragana": "やさい", "romaji": "Yasai", "vietnamese": "Rau" },
  { "japanese": "果物", "hiragana": "くだもの", "romaji": "Kudamono", "vietnamese": "Trái cây" },
  { "japanese": "ご飯", "hiragana": "ごはん", "romaji": "Gohan", "vietnamese": "Cơm / Bữa ăn" },
  { "japanese": "パン", "hiragana": "パン", "romaji": "Pan", "vietnamese": "Bánh mì" },
  { "japanese": "卵", "hiragana": "たまご", "romaji": "Tamago", "vietnamese": "Trứng" },
  { "japanese": "牛乳", "hiragana": "ぎゅうにゅう", "romaji": "Gyuunyuu", "vietnamese": "Sữa bò" },
  { "japanese": "お茶", "hiragana": "おちゃ", "romaji": "Ocha", "vietnamese": "Trà" },
  { "japanese": "コーヒー", "hiragana": "コーヒー", "romaji": "Koohii", "vietnamese": "Cà phê" },
  { "japanese": "ビール", "hiragana": "ビール", "romaji": "Biiru", "vietnamese": "Bia" },
  { "japanese": "お酒", "hiragana": "おさけ", "romaji": "Osake", "vietnamese": "Rượu (chung)" },
  { "japanese": "りんご", "hiragana": "りんご", "romaji": "Ringo", "vietnamese": "Quả táo" },
  { "japanese": "みかん", "hiragana": "みかん", "romaji": "Mikan", "vietnamese": "Quả quýt" },
  { "japanese": "バナナ", "hiragana": "バナナ", "romaji": "Banana", "vietnamese": "Quả chuối" },
  { "japanese": "寿司", "hiragana": "すし", "romaji": "Sushi", "vietnamese": "Sushi" },
  { "japanese": "天ぷら", "hiragana": "てんぷら", "romaji": "Tempura", "vietnamese": "Tempura" },
];

// 6. Đồ vật & Di chuyển (25)
const objectsAndTransport: VocabularyItem[] = [
  { "japanese": "電話", "hiragana": "でんわ", "romaji": "Denwa", "vietnamese": "Điện thoại" },
  { "japanese": "本", "hiragana": "ほん", "romaji": "Hon", "vietnamese": "Sách" },
  { "japanese": "雑誌", "hiragana": "ざっし", "romaji": "Zasshi", "vietnamese": "Tạp chí" },
  { "japanese": "新聞", "hiragana": "しんぶん", "romaji": "Shinbun", "vietnamese": "Báo" },
  { "japanese": "辞書", "hiragana": "じしょ", "romaji": "Jisho", "vietnamese": "Từ điển" },
  { "japanese": "薬", "hiragana": "くすり", "romaji": "Kusuri", "vietnamese": "Thuốc" },
  { "japanese": "お金", "hiragana": "おかね", "romaji": "Okane", "vietnamese": "Tiền" },
  { "japanese": "椅子", "hiragana": "いす", "romaji": "Isu", "vietnamese": "Cái ghế" },
  { "japanese": "机", "hiragana": "つくえ", "romaji": "Tsukue", "vietnamese": "Cái bàn" },
  { "japanese": "鞄", "hiragana": "かばん", "romaji": "Kaban", "vietnamese": "Cái cặp" },
  { "japanese": "靴", "hiragana": "くつ", "romaji": "Kutsu", "vietnamese": "Giày" },
  { "japanese": "ペン", "hiragana": "ペン", "romaji": "Pen", "vietnamese": "Cái bút" },
  { "japanese": "鉛筆", "hiragana": "えんぴつ", "romaji": "Enpitsu", "vietnamese": "Bút chì" },
  { "japanese": "時計", "hiragana": "とけい", "romaji": "Tokei", "vietnamese": "Đồng hồ" },
  { "japanese": "傘", "hiragana": "かさ", "romaji": "Kasa", "vietnamese": "Cái ô" },
  { "japanese": "鍵", "hiragana": "かぎ", "romaji": "Kagi", "vietnamese": "Chìa khóa" },
  { "japanese": "テレビ", "hiragana": "テレビ", "romaji": "Terebi", "vietnamese": "Ti vi" },
  { "japanese": "ラジオ", "hiragana": "ラジオ", "romaji": "Rajio", "vietnamese": "Đài radio" },
  { "japanese": "カメラ", "hiragana": "カメラ", "romaji": "Kamera", "vietnamese": "Máy ảnh" },
  { "japanese": "電車", "hiragana": "でんしゃ", "romaji": "Densha", "vietnamese": "Tàu điện" },
  { "japanese": "車", "hiragana": "くるま", "romaji": "Kuruma", "vietnamese": "Xe ô tô" },
  { "japanese": "バス", "hiragana": "バス", "romaji": "Basu", "vietnamese": "Xe buýt" },
  { "japanese": "タクシー", "hiragana": "タクシー", "romaji": "Takushii", "vietnamese": "Xe taxi" },
  { "japanese": "飛行機", "hiragana": "ひこうき", "romaji": "Hikouki", "vietnamese": "Máy bay" },
  { "japanese": "自転車", "hiragana": "じてんしゃ", "romaji": "Jitensha", "vietnamese": "Xe đạp" },
];

// 7. Thiên nhiên & Động vật (15)
const natureAndAnimals: VocabularyItem[] = [
  { japanese: '犬', hiragana: 'いぬ', romaji: 'Inu', "vietnamese": "Con chó" },
  { japanese: '猫', hiragana: 'ねこ', romaji: 'Neko', "vietnamese": "Con mèo" },
  { "japanese": "天気", "hiragana": "てんき", "romaji": "Tenki", "vietnamese": "Thời tiết" },
  { "japanese": "雨", "hiragana": "あめ", "romaji": "Ame", "vietnamese": "Mưa" },
  { "japanese": "雪", "hiragana": "ゆき", "romaji": "Yuki", "vietnamese": "Tuyết" },
  { "japanese": "晴れ", "hiragana": "はれ", "romaji": "Hare", "vietnamese": "Trời nắng" },
  { "japanese": "曇り", "hiragana": "くもり", "romaji": "Kumori", "vietnamese": "Trời mây" },
  { "japanese": "火", "hiragana": "ひ", "romaji": "Hi", "vietnamese": "Lửa" },
  { "japanese": "木", "hiragana": "き", "romaji": "Ki", "vietnamese": "Cây" },
  { "japanese": "土", "hiragana": "つち", "romaji": "Tsuchi", "vietnamese": "Đất" },
  { "japanese": "山", "hiragana": "やま", "romaji": "Yama", "vietnamese": "Núi" },
  { "japanese": "川", "hiragana": "かわ", "romaji": "Kawa", "vietnamese": "Sông" },
  { "japanese": "海", "hiragana": "うみ", "romaji": "Umi", "vietnamese": "Biển" },
  { "japanese": "空", "hiragana": "そら", "romaji": "Sora", "vietnamese": "Bầu trời" },
  { "japanese": "花", "hiragana": "はな", "romaji": "Hana", "vietnamese": "Hoa" },
];

// 8. Ngôn ngữ & Học tập (15)
const study: VocabularyItem[] = [
  { "japanese": "英語", "hiragana": "えいご", "romaji": "Eigo", "vietnamese": "Tiếng Anh" },
  { "japanese": "日本語", "hiragana": "にほんご", "romaji": "Nihongo", "vietnamese": "Tiếng Nhật" },
  { "japanese": "勉強", "hiragana": "べんきょう", "romaji": "Benkyou", "vietnamese": "Việc học" },
  { "japanese": "宿題", "hiragana": "しゅくだい", "romaji": "Shukudai", "vietnamese": "Bài tập về nhà" },
  { "japanese": "試験", "hiragana": "しけん", "romaji": "Shiken", "vietnamese": "Kỳ thi" },
  { "japanese": "質問", "hiragana": "しつもん", "romaji": "Shitsumon", "vietnamese": "Câu hỏi" },
  { "japanese": "答え", "hiragana": "こたえ", "romaji": "Kotae", "vietnamese": "Câu trả lời" },
  { "japanese": "教室", "hiragana": "きょうしつ", "romaji": "Kyoushitsu", "vietnamese": "Lớp học" },
  { "japanese": "紙", "hiragana": "かみ", "romaji": "Kami", "vietnamese": "Giấy" },
  { "japanese": "手紙", "hiragana": "てがみ", "romaji": "Tegami", "vietnamese": "Bức thư" },
  { "japanese": "ノート", "hiragana": "ノート", "romaji": "Nooto", "vietnamese": "Vở" },
  { "japanese": "読みます", "hiragana": "よみます", "romaji": "Yomimasu", "vietnamese": "Đọc" },
  { "japanese": "書きます", "hiragana": "かきます", "romaji": "Kakimasu", "vietnamese": "Viết" },
  { "japanese": "聞きます", "hiragana": "ききます", "romaji": "Kikimasu", "vietnamese": "Nghe" },
  { "japanese": "話します", "hiragana": "はなします", "romaji": "Hanashimasu", "vietnamese": "Nói" },
];

// 9. Tính từ (20)
const adjectives: VocabularyItem[] = [
  { "japanese": "好き", "hiragana": "すき", "romaji": "Suki", "vietnamese": "Thích" },
  { "japanese": "嫌い", "hiragana": "きらい", "romaji": "Kirai", "vietnamese": "Ghét" },
  { "japanese": "美味しい", "hiragana": "おいしい", "romaji": "Oishii", "vietnamese": "Ngon" },
  { "japanese": "不味い", "hiragana": "まずい", "romaji": "Mazui", "vietnamese": "Dở" },
  { "japanese": "高い", "hiragana": "たかい", "romaji": "Takai", "vietnamese": "Cao / Đắt" },
  { "japanese": "安い", "hiragana": "やすい", "romaji": "Yasui", "vietnamese": "Rẻ" },
  { "japanese": "低い", "hiragana": "ひくい", "romaji": "Hikui", "vietnamese": "Thấp" },
  { "japanese": "大きい", "hiragana": "おおきい", "romaji": "Ookii", "vietnamese": "To / Lớn" },
  { "japanese": "小さい", "hiragana": "ちいさい", "romaji": "Chiisai", "vietnamese": "Nhỏ / Bé" },
  { "japanese": "新しい", "hiragana": "あたらしい", "romaji": "Atarashii", "vietnamese": "Mới" },
  { "japanese": "古い", "hiragana": "ふるい", "romaji": "Furui", "vietnamese": "Cũ" },
  { "japanese": "良い", "hiragana": "よい / いい", "romaji": "Yoi / Ii", "vietnamese": "Tốt" },
  { "japanese": "悪い", "hiragana": "わるい", "romaji": "Warui", "vietnamese": "Xấu" },
  { "japanese": "暑い", "hiragana": "あつい", "romaji": "Atsui", "vietnamese": "Nóng (thời tiết)" },
  { "japanese": "寒い", "hiragana": "さむい", "romaji": "Samui", "vietnamese": "Lạnh (thời tiết)" },
  { "japanese": "熱い", "hiragana": "あつい", "romaji": "Atsui", "vietnamese": "Nóng (đồ vật)" },
  { "japanese": "冷たい", "hiragana": "つめたい", "romaji": "Tsumetai", "vietnamese": "Lạnh (đồ vật)" },
  { "japanese": "難しい", "hiragana": "むずかしい", "romaji": "Muzukashii", "vietnamese": "Khó" },
  { "japanese": "易しい", "hiragana": "やさしい", "romaji": "Yasashii", "vietnamese": "Dễ" },
  { "japanese": "楽しい", "hiragana": "たのしい", "romaji": "Tanoshii", "vietnamese": "Vui" },
];

// 10. Động từ cơ bản (20)
const verbs: VocabularyItem[] = [
  { "japanese": "行く", "hiragana": "いく", "romaji": "Iku", "vietnamese": "Đi" },
  { "japanese": "来る", "hiragana": "くる", "romaji": "Kuru", "vietnamese": "Đến" },
  { "japanese": "帰る", "hiragana": "かえる", "romaji": "Kaeru", "vietnamese": "Trở về" },
  { "japanese": "食べる", "hiragana": "たべる", "romaji": "Taberu", "vietnamese": "Ăn" },
  { "japanese": "飲む", "hiragana": "のむ", "romaji": "Nomu", "vietnamese": "Uống" },
  { "japanese": "見る", "hiragana": "みる", "romaji": "Miru", "vietnamese": "Nhìn / Xem" },
  { "japanese": "買う", "hiragana": "かう", "romaji": "Kau", "vietnamese": "Mua" },
  { "japanese": "売る", "hiragana": "うる", "romaji": "Uru", "vietnamese": "Bán" },
  { "japanese": "会う", "hiragana": "あう", "romaji": "Au", "vietnamese": "Gặp gỡ" },
  { "japanese": "待つ", "hiragana": "まつ", "romaji": "Matsu", "vietnamese": "Đợi" },
  { "japanese": "持つ", "hiragana": "もつ", "romaji": "Motsu", "vietnamese": "Mang / Cầm" },
  { "japanese": "作る", "hiragana": "つくる", "romaji": "Tsukuru", "vietnamese": "Làm / Chế tạo" },
  { "japanese": "使う", "hiragana": "つかう", "romaji": "Tsukau", "vietnamese": "Sử dụng" },
  { "japanese": "知る", "hiragana": "しる", "romaji": "Shiru", "vietnamese": "Biết" },
  { "japanese": "分かる", "hiragana": "わかる", "romaji": "Wakaru", "vietnamese": "Hiểu" },
  { "japanese": "寝る", "hiragana": "ねる", "romaji": "Neru", "vietnamese": "Ngủ" },
  { "japanese": "起きる", "hiragana": "おきる", "romaji": "Okiru", "vietnamese": "Thức dậy" },
  { "japanese": "働く", "hiragana": "はたらく", "romaji": "Hataraku", "vietnamese": "Làm việc" },
  { "japanese": "休む", "hiragana": "やすむ", "romaji": "Yasumu", "vietnamese": "Nghỉ ngơi" },
  { "japanese": "言う", "hiragana": "いう", "romaji": "Iu", "vietnamese": "Nói" },
];

// 11. Cơ thể & Khác (10)
const etc: VocabularyItem[] = [
  { "japanese": "目", "hiragana": "め", "romaji": "Me", "vietnamese": "Mắt" },
  { "japanese": "耳", "hiragana": "みみ", "romaji": "Mimi", "vietnamese": "Tai" },
  { "japanese": "口", "hiragana": "くち", "romaji": "Kuchi", "vietnamese": "Miệng" },
  { "japanese": "手", "hiragana": "て", "romaji": "Te", "vietnamese": "Tay" },
  { "japanese": "足", "hiragana": "あし", "romaji": "Ashi", "vietnamese": "Chân" },
  { "japanese": "頭", "hiragana": "あたま", "romaji": "Atama", "vietnamese": "Đầu" },
  { "japanese": "顔", "hiragana": "かお", "romaji": "Kao", "vietnamese": "Khuôn mặt" },
  { "japanese": "映画", "hiragana": "えいが", "romaji": "Eiga", "vietnamese": "Phim" },
  { "japanese": "音楽", "hiragana": "おんがく", "romaji": "Ongaku", "vietnamese": "Âm nhạc" },
  { "japanese": "金", "hiragana": "かね", "romaji": "Kane", "vietnamese": "Tiền / Vàng" },
  // 5 từ cuối cùng từ 'timeAndDate'
  { "japanese": "木曜日", "hiragana": "もくようび", "romaji": "Mokuyoubi", "vietnamese": "Thứ Năm" },
  { "japanese": "金曜日", "hiragana": "きんようび", "romaji": "Kinyoubi", "vietnamese": "Thứ Sáu" },
  { "japanese": "土曜日", "hiragana": "どようび", "romaji": "Doyoubi", "vietnamese": "Thứ Bảy" },
  { "japanese": "日曜日", "hiragana": "にちようび", "romaji": "Nichiyoubi", "vietnamese": "Chủ Nhật" },
  { "japanese": "何時", "hiragana": "なんじ", "romaji": "Nanji", "vietnamese": "Mấy giờ" },
];


// =========================================
// TỔNG HỢP TOPIC
// =========================================
export const TOPIC_LIST: Topic[] = [
    { topicName: "Chào hỏi (15)", vocabulary: greetings },
    { topicName: "Con người & Gia đình (20)", vocabulary: people },
    { topicName: "Thời gian & Lịch (20)", vocabulary: timeAndDate },
    { topicName: "Địa điểm & Công việc (20)", vocabulary: placesAndWork },
    { topicName: "Đồ ăn & Đồ uống (20)", vocabulary: foodAndDrink },
    { topicName: "Đồ vật & Di chuyển (25)", vocabulary: objectsAndTransport },
    { topicName: "Thiên nhiên & Động vật (15)", vocabulary: natureAndAnimals },
    { topicName: "Ngôn ngữ & Học tập (15)", vocabulary: study },
    { topicName: "Tính từ (20)", vocabulary: adjectives },
    { topicName: "Động từ cơ bản (20)", vocabulary: verbs },
    { topicName: "Cơ thể & Khác (10 + 5)", vocabulary: etc }, // Tổng = 200
];