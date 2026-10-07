# Hát Và Nờ

Interactive scrollytelling website kể lại hành trình hai người gặp nhau qua màn hình, mất kết nối, va lại vào nhau, rồi bắt đầu có những kỷ niệm cùng nhau ngoài đời.

Website được build thành ba trang riêng:

- `/`: Phần I — Trước khi gặp nhau, gồm intro/phòng ký ức và 5 chương đầu.
- `/part-2/`: Phần II — Thật sự đứng cạnh nhau, gồm lần gặp trực tiếp, những buổi hẹn và ngày thủy cung → café → hoàng hôn.
- `/part-3/`: Phần III — Quá nhanh, quá nguy hiểm (mùa thu 2026), lời của Ngọc, sáu chương, 15 điểm dừng: homestay đầu tiên, Inlove và Bi với Bơ, buổi chiều ở Hoàng Mai, một ngày ở Ba Đình (Lăng Bác → Chùa Một Cột → mưa trưa, mây chiều), tuần không suôn sẻ của cái chân đau (đi hát dưới mưa → phòng khám Hồng Ngọc → cf Văn Quán → Tiny cf → Jolibee và Cúc cu), rồi tháng sinh nhật anh (lên lịch → trung thu, tacos ngõ Ao Sen và Playik → cơm Nhật ở Phùng Khoang → sinh nhật 1/10, với trang anh tự viết). Tông chủ đạo đỏ, bó hoa đại diện là hoa ly đỏ.

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

Toàn bộ nội dung chính nằm ở `src/features/story/data/story.ts`. `storyParts` chia câu chuyện thành ba phần; `partTwoChapters` là nơi thêm dữ liệu cho lần gặp trực tiếp, các buổi hẹn và ngày đi thủy cung — café — ngắm hoàng hôn; `partThreeChapters` giữ nguyên văn lời Ngọc cho Phần III (những dòng "chèn thêm ảnh…" trong bản gốc đã thành chú thích ảnh). Trang của mỗi phần, class và chữ số La Mã lấy từ `partHrefs`, `partClassNames` và `romanNumeral`.

Trong đoạn văn, cụm chữ bọc trong `==...==` được tô như bút dạ. Dấu câu viết liền sau cụm (`==cùng ước nguyện==,`) đi chung hộp với chữ cuối của cụm, nên không bao giờ rơi xuống đầu dòng mới; nét bút dừng ngay trước dấu câu đó.

Các mốc thời gian nằm trong cùng file:

- `partThreeCopy.opensAt`: ngày phong bì cuối Phần II mở ra và dẫn sang `/part-3/` (nút "Đọc Phần III").
- `nextPartCopy.opensAt`: phong bì niêm phong ở cuối Phần III, đếm ngược tới chương tiếp theo (20/12/2026).
- `loveCounterStart`: ngày bắt đầu của bộ đếm Inlove ở chương "Yêu lại càng yêu nhiều hơn". Bộ đếm tính theo lịch Hà Nội: tháng đủ trước, rồi tuần và ngày, như app (`utils/loveCounter.ts`).

Mỗi chapter có `id`, `year`, `title`, `shortTitle`, `paragraphs`, `quote`, `mood`, `accent`, `image`, `imageAlt`, `alignment`, `optionalSound` và `threadState`. Chương có nhiều cảnh dùng thêm `scenes`; mỗi cảnh cũng có `id` ổn định để theo dõi active/visited và mở đúng kỷ vật.

Để bổ sung dữ liệu thật cho Phần II:

- Điền ngày/năm vào `year` khi đã xác nhận.
- Thêm đường dẫn ảnh vào `image`; thêm ảnh album bằng các phần tử `{ src, alt, caption }` trong `gallery`. Ảnh chụp màn hình điện thoại thì thêm `screen: true`: cảnh đặt nó vào một chiếc điện thoại thay vì một tấm ảnh in (như tin nhắn xin phép bố Tiến ở Tiny cf).
- Xóa `imageNote` hoặc `placeholderNote` tương ứng khi đã có ảnh thật.
- Thêm `secretNote` nếu có nội dung bí mật thật; không cần tạo placeholder cho lời thoại chưa có.
- Chỗ một người để trống cho người kia viết thì điền `reply: { label, paragraphs }`: cột đọc in nó thành một tờ giấy viết tay riêng (như trang anh viết cho ngày sinh nhật 1/10).

## Thay Ảnh

Ảnh thật đang nằm ở `public/images/story/lover`. Bộ ảnh đã được đặt tên theo mood/khoảnh khắc như `mirror-cardigan.jpg`, `polka-peace.jpg`, `bear-close.png`, `flower-peace.jpg`, `plush-moments.jpg` để dễ gắn vào từng chapter. Ảnh Phần III nằm ở `public/images/story/part-three` (cạnh dài tối đa 1600 px, đã xóa metadata).

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

