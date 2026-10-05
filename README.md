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
- Motion (`motion/react`): chuyển động có lò xo cho chữ, highlight trượt, thẻ kỷ vật, đồng hồ đếm ngược và lightbox (xem phần Chuyển Động).
- Three.js: scene 3D tương tác cho các kỷ vật nhỏ trong câu chuyện.
- Lenis: smooth scrolling, tự tắt khi người dùng bật reduced motion.
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

Mỗi ảnh gốc (`.jpg`/`.png`) có hai bản đi kèm cùng tên: `.avif` (trình duyệt hiện đại tải bản này, nhẹ hơn WebP 25–40%) và `.webp` (dự phòng). `StoryPicture` tự chọn bản phù hợp. Khi thêm hoặc thay ảnh, chạy:

```bash
node scripts/optimize-images.mjs
```

Script chỉ xử lý các ảnh được dùng trong `src/`, cần `sips` (macOS) cùng `cwebp` và `avifenc` (`brew install webp libavif`).

## Thêm Âm Thanh

Nút âm thanh mặc định tắt và không autoplay. Nhạc nền hiện tại nằm ở `public/audio/tinh-minh-la-ky.m4a` (chỉ track âm thanh AAC, tách từ file mp4 gốc) và được phát loop sau khi người xem bấm bật âm thanh.

Sound effect theo chapter dùng `optionalSound` trong `src/features/story/data/story.ts`. Các tương tác chung dùng cue map trong `src/shared/hooks/useSoundToggle.ts`.

Mỗi SFX có hai bản: `.m4a` (AAC, vài kB) được phát trước, `.wav` gốc là bản dự phòng cho trình duyệt không có AAC. Thêm SFX mới thì tạo bản `.m4a` cạnh file `.wav`: `afconvert -f m4af -d aac -s 0 -b 96000 ten.wav ten.m4a`.

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

## Chuyển Động (Motion)

Lớp hiệu ứng tương tác dùng Motion và các mẫu quen thuộc của Aceternity UI, Magic UI, React Bits, viết lại cho hợp tông của truyện thay vì chép nguyên khối:

- `src/shared/motion/`: `MotionProvider` (`LazyMotion` + `MotionConfig reducedMotion="user"`), bộ lò xo dùng chung `springs.ts`, `useRevealOnce`, `whenIdle`.
- `src/shared/components/motion/`: `BlurText` (chữ hiện dần từ mờ sang nét), `RollingNumber` (số lăn như đồng hồ cơ), `CircularText` (chữ chạy vòng quanh con dấu), `Meteors` (sao băng).
- `src/shared/interactions/`: một listener `pointermove` duy nhất cho các phần tử có `data-magnetic` (nút hút nhẹ theo chuột), `data-tilt` (ảnh nghiêng 3D có vệt sáng; dùng `data-tilt="transform"` cho phần tử mà `transform` đang có animation riêng) và `data-spotlight` (thẻ có đèn rọi theo chuột); cộng với tia sáng khi bấm nút. Chỉ bật trên thiết bị có chuột.
- `src/styles/motion-edition.css`: shimmer (`.has-shimmer`), viền sáng chạy quanh thẻ kỷ vật, sao băng, vòng chữ, và một đường cong lò xo cho transition CSS, lấy mẫu bằng `spring()` của Motion.
- Highlight của nút kỷ vật và vạch chương ở sticky stage dùng `layoutId` nên trượt giữa các vị trí.
- Nền nhiều lớp cho cả hai phần. Cơ chế dùng chung nằm trong `src/styles/depth-field.css`: các mặt phẳng dài bằng trang (`.depth-plane`), mỗi mặt trượt theo `scroll(root)` với tốc độ riêng (`--k`); `--at` là vị trí một món khi nó nằm giữa màn hình; những món tự chuyển động là idle zone nên đứng yên khi khuất màn hình. Trình duyệt chưa có scroll timeline (Safari trước 26, Firefox) được `useDepthParallaxFallback` đẩy các lớp bằng script, đọc cùng các con số trong CSS (`[data-scroll-drift]`, `[data-scroll-path]`).
  - Phần I (`PartOneDepth.tsx`, `PartOneAtmosphere.tsx`, `part-one-depth.css`): trời chiều có mặt trời và tia nắng, ba tầng mây trôi bồng bềnh, đàn chim; vệt nắng, đốm sáng, chữ viền khổng lồ; mây, hình vẽ nét, hoa; bướm và cành anh đào; đồ scrapbook ló từ mép trang; hoa và bướm lớn mờ ở tiền cảnh. Một đám mây và một con bướm bay len giữa ba tấm ảnh hero, một đám mây len giữa các ảnh scrapbook (z-index nằm giữa các ảnh). Hero, scrapbook và hoa ở hộp kỷ vật cũng tách lớp khi cuộn qua.
  - Phần II (`PartTwoDepth.tsx`, `PartTwoAtmosphere.tsx`, `part-two-depth.css`): trăng tròn (lên dần khỏi khung hình khi rời trang tiêu đề, nhường chỗ cho bầu trời của từng chương) và mây đêm trên bầu trời đầu tiên; bokeh đèn thành phố, sao, chữ viền; mây đêm và hoa cẩm tú cầu; đom đóm và đèn trời; vé và polaroid ló từ mép trang; bokeh ở tiền cảnh. Mây bay len giữa chữ số "II" và tiêu đề, đèn trời bay lên phía sau phong bì ở phần kết.
  - Lớp mộng ảo trên cùng (`DreamVeil.tsx`): bụi sáng bay lên, quả cầu sáng mờ, vệt sáng loé chậm và viền sương; ban ngày thỉnh thoảng có một đàn chim bay ngang trước nội dung. Không nhận chuột, đủ mờ để đọc xuyên qua.
  - Hình vẽ dùng chung (mây, hoa, cành, bướm, chim, hoa cẩm tú cầu, đèn trời) nằm trong `StoryArt.tsx`. Mỗi con bướm hay đom đóm chỉ là một layer (bay bằng `translate`/`rotate`, vỗ cánh hay nhấp nháy bằng `scale`/`opacity` trên cùng phần tử). Trên điện thoại số lượng ít hơn, các vòng lặp nhỏ được nghỉ, và những món nhìn rõ (hoa, cành, đèn trời, kỷ vật) dạt ra sát mép màn hình để không nằm sau chữ.

