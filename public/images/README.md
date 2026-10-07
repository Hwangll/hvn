# Story Images

Ảnh thật đang nằm trong `public/images/story/lover`. Tên file được đặt theo mood/khoảnh khắc để dễ chọn trong `src/features/story/data/story.ts`, ví dụ `polka-peace.jpg`, `pink-sweater.jpg`, `cap-phone.png`, `bear-close.png`, `flower-peace.jpg`.

Ảnh của Phần III nằm trong `public/images/story/part-three`, đặt tên theo chỗ và khoảnh khắc (`homestay-red-room.jpg`, `inlove-counter.jpg`, `hoang-mai-cakes.jpg`, `red-car-reflection.jpg`, `museum-flag.jpg`, `one-pillar-pagoda.jpg`, `lotus-pond.jpg`, `holding-hands.jpg`, `bun-rieu.jpg`, rồi tới chương 5: `karaoke-hand.jpg`, `karaoke-song.jpg`, `karaoke-feet.jpg` (chỉ có trong album, Ngọc dặn không đưa ảnh cái chân lên cảnh), `van-quan-night.jpg`, `permission-chat.jpg` (tin nhắn xin phép bố Tiến, cảnh đặt nó trong một chiếc điện thoại), `tiny-letter.jpg`, `tiny-lego.jpg`, `jollibee.jpg`, `cuc-cu-stage.jpg`, `notebook-night.jpg`…). Chương 6 có một ảnh, `saku-dinner.jpg` (cơm Nhật ở Phùng Khoang); các cảnh còn lại của nó vẽ trọn khung. Cạnh dài tối đa 1600px, đã xóa metadata (không còn vị trí chụp).

Kích thước đề xuất: tối thiểu 1200px cạnh dài. Ảnh nên được nén vừa phải để scroll mượt trên mobile.

Nếu muốn giữ cảm giác scrapbook, hãy dùng ảnh có ánh sáng tự nhiên, crop không quá sát mặt, và chừa một chút khoảng trống để caption polaroid dễ thở.

Mỗi ảnh được dùng có thêm hai bản `.avif` và `.webp` cùng tên (tạo bằng `node scripts/optimize-images.mjs`); `StoryPicture` phục vụ AVIF trước, WebP sau, ảnh gốc cuối cùng.