Phần III đi cùng engine đó: trang của nó mang cả class `story-part-2` lẫn `story-part-3`, nên sân khấu, bầu trời (`PartThreeAtmosphere`) và các `data-*` chạy y như Phần II; cảnh của bốn chương đầu vẽ trong `scenes/PartThreeScene.tsx`, của chương 5 và 6 trong `scenes/PartThreeAutumnScene.tsx` (đồ vật ở `atoms/PartThreeAutumnSprites.tsx`, màu và bố cục ở `story-part-three-autumn.css`). Với 15 điểm dừng, thanh hành trình dưới sân khấu (`MemoryJourneyRoute`, từ 9 điểm trở lên) thành một dải khung nhỏ: chỉ tên điểm đang đọc và chương của nó hiện ở dòng tiêu đề, mỗi chương mở bằng một vạch mảnh và một màu riêng, tên từng điểm hiện khi rê chuột hay focus. Engine cũng cho những dòng chữ quá sát cuối phần (đoạn ngắn cuối cùng, sau nó không còn gì) hiện trọn trước khi phần kết thúc, vì qua điểm đó engine không vẽ nữa. Ở đây `data-fade` còn dùng để đổi cảnh ngay trong một chương: màn chiếu đi từ "Me Before You" sang "365 Days" rồi chiếc thuyền giấy, ảnh thứ hai thay ảnh đầu như lật slide (ảnh cũ gần như tắt hẳn rồi ảnh mới mới hiện, không bao giờ hai ảnh cùng mờ một nửa). Mọi lần đổi rơi vào khoảng 0.3–0.6 tiến độ của cảnh: trên desktop đó là lúc cảnh đứng yên trên sân khấu giữa hai lần chuyển, trên điện thoại là lúc cả khung cảnh nằm trọn trong màn hình.

Lenis chỉ làm smooth scroll; khi `prefers-reduced-motion: reduce`, Lenis và reveal animation không chạy, còn nội dung vẫn đọc tuyến tính và state active vẫn theo đúng vị trí cuộn.

## Chuyển Động (Motion)

Lớp hiệu ứng tương tác dùng Motion và các mẫu quen thuộc của Aceternity UI, Magic UI, React Bits, viết lại cho hợp tông của truyện thay vì chép nguyên khối:

