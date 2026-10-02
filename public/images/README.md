# Story Images

Ảnh thật đang nằm trong `public/images/story/lover`. Tên file được đặt theo mood/khoảnh khắc để dễ chọn trong `src/features/story/data/story.ts`, ví dụ `polka-peace.jpg`, `pink-sweater.jpg`, `cap-phone.png`, `bear-close.png`, `flower-peace.jpg`.

Kích thước đề xuất: tối thiểu 1200px cạnh dài. Ảnh nên được nén vừa phải để scroll mượt trên mobile.

Nếu muốn giữ cảm giác scrapbook, hãy dùng ảnh có ánh sáng tự nhiên, crop không quá sát mặt, và chừa một chút khoảng trống để caption polaroid dễ thở.

Mỗi ảnh được dùng có thêm hai bản `.avif` và `.webp` cùng tên (tạo bằng `node scripts/optimize-images.mjs`); `StoryPicture` phục vụ AVIF trước, WebP sau, ảnh gốc cuối cùng.