Một số điều rút ra khi đo trên mobile: animate cả `transform` (Motion chuyển cho WAAPI/compositor) thay vì `x`/`y`; không xoay trực tiếp `<svg>` (Chrome vẽ lại mỗi khung hình), hãy xoay phần tử HTML bọc ngoài; không đặt thứ đang chuyển động dưới `mask-image` hay lớp blur lớn; đồng hồ đếm ngược chỉ chạy khi phong bì nằm trên màn hình. Khi bật reduced motion, toàn bộ lớp này tắt.

## Cấu Trúc Chính

```text
src/
  main.tsx                # Điểm vào Phần I (/)
  main-part-two.tsx       # Điểm vào Phần II (/part-2/), cùng app nhưng CSS riêng
  app/                    # Điều phối trạng thái trải nghiệm
  assets/fonts/           # Font tự host và fonts.css
  features/
    intro/                # Mở đầu và transition vào câu chuyện
    story/                # Nội dung, scenes, scroll và gallery của hành trình
    memories/             # Hộp kỷ vật và WebGL tương tác (three/ tải khi cần)
  shared/                 # Hook, component và utility dùng chung
  styles/                 # Global styles và style của scrollytelling
  test/
scripts/                  # optimize-images.mjs: tạo bản AVIF/WebP cho ảnh
public/images/
```

## Deploy

Vercel:

```bash
npm run build
```

Import repo vào Vercel, framework preset là Vite, output directory là `dist`.

Vite đang dùng multi-page input trong `vite.config.ts`, vì vậy build tạo cả `dist/index.html` và `dist/part-2/index.html`, mỗi trang một file CSS riêng. Header cache đã có sẵn trong `vercel.json`.

Netlify:

```bash
npm run build
```

Build command: `npm run build`, publish directory: `dist`. Header cache nằm trong `public/_headers`.

## Hiệu Năng