- `src/shared/motion/`: `MotionProvider` (`LazyMotion` + `MotionConfig reducedMotion="user"`), bộ lò xo dùng chung `springs.ts`, `useRevealOnce`, `whenIdle`.
- `src/shared/components/motion/`: `BlurText` (chữ hiện dần từ mờ sang nét), `RollingNumber` (số lăn như đồng hồ cơ), `CircularText` (chữ chạy vòng quanh con dấu), `Meteors` (sao băng).
- `src/shared/interactions/`: một listener `pointermove` duy nhất cho các phần tử có `data-magnetic` (nút hút nhẹ theo chuột), `data-tilt` (ảnh nghiêng 3D có vệt sáng; dùng `data-tilt="transform"` cho phần tử mà `transform` đang có animation riêng) và `data-spotlight` (thẻ có đèn rọi theo chuột); cộng với tia sáng khi bấm nút. Chỉ bật trên thiết bị có chuột.
- `src/styles/motion-edition.css`: shimmer (`.has-shimmer`), viền sáng chạy quanh thẻ kỷ vật, sao băng, vòng chữ, và một đường cong lò xo cho transition CSS, lấy mẫu bằng `spring()` của Motion.
- Highlight của nút kỷ vật và vạch chương ở sticky stage dùng `layoutId` nên trượt giữa các vị trí.
- Nền nhiều lớp cho cả hai phần. Cơ chế dùng chung nằm trong `src/styles/depth-field.css`: các mặt phẳng dài bằng trang (`.depth-plane`), mỗi mặt trượt theo `scroll(root)` với tốc độ riêng (`--k`); `--at` là vị trí một món khi nó nằm giữa màn hình; những món tự chuyển động là idle zone nên đứng yên khi khuất màn hình. Trình duyệt chưa có scroll timeline (Safari trước 26, Firefox) được `useDepthParallaxFallback` đẩy các lớp bằng script, đọc cùng các con số trong CSS (`[data-scroll-drift]`, `[data-scroll-path]`). Trên điện thoại (≤ 900px) các mặt phẳng đứng yên và cuộn cùng trang, mỗi món nằm đúng chỗ `--at` của nó: lề hẹp nên độ sâu khó thấy, còn mỗi mặt phẳng trượt là một layer dài bằng trang phải vẽ lại suốt đường cuộn.
  - Phần I (`PartOneDepth.tsx`, `PartOneAtmosphere.tsx`, `part-one-depth.css`): trời chiều có mặt trời và tia nắng, ba tầng mây trôi bồng bềnh, đàn chim; vệt nắng, đốm sáng, chữ viền khổng lồ; mây, hình vẽ nét, hoa; bướm và cành anh đào; đồ scrapbook ló từ mép trang; hoa và bướm lớn mờ ở tiền cảnh. Một đám mây và một con bướm bay len giữa ba tấm ảnh hero, một đám mây len giữa các ảnh scrapbook (z-index nằm giữa các ảnh). Hero, scrapbook và hoa ở hộp kỷ vật cũng tách lớp khi cuộn qua.
  - Phần II (`PartTwoDepth.tsx`, `PartTwoAtmosphere.tsx`, `part-two-depth.css`): trăng tròn (lên dần khỏi khung hình khi rời trang tiêu đề, nhường chỗ cho bầu trời của từng chương) và mây đêm trên bầu trời đầu tiên; bokeh đèn thành phố, sao, chữ viền; mây đêm và hoa cẩm tú cầu; đom đóm và đèn trời; vé và polaroid ló từ mép trang; bokeh ở tiền cảnh. Mây bay len giữa chữ số "II" và tiêu đề, đèn trời bay lên phía sau phong bì ở phần kết.
  - Phần III (`PartThreeDepth.tsx`, `PartThreeAtmosphere.tsx`, mục 13 trong `story-part-three.css`): một mùa thu tông đỏ hoa ly, mở đầu bằng căn phòng đỏ có chùm sáng máy chiếu; đèn mờ vàng, hồng và đỏ rượu; cánh hoa đỏ, cánh sen, rồi những bông ly đỏ trôi ở hai chương cuối; tim nhỏ và đốm vàng bay vòng; chữ viền ("thuyền", "Bi & Bơ", "lén lút", "ước", "chiều tà", "sư tử", "ha hả", "Cúc cu", "trung thu", "Tadaaaa") ở lề phải, đặt ngang đoạn văn có chữ đó; khung phim, vé và polaroid ló từ mép (bên trái chỉ có khung phim tối, vì nhãn sáng của sân khấu đi qua phía trước). Mỗi điểm dừng một bầu trời: ánh hai màn hình điện thoại, chiều vàng Hoàng Mai, trưa trong ở Ba Đình, xanh ngọc của hồ sen, mưa trưa rồi chiều tà, neon phòng hát trong mưa, hồng của căn phòng 59A, đèn phố bên hồ Văn Quán, chiều vàng Tiny cf, sân khấu vàng ở Cúc cu, hoàng hôn tím của những dự định, trăng trung thu với đèn lồng bay, ánh hổ phách quán Nhật, và sinh nhật đỏ hoa ly lấp lánh vàng. Các lớp nền trải tới khoảng 86% trang, chỗ hết các chương.
  - Lớp mộng ảo trên cùng (`DreamVeil.tsx`): bụi sáng bay lên, quả cầu sáng mờ, vệt sáng loé chậm và viền sương; ban ngày thỉnh thoảng có một đàn chim bay ngang trước nội dung. Không nhận chuột, đủ mờ để đọc xuyên qua. Trên điện thoại chỉ còn viền sương và vài hạt bụi.
  - Hình vẽ dùng chung (mây, hoa, cành, bướm, chim, hoa cẩm tú cầu, đèn trời) nằm trong `StoryArt.tsx`. Mỗi con bướm hay đom đóm chỉ là một layer (bay bằng `translate`/`rotate`, vỗ cánh hay nhấp nháy bằng `scale`/`opacity` trên cùng phần tử). Trên điện thoại số lượng ít hơn, các vòng lặp nhỏ được nghỉ, và những món nhìn rõ (hoa, cành, đèn trời, kỷ vật) dạt ra sát mép màn hình để không nằm sau chữ.

