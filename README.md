# Hát Và Nờ

Interactive scrollytelling website kể lại hành trình hai người gặp nhau qua màn hình, mất kết nối, va lại vào nhau, rồi bắt đầu có những kỷ niệm cùng nhau ngoài đời.

Website được build thành hai trang riêng:

- `/`: Phần I — Trước khi gặp nhau, gồm intro/phòng ký ức và 5 chương đầu.
- `/part-2/`: Phần II — Thật sự đứng cạnh nhau, gồm lần gặp trực tiếp, những buổi hẹn và ngày thủy cung → café → hoàng hôn.

## Tech Stack

- React + TypeScript + Vite: app tĩnh, build nhanh.
- Tailwind CSS v4: pipeline CSS qua `@tailwindcss/vite`.
- Scrollama: phát hiện chapter đang active khi cuộn.
- GSAP + ScrollTrigger + `@gsap/react`: reveal animation có cleanup khi unmount.
- Three.js: scene 3D tương tác cho các kỷ vật nhỏ trong câu chuyện.
- Lenis: smooth scrolling, tự tắt khi người dùng bật reduced motion.
- Framer Motion: intro title xuất hiện từng chữ.
- Lucide React: icon nhẹ, nhất quán.
- Vitest + React Testing Library: test render, replay, reduced motion, fallback ảnh, sound toggle.

## Chạy Project

```bash
npm install
npm run dev
```

Build và kiểm tra:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Sửa Nội Dung

Toàn bộ nội dung chính nằm ở `src/features/story/data/story.ts`. `storyParts` chia câu chuyện thành hai phần; `partTwoChapters` là nơi thêm dữ liệu cho lần gặp trực tiếp, các buổi hẹn và ngày đi thủy cung — café — ngắm hoàng hôn.

Mỗi chapter có `id`, `year`, `title`, `shortTitle`, `paragraphs`, `quote`, `mood`, `accent`, `image`, `imageAlt`, `alignment`, `optionalSound` và `threadState`. Chương có nhiều cảnh dùng thêm `scenes`; mỗi cảnh cũng có `id` ổn định để theo dõi active/visited và mở đúng kỷ vật.

Để bổ sung dữ liệu thật cho Phần II:

- Điền ngày/năm vào `year` khi đã xác nhận.
- Thêm đường dẫn ảnh vào `image`; thêm ảnh album bằng các phần tử `{ src, alt, caption }` trong `gallery`.
- Xóa `imageNote` hoặc `placeholderNote` tương ứng khi đã có ảnh thật.
- Thêm `secretNote` nếu có nội dung bí mật thật; không cần tạo placeholder cho lời thoại chưa có.

## Thay Ảnh

Ảnh thật đang nằm ở `public/images/story/lover`. Bộ ảnh đã được đặt tên theo mood/khoảnh khắc như `mirror-cardigan.jpg`, `polka-peace.jpg`, `bear-close.png`, `flower-peace.jpg`, `plush-moments.jpg` để dễ gắn vào từng chapter.

Muốn đổi ảnh cho từng chapter/cảnh thì cập nhật `image`, `imageAlt` và `gallery` trong `src/features/story/data/story.ts`.

Nếu ảnh thiếu hoặc lỗi, component `PolaroidPhoto` sẽ hiện placeholder thay thế. Xem thêm `public/images/README.md`.

## Thêm Âm Thanh

Nút âm thanh mặc định tắt và không autoplay. Nhạc nền hiện tại nằm ở `public/audio/tinh-minh-la-ky.mp4` và được phát loop sau khi người xem bấm bật âm thanh.

Sound effect theo chapter dùng `optionalSound` trong `src/features/story/data/story.ts`. Các tương tác chung dùng cue map trong `src/shared/hooks/useSoundToggle.ts`.

Các SFX hiện có trong `public/audio`:

- `ambient-warm.wav`
- `gallery-close.wav`
- `gallery-open.wav`
- `keepsake-bouquet.wav`
- `keepsake-candle.wav`
- `keepsake-envelope.wav`
- `keepsake-heart.wav`
- `keepsake-polaroid.wav`
- `keepsake-star.wav`
- `memory-open.wav`
- `memory-return.wav`
- `replay-sweep.wav`
- `secret-close.wav`
- `secret-open.wav`
- `soft-notification.wav`
- `sound-off.wav`
- `sound-on.wav`
- `typing.wav`

## Cách Scrollama Và GSAP Phối Hợp

Scrollama chỉ quản lý state item active qua stable ID trong `useActiveStoryStep`. Khi active chapter/cảnh đổi, `StickyMemoryStage` đổi mood, visual và ảnh; một `Set` visited độc lập giữ lịch sử mở kỷ vật nên jump navigation không tự đánh dấu các đoạn bị bỏ qua. GSAP/ScrollTrigger nằm trong `useScrollAnimation`, dùng cho reveal animation của các khối nội dung và được `@gsap/react` cleanup tự động.

Phần II dùng một scroll driver duy nhất trong `usePartTwoScroll`: nền trời (`PartTwoAtmosphere`), năm lớp cảnh và chữ đều đọc cùng một tiến độ cuộn qua GSAP quickSetter, nên cuộn ngược hay nhảy chương đều dựng lại đúng hình. Trên desktop các cảnh là `[data-offline-panel]` xếp chồng trong sticky stage; trên mobile và reduced motion cùng engine đó chạy trên từng `.mobile-scene-canvas` theo vị trí canvas trong viewport (biên độ nhỏ hơn). Chuyển cảnh là dissolve bất đối xứng: cảnh cũ rời hết ở nửa đầu blend, cảnh mới vào theo đường S nên không có lúc nào hai cảnh cùng 50%; panel đã rời được gắn `.is-hidden` để tạm dừng vòng lặp idle. Prop trong `TogetherScene` khai báo chuyển động bằng `data-*` (`parallax`, `drift`, `wave`, `rise`, `float`, `sink`, `spin`, `sway`, `zoom`, `tilt`, `glow`, `delay`, `fade`, `sheen`); `data-fade` dương/âm cho prop hiện ra hoặc biến mất tại một điểm của cảnh (màn sương chiều, ảnh thứ hai của buổi đi lượn). Các vòng lặp thời gian (sao nhấp nháy, sứa co bóp, hơi café, cỏ biển đung đưa) nằm trong CSS. Trên desktop, `usePointerParallax` ghi `--mx/--my` lên sticky stage để các lớp nghiêng theo chuột; mobile và reduced motion tắt hiệu ứng này.

Lenis chỉ làm smooth scroll; khi `prefers-reduced-motion: reduce`, Lenis và reveal animation không chạy, còn nội dung vẫn đọc tuyến tính và state active vẫn theo đúng vị trí cuộn.

## Cấu Trúc Chính

```text
src/
  app/                    # Điểm vào và điều phối trạng thái trải nghiệm
  features/
    intro/                # Mở đầu và transition vào câu chuyện
    story/                # Nội dung, scenes, scroll và gallery của hành trình
    memories/             # Hộp kỷ vật và WebGL tương tác
  shared/                 # Hook, component và utility dùng chung
  styles/                 # Global styles và style của scrollytelling
  test/
public/images/
```

## Deploy

Vercel:

```bash
npm run build
```

Import repo vào Vercel, framework preset là Vite, output directory là `dist`.

Vite đang dùng multi-page input trong `vite.config.ts`, vì vậy build tạo cả `dist/index.html` và `dist/part-2/index.html`.

Netlify:

```bash
npm run build
```

Build command: `npm run build`, publish directory: `dist`.

## Quyết Định Kỹ Thuật

- Nội dung tách khỏi component để dễ đổi câu chuyện.
- Không dùng remote image để tránh link chết.
- Animation ưu tiên `transform` và `opacity`.
- Có reduced-motion fallback để tránh gây khó chịu.
- Sound architecture có sẵn nhưng không tự phát âm thanh.