- **Font tự host** trong `src/assets/fonts` (đúng các file Google Fonts trước đây, giấy phép OFL): không còn round trip sang bên thứ ba, và font tiêu đề Literata được preload nên tiêu đề không nhảy dòng khi font về. Các file `*-vietnamese-ext` chỉ chứa ~12 chữ Việt (ă, đ, ơ, ư…) cắt ra từ file latin-ext, nên mỗi trang không phải tải cả latin-ext (đã giảm ~110 kB) mà chữ vẫn dựng y hệt. Chi tiết thứ tự khai báo ở đầu `fonts.css`.
- **CSS theo trang**: hai trang dùng chung các file CSS theo cùng thứ tự; Phần II import bản `?page=two` (`src/main-part-two.tsx`). Khi build, plugin `pageScopedCss` trong `vite.config.ts` bỏ các selector chỉ khớp được ở trang kia (`.story-part-2`, `.story-page-part-two`, `.app-part-two` và phiên bản Phần I). Style dành riêng cho một trang nên được scope bằng các class này để được tách tự động.
- **Three.js tải khi cần**: hộp kỷ vật render chữ và nút ngay, còn scene 3D (`src/features/memories/three/keepsakeScene.ts`) chỉ tải khi hộp còn cách khoảng một màn hình. Canvas do React giữ chỗ sẵn nên layout không nhảy.
- **Engine cuộn**: `usePartTwoScroll` bỏ qua cảnh đã mờ hẳn hoặc chưa đổi tiến độ, không ghi lại giá trị không đổi, và `--reveal` là custom property không kế thừa (`@property`), được đưa tới từng chữ đang chuyển thay vì cả đoạn văn. Các biến hiệu ứng của sân khấu Phần II (`--vblur`, `--leak`…) cũng không kế thừa.
- **Motion tải theo nhu cầu**: phần lõi của `m` component nằm trong bundle chính; tính năng animation/layout (`domMax`) và hiệu ứng con trỏ là chunk riêng, chỉ tải khi trình duyệt rảnh nên không tranh băng thông với ảnh màn hình đầu.
- **Animation ngoài màn hình tạm dừng**: section nào có vòng lặp CSS chạy mãi (sao, ánh kim, polaroid trôi…) thì gắn `data-idle-zone`; `useIdleZones` tạm dừng chúng khi section ra khỏi màn hình và chạy tiếp khi quay lại.
- **Cache khi deploy**: `vercel.json` (Vercel) và `public/_headers` (Netlify) đặt cache vĩnh viễn cho `/assets/*` (tên file có hash) và cache một tuần cho ảnh, âm thanh.

## Bó Hoa 3D Ở Phòng Kỷ Vật

- **Dựng bằng code, không tải mô hình**: `src/features/memories/model/flowers/`. Bó hướng dương có năm bông (một bông còn non). Mỗi cánh, lá bắc và lá có hình riêng: dài ngắn, độ cong, độ xoắn, răng ở chóp, màu. Chúng được gộp theo vật liệu nên cả bó chỉ khoảng mười draw call; giấy gói và nơ (`wrap.ts`) dùng chung cho hai bó. Bó cẩm tú cầu vẫn giữ cách dựng cũ (`hydrangea.ts`).
- **Bề mặt vẽ bằng canvas** (`textures.ts`), mỗi lần dựng một lần: gân cánh, đĩa nhụy xếp theo xoắn Fibonacci, gân lá, thớ giấy kraft và nếp nhăn. Mỗi loại thành một map màu và một normal map.
- **Vật liệu** (`three/bouquet/plantMaterial.ts`) là `MeshPhysicalMaterial` thêm hai thứ:
  - gió bằng simplex noise (`windStrength`, `windSpeed`); mỗi cánh và mỗi lá rung riêng nhưng cả bông vẫn đung đưa liền khối;
  - tán xạ dưới bề mặt giả lập cho cánh và lá mỏng, không dùng transmission.

  Các ô PBR chuẩn (`map`, `normalMap`, `roughnessMap`, `aoMap`) dùng như bình thường, thêm `thicknessMap`.
- **Sân khấu** (`three/bouquet/stage.ts`):
  - hai preset đèn studio, Golden hour và Moonlight, chuyển mượt khi đổi phần;
  - bóng tiếp xúc dưới chân bó;
  - hậu kỳ gồm tone mapping AgX kèm look, DOF nhẹ, bloom ngưỡng cao, vignette và grain;
  - camera xoay và zoom trong giới hạn;
  - tự hạ chất lượng khi máy không theo kịp.

## Quyết Định Kỹ Thuật

- Nội dung tách khỏi component để dễ đổi câu chuyện.
- Không dùng remote image để tránh link chết.
- Animation ưu tiên `transform` và `opacity`.
- Có reduced-motion fallback để tránh gây khó chịu.
- Sound architecture có sẵn nhưng không tự phát âm thanh.