- Lớp chuyển động theo cú cuộn (`src/styles/scroll-life.css`). Tất cả đọc chung một nguồn tốc độ cuộn (`src/shared/motion/scrollVelocity.ts`): một listener scroll đánh thức một callback trên ticker của GSAP, và callback tự nghỉ khi trang đứng yên.
  - Gió (`ScrollWind.tsx`, `utils/scrollWind.ts`): cánh hoa (Phần I), đốm sáng, sao bốn cánh, hoa cẩm tú cầu (Phần II) hoặc đốm vàng, cánh hoa đỏ, cánh sen và trái tim (Phần III, biến thể `ember`) bay ngang qua người đọc khi trang chạy, cuộn càng nhanh càng nhiều. Món gần to, mờ và nhanh hơn món xa. Trang dừng thì cánh hoa rơi chậm, đốm sáng bay lên. Tất cả vẽ trên một canvas cố định, chỉ dựng khi người đọc bắt đầu cuộn. Phần kết và trang tiêu đề Phần II tung một nắm lên không (`windBurst`). Trên điện thoại gió chỉ có khi được tung, không thổi theo cú cuộn.
  - Dải chữ (`ScrollRibbon.tsx`): hai băng chữ bắt chéo qua khe giữa các phần, như băng dính washi (Phần I) hay dải phim (Phần II, và Phần III với phim đỏ rượu viền vàng). Chữ chạy chậm theo chiều vừa cuộn, nhanh lên khi cuộn và hơi nghiêng theo (chỉ trên máy có chuột). Dải không chiếm chỗ trong layout và chỉ chạy khi đang trên màn hình. Vị trí từng dải chỉnh trong CSS (`.at-opening`, `.at-recap`, `.at-stops`, `.at-closing`), chữ lấy từ `scrollRibbonCopy` và tên chương.
  - Quán tính (`useDepthInertia`): các mặt phẳng nền trễ lại một chút khi trang chạy (lớp càng gần càng trễ) rồi bắt kịp bằng lò xo. Độ trễ ghi vào `translate` nên không đụng `transform` của scroll timeline. Chỉ bật với chuột và trackpad, vì cuộn cảm ứng đã có quán tính riêng.
  - Biên đạo theo cú cuộn (`useScrollChoreography`, GSAP ScrollTrigger; cuộn ngược thì chạy ngược):
    - tiêu đề hero tản ra khi rời đi;
    - ảnh scrapbook được tung lên trang rồi đáp xuống;
    - chữ tiêu đề Phần I lật lên từng chữ cái (trên điện thoại thì từng từ nổi lên, không lật 3D), mục lục trượt vào;
    - số chương lớn trôi nhanh hơn chữ;
    - ảnh kỷ vật mỗi chương xoay về phía người đọc và "hiện hình" như ảnh chụp lấy liền, có vệt sáng lướt qua (trên điện thoại ảnh chỉ xoay thẳng lại khi nổi lên);
    - hộp kỷ vật nghiêng lên (trên điện thoại chỉ nổi lên, không nghiêng 3D), các nút bật vào;
    - album chia ra như chia bài;
    - trang tiêu đề Phần II tách lớp khi rời đi, chữ số "II" phình ra;
    - ảnh ở phần kết rơi xuống rồi lắc lư dừng lại.

    Phần tử nào đã có animation CSS giữ `transform` thì đi qua custom property đã đăng ký (`--swing`, `--drop`, `--numeral-zoom`), đọc bằng `rotate`/`scale`/`translate` riêng.
  - Thanh tiến trình đọc có một trái tim (Phần I và III) hoặc ngôi sao (Phần II) lăn ở đầu thanh (`ReadingProgress.tsx`), cũng chạy bằng scroll timeline.

- Phòng kỷ vật là một tiên cảnh trên biển mây (`FairyRealm.tsx`, `FairyDust.tsx`, `src/styles/memory-fairyland.css`), mỗi phần một cõi:
  - Phần I: mặt trời lặn ngay sau bó hướng dương, tia nắng xoay chậm, hạc bay ngang trời chiều.
  - Phần II: trăng tròn có quầng sau bó cẩm tú cầu, đèn trời bay lên từ mây.
  - Hai bên là núi đá vôi có thông trên đỉnh, sương vờn quanh chân núi. Dưới bệ hoa có vòng sáng lan ra và bóng bệ in trên mây. Đổi phần thì mặt trời lặn xuống biển mây và trăng mọc lên.
  - `useRealmAnchor` đo vị trí bó hoa và ghi `--realm-x` / `--realm-y`, để mặt trời và trăng luôn nằm ngay sau hoa. Trên điện thoại phòng cuộn bên dưới bầu trời cố định: theo scroll timeline của phòng (`--room`), mặt trời hay trăng đi lên cùng bó hoa (`--room-travel` là quãng phòng cuộn được), cành hoa hai góc trên nhấc lên và luống hoa hai góc dưới chìm vào mây, để không đè lên tên trang, thẻ chọn phần và chân trang.
  - Mây vẽ bằng SVG một lần, mỗi hàng bông che chân hàng phía sau. Tia sáng là một canvas nhỏ được compositor phóng to.
  - Bốn góc có hoa (`FairyCorners.tsx`, hình vẽ dùng chung ở `utils/realmShapes.ts`):
    - hai góc trên là cành hoa có chùm hoa rủ, anh đào ở Phần I và hoa trắng ánh trăng ở Phần II;
    - hai góc dưới là luống hoa trên mây: hướng dương, cúc cánh bướm và hoa baby ở Phần I; cẩm tú cầu, oải hương và hoa baby ở Phần II.

    Mỗi góc là một SVG dựng một lần từ seed cố định, mỗi tông màu gộp thành một path. Cành đung đưa chậm, và góc to dần theo phần lề trống trên màn hình rộng.
  - Bụi tiên (`utils/fairyDust.ts`) vẽ trên một canvas:
    - đom đóm sáng lên tắt xuống;
    - tiên quang bay vòng quanh bó hoa;
    - cánh hướng dương, anh đào hoặc hoa cẩm tú cầu rơi;
    - tia sáng bay lên từ bệ;
    - bướm phát sáng rắc bụi;
    - vệt bụi theo con trỏ, đom đóm né tay;
    - chạm hay bấm vào chỗ trống thì tung một nắm.

    Mở câu chuyện thì tất cả bị hút vào bó hoa.
  - Các lớp có `data-depth` (núi, mây, sương, trăng) nghiêng nhẹ theo chuột. Trên điện thoại có ít hạt hơn, không có đuôi sáng, và sương, cánh hạc, phần lớn ngôi sao đứng yên.

