# Hát và Nờ

Interactive scrollytelling website kể lại hành trình hai người gặp nhau, mất kết nối, va lại vào nhau và chọn đồng hành ở thời điểm khó nhất.

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

Toàn bộ nội dung chính nằm ở `src/features/story/data/story.ts`.

Mỗi chapter có `id`, `year`, `title`, `shortTitle`, `paragraphs`, `quote`, `mood`, `accent`, `image`, `imageAlt`, `alignment`, `optionalSound` và `threadState`. Thay chữ trong file này là UI tự cập nhật.

## Thay Ảnh

Ảnh thật đang nằm ở `public/images/story/lover`. Bộ ảnh đã được đặt tên theo mood/khoảnh khắc như `mirror-cardigan.jpg`, `polka-peace.jpg`, `bear-close.png`, `flower-peace.jpg`, `plush-moments.jpg` để dễ gắn vào từng chapter.

Muốn đổi ảnh cho từng chapter thì cập nhật `image` và `imageAlt` trong `src/features/story/data/story.ts`.

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

Scrollama chỉ quản lý state chapter active qua `useActiveStoryStep`. Khi active chapter đổi, `StickyVisual` đổi mood, visual và ảnh. GSAP/ScrollTrigger nằm trong `useScrollAnimation`, dùng cho reveal animation của các khối nội dung và được `@gsap/react` cleanup tự động.

Lenis chỉ làm smooth scroll; khi `prefers-reduced-motion: reduce`, Lenis không khởi tạo, Scrollama bị bỏ qua và nội dung đọc như một trang tuyến tính.

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