Một số điều rút ra khi đo trên mobile:

- Animate cả `transform` (Motion chuyển cho WAAPI/compositor) thay vì `x`/`y`.
- Không xoay hay di chuyển trực tiếp `<svg>`, vì Chrome vẽ lại nó mỗi khung hình. Hãy animate phần tử HTML bọc ngoài.
- Không đặt thứ đang chuyển động dưới `mask-image` hay lớp blur lớn. Không đặt nó trong chữ có `background-clip: text`, vì chữ sẽ bị vẽ lại.
- Khi bó hoa 3D hay canvas bụi chạy liên tục, mỗi animation CSS đang chạy đều tốn thời gian luồng chính ở mọi khung hình, kể cả animation chạy trên compositor. Vì vậy trên điện thoại chỉ giữ những vòng lặp nhìn thấy rõ.
- Lớp sáng đang trôi (cực quang, quầng sáng) chỉ cần gradient mềm. `filter: blur()` trên lớp đang chuyển động bị compositor tính lại mỗi khung hình. `backdrop-filter` phía trên mây đang trôi cũng vậy, nên trên điện thoại thẻ chọn phần dùng nền đặc hơn thay cho kính mờ.
- Nhịp sáng (chấm trạng thái) animate `opacity`/`transform` của một lớp riêng chứ không animate `box-shadow`, vì `box-shadow` phải vẽ lại mỗi khung hình.
- Cõi không hiển thị được `visibility: hidden` sau khi mờ hẳn, nên compositor không phải vẽ và giữ các lớp của nó. Sao băng chỉ chạy ở Phần II.
- Canvas bụi tiên vẽ tối đa khoảng 60 khung hình/giây; trên màn 120 Hz nó vẽ cách một khung.
- Đồng hồ đếm ngược chỉ chạy khi phong bì nằm trên màn hình.
- Trên trang câu chuyện, điện thoại bỏ hết `backdrop-filter` (nút âm thanh, thanh chuyển phần, khung cảnh từng chương, hộp kỷ vật): mọi thứ phía sau đều đang chạy nên kính mờ bị tính lại mỗi khung hình. Các khung này dùng nền đặc hơn cùng màu.
- Không dùng `transform` 3D hay `filter` thay đổi theo từng khung khi cuộn (chữ cái lật 3D, ảnh "rửa phim"): mỗi chữ cái thành một layer riêng, còn filter vẽ lại cả tấm ảnh. Chữ của từng đoạn cũng không mang `transform` riêng trên điện thoại; đoạn văn mờ dần cả khối.
- Sang chương mới làm trang render lại. Phần cảnh nền (lớp sâu, bầu trời, dải chữ, hero, phần kết) được bọc `memo` nên chỉ các chương và hộp kỷ vật render lại; trước đó mỗi lần sang chương là một lần khựng giữa lúc cuộn.
- Hộp kỷ vật 3D chỉ vẽ khung đầu tiên sau khi shader đã biên dịch xong ngoài luồng chính (`compileAsync`); vẽ ngay thì khung đó làm khựng cú cuộn đúng lúc hộp hiện ra. Trên điện thoại, khi trang đang được cuộn qua, hộp vẽ cách một khung.
- Bẫy cuộn trên điện thoại: chỉ đặt `overflow-x: auto` thì `overflow-y` tự thành `auto`, nên một dải ảnh nghiêng có vài px để cuộn dọc và giữ luôn cú vuốt lên. Dùng `overflow: auto hidden`. Canvas chỉ để chạm (hộp kỷ vật) dùng `touch-action: manipulation` chứ không phải `none`, nếu không vuốt bắt đầu trên nó sẽ không cuộn trang.

Khi bật reduced motion, toàn bộ lớp này tắt.

Phần kết của Phần III (`StoryPartThreeEnding.tsx`) như cuối một bộ phim: rèm nhung khép vào từ hai bên, "Còn tiếp..." hiện từng chữ, rồi danh sách credits (bối cảnh, phim định xem và phim xem được, nhạc nền, ứng dụng, Bi và Bơ, thực đơn, đạo cụ, thời tiết, khách mời; đều lấy từ thư của Ngọc trong `partThreeEndingCopy`) cuộn lên từng dòng theo scroll timeline. Sau đó là phong bì của chương tiếp theo và các nút quay lại.

## Cấu Trúc Chính

```text
src/
  main.tsx                # Điểm vào Phần I (/)
  main-part-two.tsx       # Điểm vào Phần II (/part-2/), cùng app nhưng CSS riêng
  main-part-three.tsx     # Điểm vào Phần III (/part-3/): CSS của Phần II cộng story-part-three.css và story-part-three-autumn.css
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

Vite đang dùng multi-page input trong `vite.config.ts`, vì vậy build tạo `dist/index.html`, `dist/part-2/index.html` và `dist/part-3/index.html`, mỗi trang một file CSS riêng. Header cache đã có sẵn trong `vercel.json`.

Netlify:

```bash
npm run build
```

Build command: `npm run build`, publish directory: `dist`. Header cache nằm trong `public/_headers`.

## Hiệu Năng

- **Font tự host** trong `src/assets/fonts` (đúng các file Google Fonts trước đây, giấy phép OFL): không còn round trip sang bên thứ ba, và font tiêu đề Literata được preload nên tiêu đề không nhảy dòng khi font về. Các file `*-vietnamese-ext` chỉ chứa ~12 chữ Việt (ă, đ, ơ, ư…) cắt ra từ file latin-ext, nên mỗi trang không phải tải cả latin-ext (đã giảm ~110 kB) mà chữ vẫn dựng y hệt. Chi tiết thứ tự khai báo ở đầu `fonts.css`.
- **CSS theo trang**: các trang dùng chung các file CSS theo cùng thứ tự; Phần II import bản `?page=two` (`src/main-part-two.tsx`), Phần III bản `?page=three` cộng `story-part-three.css` và `story-part-three-autumn.css`. Khi build, plugin `pageScopedCss` trong `vite.config.ts` bỏ các selector chỉ khớp được ở trang khác (`.story-part-2`, `.story-page-part-two`, `.app-part-two`, bản Phần I và bản `-3`/`-three` của Phần III). Trang Phần III mang cả class của Phần II, nên ở đó chỉ selector của Phần I bị bỏ. Style dành riêng cho một trang nên được scope bằng các class này để được tách tự động.
- **Three.js tải khi cần**: hộp kỷ vật render chữ và nút ngay, còn scene 3D (`src/features/memories/three/keepsakeScene.ts`) chỉ tải khi hộp còn cách khoảng một màn hình. Canvas do React giữ chỗ sẵn nên layout không nhảy.
- **Engine cuộn**: `usePartTwoScroll` bỏ qua cảnh đã mờ hẳn hoặc chưa đổi tiến độ, không ghi lại giá trị không đổi, và `--reveal` là custom property không kế thừa (`@property`), được đưa tới từng chữ đang chuyển thay vì cả đoạn văn. Các biến hiệu ứng của sân khấu Phần II (`--vblur`, `--leak`…) cũng không kế thừa.
- **Motion tải theo nhu cầu**: phần lõi của `m` component nằm trong bundle chính; tính năng animation/layout (`domMax`) và hiệu ứng con trỏ là chunk riêng, chỉ tải khi trình duyệt rảnh nên không tranh băng thông với ảnh màn hình đầu.
- **Không đọc vị trí cuộn trên ticker**: vị trí cuộn được đọc trong sự kiện scroll (`scrollVelocity.ts`, `useTuckOnScrollDown`). Nếu đọc trong requestAnimationFrame, ngay sau khi engine cuộn vừa ghi style, trình duyệt phải tính lại style thêm một lần mỗi khung hình.
- **Animation ngoài màn hình tạm dừng**: section nào có vòng lặp CSS chạy mãi (sao, ánh kim, polaroid trôi…) thì gắn `data-idle-zone`; `useIdleZones` tạm dừng chúng khi section ra khỏi màn hình và chạy tiếp khi quay lại.
- **Cache khi deploy**: `vercel.json` (Vercel) và `public/_headers` (Netlify) đặt cache vĩnh viễn cho `/assets/*` (tên file có hash) và cache một tuần cho ảnh, âm thanh.

## Bó Hoa 3D Ở Phòng Kỷ Vật

- **Dựng bằng code, không tải mô hình**: `src/features/memories/model/flowers/`. Mỗi cánh, đài, lá bắc và lá có hình riêng: dài ngắn, độ cong, độ xoắn, độ gợn mép, màu (bộ dựng chung ở `blades.ts`). Chúng được gộp theo vật liệu nên mỗi bó chỉ khoảng mười draw call; giấy gói và nơ (`wrap.ts`) dùng chung cho hai bó.
  - Hướng dương (`sunflower.ts`): năm bông (một bông còn non), lá ráp hình tim, hoa baby.
  - Cẩm tú cầu (`hydrangea.ts`): ba bông xanh lam, xanh da trời và tím oải hương. Mỗi bông là vài trăm hoa con 3–5 đài, gom thành từng cụm u lên và có một lớp hoa chìm, tối hơn bên dưới, nên khe giữa các hoa con trông có chiều sâu chứ không thủng. Chỗ hai bông chạm nhau, bông đứng trước giữ hoa, bông sau nhường. Kèm lá cẩm tú cầu bóng có răng cưa và bạch đàn lá tròn mọc đối chéo.
- **Bề mặt vẽ bằng canvas** (`textures.ts`), mỗi lần dựng một lần: gân cánh, đĩa nhụy xếp theo xoắn Fibonacci, gân lá (lá cẩm tú cầu phồng lên giữa các gân), gân đài hoa, lớp phấn trên lá bạch đàn, thớ giấy kraft và nếp nhăn. Mỗi loại thành một map màu và một normal map.
- **Vật liệu** (`three/bouquet/plantMaterial.ts`) là `MeshPhysicalMaterial` thêm hai thứ:
  - gió bằng simplex noise (`windStrength`, `windSpeed`); mỗi cánh và mỗi lá rung riêng nhưng cả bông vẫn đung đưa liền khối;
  - tán xạ dưới bề mặt giả lập cho cánh và lá mỏng, không dùng transmission.

  Các ô PBR chuẩn (`map`, `normalMap`, `roughnessMap`, `aoMap`) dùng như bình thường, thêm `thicknessMap`.
- **Sân khấu** (`three/bouquet/stage.ts`):
  - hai preset đèn studio, Golden hour và Moonlight, chuyển mượt khi đổi phần; mỗi preset có một look màu riêng (Golden rực, Moonlight dịu);
  - bóng tiếp xúc dưới chân bó;
  - hậu kỳ gồm tone mapping AgX kèm look, DOF nhẹ, bloom ngưỡng cao, vignette và grain;
  - camera xoay và zoom trong giới hạn;
  - tự hạ chất lượng khi máy không theo kịp;
  - bó đang xem được dựng trước để hiện sớm; bó còn lại dựng ngầm, mỗi lần vài mili giây vào lúc trình duyệt rảnh (`introFlowerSteps`), rồi biên dịch shader và tải texture lên GPU trước (`warm()`), nên chuyến bay sang không bị khựng. Để việc làm trước này có tác dụng:
    - shader phải được biên dịch đúng như lúc vẽ thật. Cảnh được vẽ vào render target tuyến tính của hậu kỳ, nên `warm()` biên dịch khi target đó đang gắn (`BouquetPost.inScenePass`). Biên dịch cho canvas sẽ ra biến thể khác (sRGB), và three phải biên dịch lại ngay giữa chuyến bay;
    - bóng có gió của cây (`plantDepthMaterial`) cũng được biên dịch trước (`compileShadowTwins`), dựng y như lượt vẽ bóng của three dựng nó;
    - đèn nằm cả trên layer của bóng tiếp xúc. three vẽ bóng trước khi nạp đèn của khung hình, nên nếu lượt bóng tiếp xúc không thấy đèn, lượt vẽ bóng ngay sau nó dùng trạng thái không đèn và phải biên dịch thêm biến thể;
    - lần dùng đầu của mỗi shader phải đọc log và uniform từ GPU process, một vòng hỏi-đáp phải đợi mọi lệnh đang xếp hàng. Việc này cũng làm trước, mỗi lúc rảnh một ít.

### Thay bằng mô hình GLB

Mỗi bó có thể lấy từ một file `.glb` dựng trong Blender thay cho bản dựng bằng code. Sân khấu, gió, bóng và đèn giữ nguyên.

1. **Bật nguồn GLB** trong `src/features/memories/model/bouquetSources.ts`, rồi đặt file vào `public/models/`:

   ```ts
   hydrangea: { source: "glb", url: "/models/hydrangea.glb" },
   ```

   Nếu file không tải được, trang ghi cảnh báo trong console và hiện bó dựng bằng code. Bộ nạp (`three/bouquet/glbBouquet.ts`) chỉ được tải khi có bó dùng GLB.

2. **Đặt tên object trong Blender.** Từ đầu tiên khớp trong tên object (hoặc tên object cha) quyết định vật liệu và cách gió tác động:

   | Tên bắt đầu bằng | Phần | Gió và ánh sáng |
   | --- | --- | --- |
   | `petal_`, `sepal_`, `ray_` | cánh, đài hoa | đung đưa liền khối, rung nhẹ ở chóp, ánh sáng xuyên qua |
   | `leaf_`, `bract_` | lá, lá bắc | như cánh, rung ít hơn |
   | `stem_`, `stalk_`, `branch_` | cành, cuống | uốn dần theo chiều cao |
   | `seed_`, `disc_`, `center_`, `bud_` | nhụy, đĩa hạt, nụ | đung đưa liền khối, không trong mờ |
   | `wrap_`, `paper_`, `ribbon_`, `bow_`, `tag_` | giấy gói, nơ, thẻ | đứng yên |

   - Object có tên khác giữ vật liệu gốc và đứng yên.
   - Custom property `plantPart` trên object (`petal`, `leaf`, `stem`, `seed`, `wrap`, hoặc `none` để đứng yên) được ưu tiên hơn tên.
   - Mỗi mesh đung đưa quanh tâm của chính nó. Gộp mọi cánh của một bông thành một object (Ctrl+J) để cả bông chuyển động cùng nhau; để mỗi lá là một object riêng để lá rung độc lập. Các bản instance (Alt+D, hoặc `gltf-transform instance`) mỗi bản đung đưa riêng.

3. **Vật liệu.** Dùng Principled BSDF: Base Color, Roughness, Normal Map, Alpha Clip cho lá dạng thẻ, có thể thêm Sheen và Clearcoat.
   - Metallic luôn được đặt về 0. Transmission bị bỏ qua: trang tự giả lập ánh sáng xuyên qua cánh và lá.
   - Tinh chỉnh thêm bằng Custom Properties trên material: `translucency` (0–1), `translucencyColor` (`"#rrggbb"`), `backTint` (màu mặt dưới, `"#rrggbb"` hoặc kiểu màu), `sway` và `flutter` (0–1).

4. **Hệ trục và tỉ lệ.** Dựng ở tỉ lệ nào cũng được, không cần Apply Transform. Bó được tự canh giữa, co giãn cho cao khoảng 2,55 đơn vị và đặt đáy lên mặt bệ. Mặt trước của bó hướng về −Y trong Blender (Front view, phím 1 trên numpad).

5. **Xuất** bằng File › Export › glTF 2.0:
   - Format: **glTF Binary (.glb)**.
   - Include: Selected Objects (hoặc Visible Objects), bật **Custom Properties**.
   - Transform: **+Y Up**.
   - Mesh: Apply Modifiers, UVs, Normals; bật Vertex Colors nếu có dùng.
   - Material: Export. Không xuất animation, đèn hay camera vì trang dùng đèn riêng.
   - Để Compression tắt; nén ở bước sau.

6. **Nén bằng [glTF Transform](https://gltf-transform.dev)**:

   ```bash
   npx @gltf-transform/cli optimize bouquet.glb public/models/hydrangea.glb --compress draco --texture-compress webp --flatten false --join-named false --palette false --simplify false
   ```

   - `--join-named false` và `--palette false` giữ các object có tên tách riêng, nên bước 2 vẫn nhận ra chúng.
   - `--flatten false` giữ cây object, để tên object cha vẫn có tác dụng.
   - `--simplify false` giữ nguyên mép cánh mỏng.
   - Dùng `--compress meshopt` để nén Meshopt. Dùng `--texture-compress ktx2` để có texture KTX2 nhẹ VRAM (cần cài [KTX-Software](https://github.com/KhronosGroup/KTX-Software) để có lệnh `toktx`).
   - Nên giữ dưới khoảng 300 nghìn tam giác, texture tối đa 2048 px (1024 px cho phần nhỏ), file dưới khoảng 8 MB.

   Decoder Draco và Basis (cho KTX2) lấy từ chính bản của `three`. Vite phục vụ chúng khi dev; khi build, bộ Basis nằm ở `dist/decoders/` và Draco nằm trong `dist/assets/`. Người xem chỉ tải chúng khi có bó dùng GLB cần đến.

## Quyết Định Kỹ Thuật

- Nội dung tách khỏi component để dễ đổi câu chuyện.
- Không dùng remote image để tránh link chết.
- Animation ưu tiên `transform` và `opacity`.
- Có reduced-motion fallback để tránh gây khó chịu.
- Sound architecture có sẵn nhưng không tự phát âm thanh.
