export type StoryPartId = "before-meeting" | "together-offline" | "too-fast";
export type StoryMood = "spark" | "quiet" | "return" | "parallel" | "warmth" | "daylight" | "aqua" | "cafe" | "sunset" | "velvet" | "screen" | "afternoon" | "heritage" | "lotus" | "rain" | "neon" | "clinic" | "lakeside" | "notebook" | "acoustic" | "planner" | "lantern" | "bento" | "birthday";
export type StoryAlignment = "left" | "right";
export type StoryVisualType = "swipe" | "disconnect" | "suggestion" | "parallel" | "wheel" | "in-person" | "dates" | "aquarium" | "cafe" | "sunset" | "homestay" | "apps" | "office" | "museum" | "pagoda" | "rain" | "karaoke" | "clinic" | "lakeside" | "notebook" | "acoustic" | "planner" | "lantern" | "bento" | "birthday";
export type StoryArtifactType = "profiles" | "silent-chat" | "friend-request" | "eight-hour-clock" | "open-loop" | "pair-frame" | "date-card" | "aquarium-ticket" | "cafe-cup" | "sunset-photo" | "movie-night" | "love-counter" | "cake-box" | "museum-visit" | "wish" | "rain-bowl" | "karaoke-mic" | "x-ray" | "avocado-smoothie" | "lip-letter" | "setlist" | "calendar" | "mooncake" | "bento-box" | "birthday-cake";
export type StoryThreadState = "meeting" | "disconnected" | "reconnecting" | "parallel" | "staying" | "in-person" | "dating" | "aquarium" | "cafe" | "sunset" | "homestay" | "apps" | "office" | "museum" | "pagoda" | "rain" | "karaoke" | "clinic" | "lakeside" | "notebook" | "acoustic" | "planner" | "lantern" | "bento" | "birthday";
export type StoryPartNumber = 1 | 2 | 3;
export type SecretTone = "spark" | "soft" | "bold";

export interface StoryPhoto {
  src?: string;
  alt: string;
  caption: string;
  placeholderNote?: string;
  /** A phone screenshot: the stage shows it inside a phone, never as a print taking over from the main photo. */
  screen?: boolean;
}

export interface StoryChapter {
  id: string;
  index: number;
  year: string;
  title: string;
  shortTitle: string;
  /** @deprecated use paragraphs — kept for compatibility */
  description: string;
  paragraphs: string[];
  microcopy: string;
  quote: string;
  secretNote?: {
    label: string;
    text: string;
  };
  /** A page written back: where one of them left a part for the other to write, the other's own words. */
  reply?: {
    label: string;
    paragraphs: string[];
  };
  secretTone: SecretTone;
  memoryCaption: string;
  gallery: StoryPhoto[];
  mood: StoryMood;
  accentColor: string;
  /** Alias for accentColor used by scene components */
  accent: string;
  image: string;
  imageAlt: string;
  imageNote?: string;
  alignment: StoryAlignment;
  optionalSound?: string;
  visualType: StoryVisualType;
  artifactType: StoryArtifactType;
  threadState: StoryThreadState;
  scenes?: StoryScene[];
}

export interface StoryScene extends Omit<StoryChapter, "index" | "scenes"> {
  sceneIndex: number;
}

export interface StoryPart {
  id: StoryPartId;
  number: StoryPartNumber;
  eyebrow: string;
  title: string;
  subtitle: string;
  chapters: StoryChapter[];
}

export interface StoryScrollItem extends Omit<StoryChapter, "scenes"> {
  partId: StoryPartId;
  partNumber: StoryPartNumber;
  partTitle: string;
  chapterId: string;
  /** Title of the parent chapter, shown above scenes that belong to the same day. */
  chapterTitle: string;
  chapterIndex: number;
  chapterCount: number;
  sceneIndex?: number;
  sceneCount?: number;
}

export const introCopy = {
  title: "Hát Và Nờ",
  subtitle: "Một câu chuyện về hai người cứ tưởng đã bỏ lỡ nhau.",
  hint: "Mở hộp kỷ niệm",
};

export const heroPhotos: StoryPhoto[] = [
  {
    src: "/images/story/lover/mirror-cardigan.jpg",
    alt: "Người yêu chụp selfie trước gương với áo khoác trắng",
    caption: "một tấm rất ra dáng nhân vật chính",
  },
  {
    src: "/images/story/lover/flower-peace.jpg",
    alt: "Người yêu tạo dáng peace cạnh hoa ngoài trời",
    caption: "hoa cũng phải nhường",
  },
  {
    src: "/images/story/lover/bear-smile.png",
    alt: "Người yêu cầm gấu bông nhỏ và cười nhẹ",
    caption: "gấu nhỏ, sát thương lớn",
  },
];

export const moodSetupPhotos: StoryPhoto[] = [
  {
    src: "/images/story/lover/outdoor-heart.jpg",
    alt: "Người yêu chụp ảnh ngoài trời với áo họa tiết trái tim",
    caption: "Trước khi câu chuyện bắt đầu...",
  },
  {
    src: "/images/story/lover/cap-phone.png",
    alt: "Người yêu đội mũ xanh và nhìn điện thoại",
    caption: "Có một người rất xinh nhưng chưa biết sắp bị kéo vào drama tình cảm.",
  },
  {
    src: "/images/story/lover/laughing-call.jpg",
    alt: "Người yêu cười khi đang gọi video",
    caption: "Và có một người cũng chưa biết mình sắp var phải định mệnh.",
  },
];

export const storyChapters: StoryChapter[] = [
  {
    id: "first-meeting",
    index: 1,
    year: "2023",
    title: "Khởi đầu như bao khởi đầu",
    shortTitle: "Khởi đầu",
    description:
      "Một chàng trai sinh viên năm hai và một cô gái năm ba, mang theo những mơ mộng viển vông cùng hoài bão ấp ủ sau khi ra trường.\n\nGiữa vô số cú vuốt trên Bumble, họ vô tình va phải nhau. Chỉ sau một ngày trò chuyện, câu chuyện tiếp tục trên Instagram.",
    paragraphs: [
      "Một chàng trai sinh viên năm hai và một cô gái năm ba, mang theo những mơ mộng viển vông cùng hoài bão ấp ủ sau khi ra trường.",
      "Giữa vô số cú vuốt trên Bumble, họ vô tình va phải nhau. Chỉ sau một ngày trò chuyện, câu chuyện tiếp tục trên Instagram.",
    ],
    microcopy: "một cú match nhỏ, một câu chuyện rất không nhỏ.",
    quote: "Có những khởi đầu trông rất bình thường, cho đến khi nhìn lại.",
    secretNote: {
      label: "Lật mẩu giấy đầu tiên",
      text: "Lúc đó thật ra, một cú match tưởng vu vơ lại mở ra cả một chuyện tình hài vãi nồn :))))",
    },
    secretTone: "bold",
    memoryCaption: "Mẩu đầu tiên của hộp kỷ niệm: một cú match nhỏ, một câu chuyện rất không nhỏ.",
    gallery: [
      {
        src: "/images/story/lover/polka-peace.jpg",
        alt: "Người yêu mặc áo chấm bi và tạo dáng peace",
        caption: "Cái vibe mở đầu: cute, hơi ngại, nhưng nhớ lâu.",
      },
      {
        src: "/images/story/lover/mirror-cardigan.jpg",
        alt: "Người yêu chụp selfie trước gương với áo khoác trắng",
        caption: "Một tấm để nhắc rằng câu chuyện này bắt đầu rất vui.",
      },
      {
        src: "/images/story/lover/soft-floral.jpg",
        alt: "Người yêu chụp ảnh dịu dàng trong váy họa tiết hoa",
        caption: "Hoa nền thôi, nhân vật chính ở trước.",
      },
    ],
    mood: "spark",
    accentColor: "oklch(0.67 0.12 16)",
    accent: "oklch(0.67 0.12 16)",
    image: "/images/story/lover/polka-peace.jpg",
    imageAlt: "Người yêu mặc áo chấm bi và tạo dáng peace",
    alignment: "left",
    optionalSound: "/audio/soft-notification.wav",
    visualType: "swipe",
    artifactType: "profiles",
    threadState: "meeting",
  },
  {
    id: "lost-connection",
    index: 2,
    year: "2024",
    title: "Mất kết nối",
    shortTitle: "Mất kết nối",
    description:
      "Có những giai đoạn kết nối chập chờn, mỏng manh như một sợi dây tơ hồng.\n\nHai người bỏ lỡ nhau bởi những lời hứa bị bỏ quên, những tin nhắn không được tiếp tục và những điều chưa kịp nói.\n\nThế rồi cả hai mất kết nối, chỉ còn âm thầm nhìn cuộc sống của nhau từ xa.",
    paragraphs: [
      "Có những giai đoạn kết nối chập chờn, mỏng manh như một sợi dây tơ hồng.",
      "Hai người bỏ lỡ nhau bởi những lời hứa bị bỏ quên, những tin nhắn không được tiếp tục và những điều chưa kịp nói.",
      "Thế rồi cả hai mất kết nối, chỉ còn âm thầm nhìn cuộc sống của nhau từ xa.",
    ],
    microcopy: "im lặng không phải hết nhớ.",
    quote: "Không phải cuộc trò chuyện nào dừng lại cũng thật sự kết thúc.",
    secretNote: {
      label: "Lật mẩu giấy im lặng",
      text: "Lúc đó thật ra, im lặng không phải hết nhớ, chỉ là cả hai đều không biết bắt đầu lại từ đâu.",
    },
    secretTone: "soft",
    memoryCaption: "Một trang hơi im, nhưng vẫn giữ lại những điều chưa kịp nói.",
    gallery: [
      {
        src: "/images/story/lover/pink-sweater.jpg",
        alt: "Người yêu mặc áo len hồng trong một tấm selfie dịu",
        caption: "Có những ngày chỉ cần nhìn một tấm ảnh là thấy dịu lại.",
      },
      {
        src: "/images/story/lover/leopard-hood.jpg",
        alt: "Người yêu trùm mũ họa tiết da báo và nhìn vào camera",
        caption: "Kỷ niệm mềm như gấu bông, nhưng vẫn biết làm đau tim.",
      },
      {
        src: "/images/story/lover/black-dress.jpg",
        alt: "Người yêu mặc váy đen và áo khoác trắng trong ảnh selfie",
        caption: "Một chút đáng yêu để kéo mood lên.",
      },
    ],
    mood: "quiet",
    accentColor: "oklch(0.56 0.07 238)",
    accent: "oklch(0.56 0.07 238)",
    image: "/images/story/lover/pink-sweater.jpg",
    imageAlt: "Người yêu mặc áo len hồng trong một tấm selfie dịu",
    alignment: "right",
    visualType: "disconnect",
    artifactType: "silent-chat",
    threadState: "disconnected",
  },
  {
    id: "meet-again",
    index: 3,
    year: "Cuối 2024 - đầu 2025",
    title: "Lại va vào nhau",
    shortTitle: "Lại gặp",
    description:
      "Một ngày, Facebook bất ngờ đề xuất lại người cũ.\n\nChàng trai gửi lời mời kết bạn. Cô gái đồng ý nhưng vẫn ngại trả lời tin nhắn.\n\nĐến khi cuộc trò chuyện bắt đầu, cả hai nói chuyện như thể chưa từng có quãng thời gian mất kết nối.\n\nCó thể gọi đây là màn tái ngộ của hai con người bựa nhất lịch sử nhân loại thế kỷ hai mươi mốt.",
    paragraphs: [
      "Một ngày, Facebook bất ngờ đề xuất lại người cũ.",
      "Chàng trai gửi lời mời kết bạn. Cô gái đồng ý nhưng vẫn ngại trả lời tin nhắn.",
      "Đến khi cuộc trò chuyện bắt đầu, cả hai nói chuyện như thể chưa từng có quãng thời gian mất kết nối.",
      "Có thể gọi đây là màn tái ngộ của hai con người bựa nhất lịch sử nhân loại thế kỷ hai mươi mốt.",
    ],
    microcopy: "ủa lại gặp hả?",
    quote: "Thuật toán đôi khi cũng biết viết chuyện tình.",
    secretNote: {
      label: "Lật mẩu giấy add friend",
      text: "Lúc đó thật ra, nút Add friend nhỏ xíu mà hồi hộp như gửi thư tay.",
    },
    secretTone: "spark",
    memoryCaption: "Tấm ảnh của lần va lại: thuật toán chỉ gợi ý, còn nhớ nhau là do hai người.",
    gallery: [
      {
        src: "/images/story/lover/funny-lips.jpg",
        alt: "Người yêu chụp selfie với filter môi hài hước",
        caption: "Lại gặp, lại thấy đáng yêu quá mức cần thiết.",
      },
      {
        src: "/images/story/lover/garden-peace.jpg",
        alt: "Người yêu tạo dáng peace trong không gian ngoài trời",
        caption: "Có những thứ nhìn lại là biết: ờ, vẫn còn duyên.",
      },
      {
        src: "/images/story/lover/cheek-selfie.jpg",
        alt: "Người yêu chống tay lên má trong một tấm selfie",
        caption: "Một album nhỏ cho màn tái ngộ hơi bựa.",
      },
    ],
    mood: "return",
    accentColor: "oklch(0.7 0.14 24)",
    accent: "oklch(0.7 0.14 24)",
    image: "/images/story/lover/funny-lips.jpg",
    imageAlt: "Người yêu chụp selfie với filter môi hài hước",
    alignment: "left",
    optionalSound: "/audio/typing.wav",
    visualType: "suggestion",
    artifactType: "friend-request",
    threadState: "reconnecting",
  },
  {
    id: "no-more-chance",
    index: 4,
    year: "2025",
    title: "Không còn cơ hội lần nữa",
    shortTitle: "Song song",
    description:
      "Có lẽ ông trời vẫn muốn thử thách hai người.\n\nKhi gặp lại, cả hai đều đã có những mối tình mới. Họ không thể bước về phía nhau theo cách đã từng tưởng tượng.\n\nNhưng vào những ngày cuộc sống trở nên hỗn loạn, hai người vẫn kể cho nhau nghe về những câu chuyện dở khóc dở cười của mình.\n\nNếu chỉ xét thời gian nói chuyện, có những ngày cả hai dành cho nhau tám tiếng, đều đặn chẳng khác nào đi làm.",
    paragraphs: [
      "Có lẽ ông trời vẫn muốn thử thách hai người.",
      "Khi gặp lại, cả hai đều đã có những mối tình mới. Họ không thể bước về phía nhau theo cách đã từng tưởng tượng.",
      "Nhưng vào những ngày cuộc sống trở nên hỗn loạn, hai người vẫn kể cho nhau nghe về những câu chuyện dở khóc dở cười của mình.",
      "Nếu chỉ xét thời gian nói chuyện, có những ngày cả hai dành cho nhau tám tiếng, đều đặn chẳng khác nào đi làm.",
    ],
    microcopy: "8 tiếng như đi làm",
    quote: "Không ở cạnh nhau, nhưng cũng chưa từng hoàn toàn rời khỏi cuộc đời nhau.",
    secretNote: {
      label: "Lật mẩu giấy tám tiếng",
      text: "Lúc đó thật ra, có những ngày câu chuyện tám tiếng là cách cả hai tự giữ mình đứng vững.",
    },
    secretTone: "soft",
    memoryCaption: "Một kỷ niệm không ồn ào: hai đường song song, nhưng vẫn có rất nhiều câu chuyện chung.",
    gallery: [
      {
        src: "/images/story/lover/cap-phone.png",
        alt: "Người yêu đội mũ xanh và nhìn điện thoại",
        caption: "Hoa ở cạnh, nhưng nụ cười mới là điểm chính.",
      },
      {
        src: "/images/story/lover/outfit-check.jpg",
        alt: "Một tấm chụp outfit đời thường với áo khoác nâu",
        caption: "Tám tiếng nói chuyện cũng có thể bắt đầu từ một tấm ảnh như này.",
      },
      {
        src: "/images/story/lover/playful-duo.jpg",
        alt: "Một khoảnh khắc selfie vui vẻ với filter trong cuộc gọi",
        caption: "Một chút mềm mại giữa mớ hỗn loạn.",
      },
    ],
    mood: "parallel",
    accentColor: "oklch(0.6 0.08 33)",
    accent: "oklch(0.6 0.08 33)",
    image: "/images/story/lover/cap-phone.png",
    imageAlt: "Người yêu đội mũ xanh và nhìn điện thoại",
    alignment: "right",
    visualType: "parallel",
    artifactType: "eight-hour-clock",
    threadState: "parallel",
  },
  {
    id: "turning-point",
    index: 5,
    year: "2026",
    title: "Cú xoay bánh xe lịch sử",
    shortTitle: "Ở lại",
    description:
      "Giữa cuộc khủng hoảng tuổi hai mươi tư, cô gái gần như mất hoàn toàn niềm tin vào cuộc sống.\n\nChàng trai quay lại. Lần này anh không chỉ xuất hiện, mà còn ở lại và kéo cô đi qua khoảng thời gian khó khăn nhất.\n\nĐến đây, cả hai dần hiểu vì sao những câu chuyện trước đó không thể đi đến cuối cùng.\n\nCó lẽ tất cả chỉ đang đưa họ quay trở lại đúng người, vào đúng thời điểm.",
    paragraphs: [
      "Giữa cuộc khủng hoảng tuổi hai mươi tư, cô gái gần như mất hoàn toàn niềm tin vào cuộc sống.",
      "Chàng trai quay lại. Lần này anh không chỉ xuất hiện, mà còn ở lại và kéo cô đi qua khoảng thời gian khó khăn nhất.",
      "Đến đây, cả hai dần hiểu vì sao những câu chuyện trước đó không thể đi đến cuối cùng.",
      "Có lẽ tất cả chỉ đang đưa họ đến gần hơn với lần thật sự đứng cạnh nhau.",
    ],
    microcopy: "lần này ở lại.",
    quote: "Có người xuất hiện để làm bạn vui. Có người chọn ở lại khi bạn không còn biết cách tự cứu mình.",
    secretNote: {
      label: "Lật mẩu giấy ở lại",
      text: "Lúc đó thật ra, điều quan trọng nhất không phải quay lại, mà là lần này chịu ở lại.",
    },
    secretTone: "spark",
    memoryCaption: "Trang này sáng hơn hẳn: không chỉ quay lại, mà còn chọn ở lại.",
    gallery: [
      {
        src: "/images/story/lover/bear-close.png",
        alt: "Người yêu nhắm mắt và cầm gấu bông nhỏ gần mặt",
        caption: "Một tấm ảnh rất hợp với chữ ở lại.",
      },
      {
        src: "/images/story/lover/white-mirror.jpg",
        alt: "Người yêu chụp selfie trước gương với áo trắng",
        caption: "Cuối một phần của câu chuyện nên cần một tấm ảnh nhiều hoa.",
      },
      {
        src: "/images/story/lover/plush-moments.jpg",
        alt: "Bốn khoảnh khắc người yêu chụp cùng thú bông",
        caption: "Để nhớ rằng vui vẻ cũng là một cách cứu nhau.",
      },
    ],
    mood: "warmth",
    accentColor: "oklch(0.68 0.13 14)",
    accent: "oklch(0.68 0.13 14)",
    image: "/images/story/lover/bear-close.png",
    imageAlt: "Người yêu nhắm mắt và cầm gấu bông nhỏ gần mặt",
    alignment: "left",
    optionalSound: "/audio/ambient-warm.wav",
    visualType: "wheel",
    artifactType: "open-loop",
    threadState: "staying",
  },
];

export const partTwoChapters: StoryChapter[] = [
  {
    id: "in-person-meeting",
    index: 1,
    year: "Từ khi gặp nhau",
    title: "Đi lượn cùng nhau",
    shortTitle: "Đi lượn",
    description:
      "Sau những lần xuất hiện trên màn hình, giờ là những buổi tối đi lượn cùng nhau.\n\nNgười từng ở trong những dòng tin nhắn giờ đã thật sự ở ngay bên cạnh.\n\nSau bao đêm chuyện và những cuộc gọi dài qua màn hình nhỏ, cuối cùng ngày chúng mình gặp nhau cũng đến. Lần đầu tiên đối mặt, anh chẳng thể giấu nổi cảm giác hồi hộp. Bàn tay ôm nhành hoa tươi mà run run, lòng đầy ngại ngùng và lo sợ khi đứng chờ vk trước chân tòa chung cư.\n\nThế nhưng, dường như mọi điều đẹp đẽ nhất đều đang chúc phúc cho hai đứa mình. Ấn tượng đầu tiên về em là một cô gái nhỏ nhắn, xinh xắn, mi nhon và vô cùng đáng yêu. Cảm tưởng anh như người khổng lồ khi đứng cạnh em vậy. Dù khoảnh khắc ấy anh chưa kịp nhìn rõ từng nét mặt vì chút vội vàng, nhưng khi cùng nhau vi vu lượn quanh trên phố, cảm giác thật kỳ lạ. Dù là lần đầu gặp mặt, chúng ta lại gắn kết và thấu hiểu mà chẳng ngại ngần hết như những tri kỷ đã từng duyên nợ từ muôn vàn kiếp trước.\n\nChúng mình dừng chân bên một chiếc ghế đá ven đường, thủ thỉ kể cho nhau nghe những câu chuyện vặt vãnh không tên. Rồi buổi hẹn đầu cũng khép lại bằng những cái ôm ấm áp và vô vàn nụ hôn trao nhau đầy thắm thiết. Anh nhớ nụ hôn đầu mà anh trao cho em đấy.",
    paragraphs: [
      "Sau những lần xuất hiện trên màn hình, giờ là những buổi tối đi lượn cùng nhau.",
      "Người từng ở trong những dòng tin nhắn giờ đã thật sự ở ngay bên cạnh.",
      "Sau bao đêm chuyện và những cuộc gọi dài qua màn hình nhỏ, cuối cùng ngày chúng mình gặp nhau cũng đến. Lần đầu tiên đối mặt, anh chẳng thể giấu nổi cảm giác hồi hộp. Bàn tay ôm nhành hoa tươi mà run run, lòng đầy ngại ngùng và lo sợ khi đứng chờ vk trước chân tòa chung cư.",
      "Thế nhưng, dường như mọi điều đẹp đẽ nhất đều đang chúc phúc cho hai đứa mình. Ấn tượng đầu tiên về em là một cô gái nhỏ nhắn, xinh xắn, mi nhon và vô cùng đáng yêu. Cảm tưởng anh như người khổng lồ khi đứng cạnh em vậy. Dù khoảnh khắc ấy anh chưa kịp nhìn rõ từng nét mặt vì chút vội vàng, nhưng khi cùng nhau vi vu lượn quanh trên phố, cảm giác thật kỳ lạ. Dù là lần đầu gặp mặt, chúng ta lại gắn kết và thấu hiểu mà chẳng ngại ngần hết ==như những tri kỷ đã từng duyên nợ từ muôn vàn kiếp trước==.",
      "Chúng mình dừng chân bên một chiếc ghế đá ven đường, thủ thỉ kể cho nhau nghe những câu chuyện vặt vãnh không tên. Rồi buổi hẹn đầu cũng khép lại bằng những cái ôm ấm áp và vô vàn nụ hôn trao nhau đầy thắm thiết. ==Anh nhớ nụ hôn đầu mà anh trao cho em đấy.==",
    ],
    microcopy: "lần này, không còn qua màn hình.",
    quote: "Từ một khung chat, câu chuyện bước ra ngoài đời thật.",
    secretTone: "spark",
    memoryCaption: "Bó hoa hồng của buổi gặp đầu, còn nằm nguyên trên xe trước khi trao cho em.",
    gallery: [
      {
        src: "/images/story/part-two/first-meeting-roses.jpg",
        alt: "Hộp hoa hồng đỏ đặt trên yên xe máy trong buổi tối gặp nhau lần đầu",
        caption: "Bó hoa run run trong tay anh trước chân tòa chung cư.",
      },
      {
        src: "/images/story/part-two/first-meeting-ride.jpg",
        alt: "Tay lái xe máy với bó hoa hồng đỏ phía trước, trên đường đi đón em",
        caption: "Trên đường đi đón em, tim đập nhanh hơn cả tốc độ xe.",
      },
    ],
    mood: "daylight",
    accentColor: "#B6C7DD",
    accent: "#B6C7DD",
    image: "/images/story/part-two/first-meeting-roses.jpg",
    imageAlt: "Hộp hoa hồng đỏ đặt trên yên xe máy trong buổi tối gặp nhau lần đầu",
    alignment: "left",
    visualType: "in-person",
    artifactType: "pair-frame",
    threadState: "in-person",
  },
  {
    id: "our-dates",
    index: 2,
    year: "Những ngày có nhau",
    title: "Hai cốc Mixue và bốn giờ bên nhau",
    shortTitle: "Mixue",
    description:
      "Anh vẫn không thể tin được rằng chỉ với hai cốc Mixue, chúng mình lại có thể ngồi bên nhau suốt bốn tiếng, cho đến tận một giờ sáng.\n\nKhông có một kế hoạch đặc biệt nào. Không có điều gì quá lớn lao xảy ra. Chỉ là chúng mình ngồi cạnh nhau, nói hết chuyện này đến chuyện khác (thật ra là 80% là hun nhau hêhhe), rồi để thời gian lặng lẽ trôi qua lúc nào chẳng hay.\n\nĐó là lần đầu tiên anh có thể ngồi với một người lâu đến như vậy mà không thấy mệt mỏi hay muốn rời đi.\n\nCó lẽ bởi vì người bên cạnh anh là em.",
    paragraphs: [
      "Anh vẫn không thể tin được rằng chỉ với hai cốc Mixue, chúng mình lại có thể ngồi bên nhau suốt bốn tiếng, cho đến tận một giờ sáng.",
      "Không có một kế hoạch đặc biệt nào. Không có điều gì quá lớn lao xảy ra. Chỉ là chúng mình ngồi cạnh nhau, nói hết chuyện này đến chuyện khác (thật ra là 80% là hun nhau hêhhe), rồi để thời gian lặng lẽ trôi qua lúc nào chẳng hay.",
      "Đó là lần đầu tiên anh có thể ngồi với một người lâu đến như vậy mà không thấy mệt mỏi hay muốn rời đi.",
      "==Có lẽ bởi vì người bên cạnh anh là em.==",
    ],
    microcopy: "hai cốc Mixue, bốn tiếng, một giờ sáng.",
    quote: "Không cần gì lớn lao. Chỉ cần người ngồi cạnh là em.",
    secretTone: "soft",
    memoryCaption: "Buổi tối hai cốc Mixue, kéo dài tới tận một giờ sáng.",
    gallery: [
      {
        src: "/images/story/part-two/mixue-night.jpg",
        alt: "Hai người chụp cận cảnh trong đêm, bên bông hướng dương và chú gấu bông",
        caption: "Bông hướng dương, chú gấu bông và một buổi tối rất dài.",
      },
    ],
    mood: "daylight",
    accentColor: "#8BCBD8",
    accent: "#8BCBD8",
    image: "/images/story/part-two/mixue-night.jpg",
    imageAlt: "Hai người chụp cận cảnh trong đêm, bên bông hướng dương và chú gấu bông",
    alignment: "right",
    visualType: "dates",
    artifactType: "date-card",
    threadState: "dating",
  },
  {
    id: "most-comfortable-day",
    index: 3,
    year: "Gần đây",
    title: "Ai mà chả có rất nhiều lần đầu tiên",
    shortTitle: "Rất nhiều lần đầu tiên",
    description: "Một ngày đi từ thủy cung, qua café Hồ Tây, rồi cùng nhau ngắm hoàng hôn.",
    paragraphs: ["Một ngày đi từ thủy cung, qua café Hồ Tây, rồi cùng nhau ngắm hoàng hôn."],
    microcopy: "ba điểm dừng, rất nhiều lần đầu tiên.",
    quote: "Ai mà chả có rất nhiều lần đầu tiên.",
    secretTone: "spark",
    memoryCaption: "Một ngày liền mạch, từ sắc xanh dưới nước đến ánh hoàng hôn.",
    gallery: [],
    mood: "sunset",
    accentColor: "#D8BACF",
    accent: "#D8BACF",
    image: "",
    imageAlt: "Vị trí chờ ảnh của ngày đi thủy cung, café và ngắm hoàng hôn",
    imageNote: "Thêm ảnh đại diện cho cả ngày tại đây.",
    alignment: "left",
    visualType: "sunset",
    artifactType: "sunset-photo",
    threadState: "sunset",
    scenes: [
      {
        id: "aquarium",
        sceneIndex: 1,
        year: "Điểm dừng 01",
        title: "Thủy cung",
        shortTitle: "Thủy cung",
        description: "Với thời khắc này, phải nói là trọn vẹn 1 buổi sáng cuối tuần đối với em, về tất cả mọi thứ. Tuy tiết trời hơi nóng nực một chút, nhưng không gian, thời gian và cái người đàn ông đi bên cạnh em, khiến em cảm thấy dịu nhẹ và ấm áp, như chợt đổ đông giữa mùa hè ấy =)))))\n\nThú thật là em rất hay ngượng ngùng, nhưng đi với anh như kiểu bắt trúng tần số ấy, k biết ngại là gì mà thật ra mình toàn làm mấy cái rất là sến giữa đám đông, em nghĩ lại mà đôi khi cũng cười tủm tỉm =)))) vô tư thật, tình yêu khiến 2 người xa lạ kết nối thành 1 như thế ấy, đôi lúc em vẫn không tin mình có ngày hôm nay.\n\nCòn cảnh thủy cung, em không còn gì để bàn, quá là đẹp i, nó thơ nó cổ tích nó xanh mướt mà nó xuân hoàng vl raaa. Outfit của chúng ta ngày hôm ấy đi kèm bó hoa nó lại cũng là hợp đét nữa.\n\nEm thích mấy khúc mình bàn luận về bầy cá hài hước, mình như 2 đứa trẻ được đi xem hàng zậy, cute lắm. Cảm ơn anh vì đã dẫn em tới thủy cung, iu anh nhắmm!",
        paragraphs: [
          "Với thời khắc này, phải nói là trọn vẹn 1 buổi sáng cuối tuần đối với em, về tất cả mọi thứ. Tuy tiết trời hơi nóng nực một chút, nhưng không gian, thời gian và cái người đàn ông đi bên cạnh em, khiến em cảm thấy dịu nhẹ và ấm áp, như chợt đổ đông giữa mùa hè ấy =)))))",
          "Thú thật là em rất hay ngượng ngùng, nhưng đi với anh như kiểu bắt trúng tần số ấy, k biết ngại là gì mà thật ra mình toàn làm mấy cái rất là sến giữa đám đông, em nghĩ lại mà đôi khi cũng cười tủm tỉm =)))) vô tư thật, tình yêu khiến 2 người xa lạ kết nối thành 1 như thế ấy, đôi lúc em vẫn không tin mình có ngày hôm nay.",
          "Còn cảnh thủy cung, em không còn gì để bàn, quá là đẹp i, nó thơ nó cổ tích nó xanh mướt mà nó xuân hoàng vl raaa. Outfit của chúng ta ngày hôm ấy đi kèm bó hoa nó lại cũng là hợp đét nữa.",
          "Em thích mấy khúc mình bàn luận về bầy cá hài hước, mình như 2 đứa trẻ được đi xem hàng zậy, cute lắm. ==Cảm ơn anh vì đã dẫn em tới thủy cung, iu anh nhắmm!==",
        ],
        microcopy: "nó thơ, nó cổ tích, nó xanh mướt.",
        quote: "Như hai đứa trẻ được đi xem hàng.",
        secretTone: "soft",
        memoryCaption: "Buổi sáng cuối tuần trọn vẹn, giữa sắc xanh của thủy cung.",
        gallery: [
          {
            src: "/images/story/part-two/aquarium-couple.jpg",
            alt: "Hai người đứng cạnh nhau trước ô kính lớn của thủy cung",
            caption: "Hai đứa đứng lặng trước ô kính xanh mướt.",
          },
          {
            src: "/images/story/part-two/aquarium-jellyfish.jpg",
            alt: "Khoảnh khắc của hai người bên bức tường sứa phát sáng cùng bó hoa",
            caption: "Bức tường sứa và bó hoa của buổi sáng hôm ấy.",
          },
          {
            src: "/images/story/part-two/aquarium-funny-fish.jpg",
            alt: "Chú cá màu cam với gương mặt ngộ nghĩnh sát ô kính",
            caption: "Bầy cá hài hước mà hai đứa bàn luận mãi.",
          },
          {
            src: "/images/story/part-two/aquarium-big-tank.jpg",
            alt: "Ô kính khổng lồ của thủy cung với đàn cá bơi phía sau",
            caption: "Ô kính khổng lồ, cả hai như hai đứa trẻ đi xem hàng.",
          },
        ],
        mood: "aqua",
        accentColor: "#67D9ED",
        accent: "#67D9ED",
        image: "/images/story/part-two/aquarium-couple.jpg",
        imageAlt: "Hai người đứng cạnh nhau trước ô kính lớn của thủy cung",
        alignment: "left",
        visualType: "aquarium",
        artifactType: "aquarium-ticket",
        threadState: "aquarium",
      },
      {
        id: "cafe",
        sceneIndex: 2,
        year: "Điểm dừng 02",
        title: "Café Hồ Tây",
        shortTitle: "Café Hồ Tây",
        description: "Hmmm, gọi là như nào nhỉ, chúng ta không có nhiều hoạt động ở khúc này, ngoài ôm nhau và hôn. Chắc em sẽ nhớ mãi quá tại vì lần đầu tiên đi tới quán cafe mà em bị nhân viên nhắc nhở là giữ ý tứ lun í =))))) nhưng mà chỉ ngại lúc đó thôi, sau hình như vì có anh, em chả cần biết xung quanh có bố con thằng nào nữa.\n\nCó lẽ cái ngốc của lứa đôi cũng chỉ đến thế. Chỉ cần hôm nay được bên người, được thấy anh cười, xoa dịu và âu yếm, hai kẻ ngốc cứ vậy mà tựa vào nhau. Thế gian dẫu có bao nhiêu đổi dời, cũng chẳng hề hấn gì.",
        paragraphs: [
          "Hmmm, gọi là như nào nhỉ, chúng ta không có nhiều hoạt động ở khúc này, ngoài ôm nhau và hôn. Chắc em sẽ nhớ mãi quá tại vì lần đầu tiên đi tới quán cafe mà em bị nhân viên nhắc nhở là giữ ý tứ lun í =))))) nhưng mà chỉ ngại lúc đó thôi, sau hình như vì có anh, em chả cần biết xung quanh có bố con thằng nào nữa.",
          "Có lẽ cái ngốc của lứa đôi cũng chỉ đến thế. Chỉ cần hôm nay được bên người, được thấy anh cười, xoa dịu và âu yếm, hai kẻ ngốc cứ vậy mà tựa vào nhau. ==Thế gian dẫu có bao nhiêu đổi dời, cũng chẳng hề hấn gì.==",
        ],
        microcopy: "hai kẻ ngốc tựa vào nhau.",
        quote: "Chỉ cần hôm nay được bên người.",
        secretTone: "soft",
        memoryCaption: "Không có tấm ảnh nào ở điểm dừng này, chỉ có tờ hoá đơn của quán.",
        gallery: [],
        mood: "cafe",
        accentColor: "#DCC9AD",
        accent: "#DCC9AD",
        image: "",
        imageAlt: "Vị trí chờ ảnh ở café",
        imageNote: "Thêm ảnh ở café tại đây.",
        alignment: "right",
        visualType: "cafe",
        artifactType: "cafe-cup",
        threadState: "cafe",
      },
      {
        id: "sunset",
        sceneIndex: 3,
        year: "Điểm dừng 03",
        title: "Ngắm hoàng hôn",
        shortTitle: "Hoàng hôn",
        description: "Anh nói mình đã bị em lấy đi rất nhiều lần đầu, nhưng có vẻ như chính em cũng cảm nhận được từ phía mình như thế. Lần đầu em có 1 buổi ngắm hoàng hôn đúng giờ mà không cần hẹn trước, kéo dài không lâu nhưng em cảm giác thật hạnh phúc vì được ngắm cùng anh.\n\nHoàng hôn buồn cái gì chứ =))) vui muốn chớt, đẹp nao lòng. Đó không chắc là buổi chiều hoàng hôn đẹp nhất, nhưng đó là lần đầu tiên em được ngắm cùng với người yêu đấy, đơn giản mà đáng nhớ vô cùng.\n\nCảm ơn anh, đã lên lịch cho một ngày cuối tuần bình yên và trọn vẹn với chúng mình đến vậy. Yêu ơi của em, em yêu người rất nhiềuuuuu.",
        paragraphs: [
          "Anh nói mình đã bị em lấy đi rất nhiều lần đầu, nhưng có vẻ như chính em cũng cảm nhận được từ phía mình như thế. Lần đầu em có 1 buổi ngắm hoàng hôn đúng giờ mà không cần hẹn trước, kéo dài không lâu nhưng em cảm giác thật hạnh phúc vì được ngắm cùng anh.",
          "Hoàng hôn buồn cái gì chứ =))) vui muốn chớt, đẹp nao lòng. Đó không chắc là buổi chiều hoàng hôn đẹp nhất, nhưng đó là lần đầu tiên em được ngắm cùng với người yêu đấy, đơn giản mà đáng nhớ vô cùng.",
          "Cảm ơn anh, đã lên lịch cho một ngày cuối tuần bình yên và trọn vẹn với chúng mình đến vậy. ==Yêu ơi của em, em yêu người rất nhiềuuuuu.==",
        ],
        microcopy: "hoàng hôn đúng giờ, không cần hẹn trước.",
        quote: "Đơn giản mà đáng nhớ vô cùng.",
        secretTone: "spark",
        memoryCaption: "Buổi hoàng hôn đầu tiên được ngắm cùng người yêu.",
        gallery: [
          {
            src: "/images/story/part-two/sunset-westlake.jpg",
            alt: "Mặt trời lặn xuống mặt hồ, ánh nắng vàng cam trải dài trên nước",
            caption: "Hoàng hôn đúng giờ, không cần hẹn trước.",
          },
        ],
        mood: "sunset",
        accentColor: "#D8BACF",
        accent: "#D8BACF",
        image: "/images/story/part-two/sunset-westlake.jpg",
        imageAlt: "Mặt trời lặn xuống mặt hồ, ánh nắng vàng cam trải dài trên nước",
        alignment: "left",
        visualType: "sunset",
        artifactType: "sunset-photo",
        threadState: "sunset",
      },
    ],
  },
];

/**
 * Part III, in Ngọc's words: the autumn after the aquarium day, as she wrote it in three pieces. "Hoàng và Ngọc ơi" (8 to
 * 13 September) is chapters 1 to 4; "Không phải giai đoạn mới yêu nào cũng suôn sẻ" (15 to 19 September) is chapter 5,
 * and "Sinh nhật Hoàng iu" (23 September to his birthday on 1 October, which she leaves for him to write) is chapter 6.
 * The notes she left for whoever builds the page ("chèn thêm ảnh…", "ko chèn thêm gì…") became captions and the details
 * of each scene, or stayed out where they asked for nothing to be shown.
 */
export const partThreeChapters: StoryChapter[] = [
  {
    id: "first-homestay",
    index: 1,
    year: "08.09.2026",
    title: "Chiếc home cho buổi tối đầu tiên",
    shortTitle: "Homestay",
    description:
      "Sau chuyến đi thủy cung ngắm hoàng hôn lãng mạn, trọn vẹn 1 ngày cuối tuần đẹp trời của ngày đầu tháng 9, mình có hẹn đi ăn tối ở Hà Đông, món nào em cũng ko nhớ nữa, và sau đó chúng ta đã đặt homestay, chiếc home cho buổi tối đầu tiên, chính xác là sau hôm thủy cung 2 ngày thui ạ.\n\nHôm í chúng mình đã chọn phim, bộ phim chúng ta muốn xem là Me Before You, tuy nhiên vì 1 lí do nào đó mà không tìm được, mình đành xem 365days, ôi và chúng ta cũng không có xem được phim này, vì điều gì anh nhỉ =))))) có thể là chỉ thuyền mới hiểu được biển lúc này thoiii.\n\nHôm đó, mình rời hôm sau 23h đêm, khá trọn vẹn 1 buổi tối nằm bên nhau mặc dù cũng không nói chuyện được nhiều, ngoại trừ tiếng yêu thì lúc nào cũng sến sẩm vlllll.",
    paragraphs: [
      "Sau chuyến đi thủy cung ngắm hoàng hôn lãng mạn, trọn vẹn 1 ngày cuối tuần đẹp trời của ngày đầu tháng 9, mình có hẹn đi ăn tối ở Hà Đông, món nào em cũng ko nhớ nữa, và sau đó chúng ta đã đặt homestay, chiếc home cho buổi tối đầu tiên, chính xác là sau hôm thủy cung 2 ngày thui ạ.",
      "Hôm í chúng mình đã chọn phim, bộ phim chúng ta muốn xem là Me Before You, tuy nhiên vì 1 lí do nào đó mà không tìm được, mình đành xem 365days, ôi và chúng ta cũng không có xem được phim này, vì điều gì anh nhỉ =))))) có thể là chỉ thuyền mới hiểu được biển lúc này thoiii.",
      "Hôm đó, mình rời hôm sau 23h đêm, ==khá trọn vẹn 1 buổi tối nằm bên nhau== mặc dù cũng không nói chuyện được nhiều, ngoại trừ tiếng yêu thì lúc nào cũng sến sẩm vlllll.",
    ],
    microcopy: "chọn hai bộ phim, xem được không bộ nào.",
    quote: "Chỉ thuyền mới hiểu được biển.",
    secretTone: "spark",
    memoryCaption: "Ảnh hoang dã: nền đỏ, nhạc The Weeknd.",
    gallery: [
      {
        src: "/images/story/part-three/homestay-red-room.jpg",
        alt: "Căn phòng homestay chìm trong ánh đèn đỏ, máy chiếu đang chạy lời một bài hát của The Weeknd",
        caption: "Ảnh hoang dã: nền đỏ, nhạc The Weeknd.",
      },
    ],
    mood: "velvet",
    accentColor: "#F2899A",
    accent: "#F2899A",
    image: "/images/story/part-three/homestay-red-room.jpg",
    imageAlt: "Căn phòng homestay chìm trong ánh đèn đỏ, máy chiếu đang chạy lời một bài hát của The Weeknd",
    alignment: "left",
    visualType: "homestay",
    artifactType: "movie-night",
    threadState: "homestay",
  },
  {
    id: "loving-more",
    index: 2,
    year: "10.09.2026",
    title: "Yêu lại càng yêu nhiều hơn",
    shortTitle: "Bi & Bơ",
    description:
      "Mình yêu lại càng yêu nhiều hơn, và cũng chẳng tránh khỏi những lúc không ở cạnh và dỗi nhau suốt ngày, đôi khi chỉ là những chuyện vụn vặt ít quan tâm để ý đến nhau hơn.\n\nEm đã rủ Hoàng tải chiếc app Inlove, set ngày chúng mình bắt đầu rơi vào tình iu với nhao, con số cụ thể tới hôm nay cũng gần 200 ngày, tương đương với thời gian mình iu nhau cũng gần nửa năm gòi, nhanh thí không bít nữa.\n\nAnh tìm kiếm ở đâu và cũng rủ em tải chiếc app Widgetable, nơi mình giãi bày cảm xúc qua những thứ đáng yêu mà chỉ 2 mình biết, ngoài ra mình còn nuôi Bi với Bơ, với tên gọi rất đỗi đời thường =))) Bố Hoàng + Mẹ Ngọc.\n\nNgày nào mình cũng vào chăm dù rảnh hay bận, như 1 trách nhiệm ko tên, chúng mình coi đó là đứa con tinh thần của nhau, cùng nuôi dưỡng và phát triển mối quan hệ đường dài, em thực sự rất iu và trân trọng điều đó ạ.",
    paragraphs: [
      "Mình yêu lại càng yêu nhiều hơn, và cũng chẳng tránh khỏi những lúc không ở cạnh và dỗi nhau suốt ngày, đôi khi chỉ là những chuyện vụn vặt ít quan tâm để ý đến nhau hơn.",
      "Em đã rủ Hoàng tải chiếc app Inlove, set ngày chúng mình bắt đầu rơi vào tình iu với nhao, con số cụ thể tới hôm nay cũng gần 200 ngày, tương đương với thời gian mình iu nhau cũng gần nửa năm gòi, nhanh thí không bít nữa.",
      "Anh tìm kiếm ở đâu và cũng rủ em tải chiếc app Widgetable, nơi mình giãi bày cảm xúc qua những thứ đáng yêu mà chỉ 2 mình biết, ngoài ra mình còn nuôi Bi với Bơ, với tên gọi rất đỗi đời thường =))) Bố Hoàng + Mẹ Ngọc.",
      "Ngày nào mình cũng vào chăm dù rảnh hay bận, như 1 trách nhiệm ko tên, chúng mình coi đó là đứa con tinh thần của nhau, cùng nuôi dưỡng và phát triển mối quan hệ đường dài, ==em thực sự rất iu và trân trọng điều đó ạ==.",
    ],
    microcopy: "ngày nào cũng vào chăm Bi với Bơ.",
    quote: "Như 1 trách nhiệm ko tên.",
    secretTone: "soft",
    memoryCaption: "0 năm 4 tháng 2 tuần 3 ngày, tính từ 24/4/26.",
    gallery: [
      {
        src: "/images/story/part-three/inlove-counter.jpg",
        alt: "Ảnh chụp màn hình app Inlove: 0 năm 4 tháng 2 tuần 3 ngày kể từ 24/4/26, cùng hai ảnh đại diện hngoc và a iu",
        caption: "0 năm 4 tháng 2 tuần 3 ngày, tính từ 24/4/26.",
      },
    ],
    mood: "screen",
    accentColor: "#C8AAF2",
    accent: "#C8AAF2",
    image: "/images/story/part-three/inlove-counter.jpg",
    imageAlt: "Ảnh chụp màn hình app Inlove: 0 năm 4 tháng 2 tuần 3 ngày kể từ 24/4/26, cùng hai ảnh đại diện hngoc và a iu",
    alignment: "right",
    visualType: "apps",
    artifactType: "love-counter",
    threadState: "apps",
  },
  {
    id: "hoang-mai-afternoon",
    index: 3,
    year: "12.09.2026",
    title: "Một buổi chiều ở Hoàng Mai",
    shortTitle: "Hoàng Mai",
    description:
      "1 buổi chiều ở Hoàng Mai, cụ thể là công ty Ngọc =)))) có những chiếc bánh ngọt và nước trái cây siêu ngon Hoàng đem tới, hôm í anh đi qua nhà đứa bạn nên tiện ghé công ty để thăm ẻm.\n\nBánh ngọt được chụp lại khi ngồi ở ghế đá hôn nhau vài phút, xong có quầy hàng bà bán bên cạnh nên phải rời đi, kèm theo cheap moment ở chiếc xe ô tô đỏ 2 đứa ríu rít ăn uống nch và hôn nhau =)))) cứ thế thôi.\n\nThời điểm này tuy ngắn chỉ vỏn vẹn đâu đó tiếng đồng hồ nhưng mà siu đáng iu đáng nhớ, nó tình iu tuổi trẻ mà nó lén lút mà nó lãng mạn.",
    paragraphs: [
      "1 buổi chiều ở Hoàng Mai, cụ thể là công ty Ngọc =)))) có những chiếc bánh ngọt và nước trái cây siêu ngon Hoàng đem tới, hôm í anh đi qua nhà đứa bạn nên tiện ghé công ty để thăm ẻm.",
      "Bánh ngọt được chụp lại khi ngồi ở ghế đá hôn nhau vài phút, xong có quầy hàng bà bán bên cạnh nên phải rời đi, kèm theo cheap moment ở chiếc xe ô tô đỏ 2 đứa ríu rít ăn uống nch và hôn nhau =)))) cứ thế thôi.",
      "Thời điểm này tuy ngắn chỉ vỏn vẹn đâu đó tiếng đồng hồ nhưng mà siu đáng iu đáng nhớ, ==nó tình iu tuổi trẻ mà nó lén lút mà nó lãng mạn==.",
    ],
    microcopy: "vài phút ở ghế đá, rồi phải rời đi.",
    quote: "Tuy ngắn, nhưng siu đáng iu đáng nhớ.",
    secretTone: "spark",
    memoryCaption: "Bánh ngọt với nước trái cây, chụp lại trên chiếc ghế đá.",
    gallery: [
      {
        src: "/images/story/part-three/hoang-mai-cakes.jpg",
        alt: "Bánh muffin, bánh ngọt và cốc trà trái cây đặt trên ghế đá, nhãn cốc ghi ngày 12/09/2026",
        caption: "Bánh ngọt với nước trái cây, chụp lại trên chiếc ghế đá.",
      },
      {
        src: "/images/story/part-three/red-car-reflection-two.jpg",
        alt: "Hai người ngồi tựa vào nhau, phản chiếu trên cửa một chiếc ô tô màu đỏ",
        caption: "Cheap moment ở chiếc xe ô tô đỏ.",
      },
      {
        src: "/images/story/part-three/red-car-reflection.jpg",
        alt: "Hình phản chiếu của hai người trên thân chiếc xe đỏ bóng loáng",
        caption: "Ríu rít ăn uống, nói chuyện và hôn nhau.",
      },
    ],
    mood: "afternoon",
    accentColor: "#F2B867",
    accent: "#F2B867",
    image: "/images/story/part-three/hoang-mai-cakes.jpg",
    imageAlt: "Bánh muffin, bánh ngọt và cốc trà trái cây đặt trên ghế đá, nhãn cốc ghi ngày 12/09/2026",
    alignment: "left",
    visualType: "office",
    artifactType: "cake-box",
    threadState: "office",
  },
  {
    id: "ba-dinh-day",
    index: 4,
    year: "13.09.2026",
    title: "Ngọc Hoàng đi thăm Lăng Bác",
    shortTitle: "Lăng Bác",
    description: "Một ngày ở Ba Đình: Lăng Bác, chùa Một Cột, một cơn mưa trưa, bát bún riêu và mây chiều.",
    paragraphs: ["Một ngày ở Ba Đình: Lăng Bác, chùa Một Cột, một cơn mưa trưa, bát bún riêu và mây chiều."],
    microcopy: "một ngày, toàn là những lần đầu.",
    quote: "Toàn là những lần đầu với nhau thui.",
    secretTone: "spark",
    memoryCaption: "Một ngày ở Ba Đình, từ nắng đẹp đến mây chiều.",
    gallery: [],
    mood: "heritage",
    accentColor: "#F2D27C",
    accent: "#F2D27C",
    image: "",
    imageAlt: "Một ngày ở Lăng Bác, chùa Một Cột và phố Triệu Việt Vương",
    alignment: "right",
    visualType: "museum",
    artifactType: "museum-visit",
    threadState: "museum",
    scenes: [
      {
        id: "lang-bac",
        sceneIndex: 1,
        year: "Điểm dừng 01",
        title: "Lăng Bác",
        shortTitle: "Lăng Bác",
        description: "Ngọc Hoàng đi thăm Lăng Bác =))))) Eo ơi phải nói là cái thời tiết nó siêu siêu mê, nếu mà mình được tham quan cả vào lăng và hết các cửa nữa thì peak quá huhuu.\n\nMà thui ko sao, chúng ta được ngắm bảo tàng Hồ Chí Minh.",
        paragraphs: [
          "Ngọc Hoàng đi thăm Lăng Bác =))))) Eo ơi phải nói là ==cái thời tiết nó siêu siêu mê==, nếu mà mình được tham quan cả vào lăng và hết các cửa nữa thì peak quá huhuu.",
          "Mà thui ko sao, chúng ta được ngắm bảo tàng Hồ Chí Minh.",
        ],
        microcopy: "bức nắm tay có nail của em.",
        quote: "Mà thui ko sao.",
        secretTone: "soft",
        memoryCaption: "Bức nắm tay có nail của em ở lăng Bác.",
        gallery: [
          {
            src: "/images/story/part-three/holding-hands.jpg",
            alt: "Hai bàn tay đan vào nhau, bộ nail trắng của em trên nền đá",
            caption: "Bức nắm tay có nail của em ở lăng Bác.",
          },
          {
            src: "/images/story/part-three/museum-flag.jpg",
            alt: "Bảo tàng Hồ Chí Minh nhìn từ quảng trường, lá cờ đỏ bay trước tòa nhà trắng",
            caption: "Bảo tàng Hồ Chí Minh, trời đẹp siêu siêu mê.",
          },
          {
            src: "/images/story/part-three/museum-entrance.jpg",
            alt: "Lối vào Bảo tàng Hồ Chí Minh với hàng chữ trên mặt tiền",
            caption: "Trước cửa bảo tàng.",
          },
          {
            src: "/images/story/part-three/museum-stairs.jpg",
            alt: "Cầu thang lớn bên trong Bảo tàng Hồ Chí Minh, dưới chùm đèn trần",
            caption: "Bên trong bảo tàng.",
          },
          {
            src: "/images/story/part-three/museum-tree.jpg",
            alt: "Bảo tàng Hồ Chí Minh nhìn qua tán cây lớn, mây trắng phía trên",
            caption: "Cây xanh, mây trắng và bảo tàng.",
          },
        ],
        mood: "heritage",
        accentColor: "#F2D27C",
        accent: "#F2D27C",
        image: "/images/story/part-three/holding-hands.jpg",
        imageAlt: "Hai bàn tay đan vào nhau, bộ nail trắng của em trên nền đá",
        alignment: "right",
        visualType: "museum",
        artifactType: "museum-visit",
        threadState: "museum",
      },
      {
        id: "chua-mot-cot",
        sceneIndex: 2,
        year: "Điểm dừng 02",
        title: "Chùa Một Cột",
        shortTitle: "Chùa Một Cột",
        description: "Được vào chùa khấn vái, lễ lộc nhỏ, và cùng ước nguyện, toàn là những lần đầu với nhau thui, sao mà không nhớ cho được.",
        paragraphs: [
          "Được vào chùa khấn vái, lễ lộc nhỏ, và ==cùng ước nguyện==, toàn là những lần đầu với nhau thui, sao mà không nhớ cho được.",
        ],
        microcopy: "khấn vái, lễ lộc nhỏ, cùng ước nguyện.",
        quote: "Sao mà không nhớ cho được.",
        secretTone: "soft",
        memoryCaption: "Chùa Một Cột, lần đầu cùng nhau khấn vái.",
        gallery: [
          {
            src: "/images/story/part-three/one-pillar-pagoda.jpg",
            alt: "Chùa Một Cột giữa hồ sen, tán cây xanh bao quanh",
            caption: "Chùa Một Cột, lần đầu cùng nhau khấn vái.",
          },
          {
            src: "/images/story/part-three/one-pillar-pagoda-flags.jpg",
            alt: "Chùa Một Cột với những dây cờ Phật giáo căng ngang trời",
            caption: "Cờ bay ngang trời, hai đứa cùng ước nguyện.",
          },
          {
            src: "/images/story/part-three/lotus-pond.jpg",
            alt: "Hồ sen bên chùa, lá sen xanh và vài bông sen hồng",
            caption: "Hồ sen bên chùa.",
          },
        ],
        mood: "lotus",
        accentColor: "#9FD6B8",
        accent: "#9FD6B8",
        image: "/images/story/part-three/one-pillar-pagoda.jpg",
        imageAlt: "Chùa Một Cột giữa hồ sen, tán cây xanh bao quanh",
        alignment: "left",
        visualType: "pagoda",
        artifactType: "wish",
        threadState: "pagoda",
      },
      {
        id: "rain-and-dusk",
        sceneIndex: 3,
        year: "Điểm dừng 03",
        title: "Mưa trưa, mây chiều",
        shortTitle: "Mưa & chiều tà",
        description: "Ỏ và xong hồi trưa trời mưaaa, chúng ta đi đâu e chả bít đâu, chỉ bít là em đem theo bộ hoa đỏ đầm ngủ hahaha.\n\nKết thúc 1 ngày anh lại đưa em về nhà, mây trôi chiều tà, vì sợ mng gank nên ta không kịp ăn tối cùng nhau nhưng khép lại ngày hôm đó cũng thật tuyệt, cảm nhận “lần đầu” của anh, chắc Xuân Hoàng cũm tự hỉu ạaa.",
        paragraphs: [
          "Ỏ và xong hồi trưa trời mưaaa, chúng ta đi đâu e chả bít đâu, chỉ bít là em đem theo bộ hoa đỏ đầm ngủ hahaha.",
          "Kết thúc 1 ngày anh lại đưa em về nhà, mây trôi chiều tà, vì sợ mng gank nên ta không kịp ăn tối cùng nhau nhưng khép lại ngày hôm đó cũng thật tuyệt, ==cảm nhận “lần đầu” của anh, chắc Xuân Hoàng cũm tự hỉu ạaa==.",
        ],
        microcopy: "em đem theo bộ hoa đỏ đầm ngủ hahaha.",
        quote: "Khép lại ngày hôm đó cũng thật tuyệt.",
        secretTone: "spark",
        memoryCaption: "Bát bún riêu Triệu Việt Vương, ngon cho nó Hà Lội =)))))",
        gallery: [
          {
            src: "/images/story/part-three/bun-rieu.jpg",
            alt: "Hai bát bún riêu đầy đồ ăn kèm, đĩa quẩy và hai cốc trà đá trên bàn",
            caption: "Bát bún riêu Triệu Việt Vương, ngon cho nó Hà Lội =)))))",
          },
        ],
        mood: "rain",
        accentColor: "#F2A98E",
        accent: "#F2A98E",
        image: "/images/story/part-three/bun-rieu.jpg",
        imageAlt: "Hai bát bún riêu đầy đồ ăn kèm, đĩa quẩy và hai cốc trà đá trên bàn",
        alignment: "right",
        visualType: "rain",
        artifactType: "rain-bowl",
        threadState: "rain",
      },
    ],
  },
  {
    id: "rough-patch",
    index: 5,
    year: "15.09.2026",
    title: "Không phải giai đoạn mới yêu nào cũng suôn sẻ",
    shortTitle: "Chân đau",
    description: "Một cơn mưa, cái chân đau, phòng khám Hồng Ngọc, 59A Yên Bình, cf Văn Quán, Tiny cf và Cúc cu.",
    paragraphs: ["Một cơn mưa, cái chân đau, phòng khám Hồng Ngọc, 59A Yên Bình, cf Văn Quán, Tiny cf và Cúc cu."],
    microcopy: "cãi nhau, mưa, cái chân đau, mà vẫn bên nhau.",
    quote: "Đã đi là phải đi, hong có delay.",
    secretTone: "bold",
    memoryCaption: "Những ngày giữa tháng 9, mưa và cái chân đau.",
    gallery: [],
    mood: "neon",
    accentColor: "#FF5D7E",
    accent: "#FF5D7E",
    image: "",
    imageAlt: "Những ngày giữa tháng 9: đi hát dưới mưa, phòng khám, cf Văn Quán, Tiny cf và Cúc cu",
    alignment: "left",
    visualType: "karaoke",
    artifactType: "karaoke-mic",
    threadState: "karaoke",
    scenes: [
      {
        id: "rainy-karaoke",
        sceneIndex: 1,
        year: "15.09.2026",
        title: "Sư tử nói lời giữ lời",
        shortTitle: "Đi hát",
        description: "Sang tuần, cí đôi này lại cãi nhau, cuộc yêu bớt nhiệt đi chút mà như sắp nghỉ chơi tới nơi, trên công ty, lời qua tiếng lại qua mí dòng tin nhắn 1 ngày trời, cuối ngày anh quyết định phi qua gặp em, lịch cho buổi tối hôm nay là đi hát.\n\nLần đầu mình ghé hiệu thuốc cùng nhau, hôm í vẫn là trời mưa, thay vì đau thì em vẫn muốn đi hát để giải tỏa.",
        paragraphs: [
          "Sang tuần, cí đôi này lại cãi nhau, cuộc yêu bớt nhiệt đi chút mà như sắp nghỉ chơi tới nơi, trên công ty, lời qua tiếng lại qua mí dòng tin nhắn 1 ngày trời, cuối ngày anh quyết định phi qua gặp em, lịch cho buổi tối hôm nay là đi hát. Mưa thâm lặng giời, 2 đứa vẫn quấn quýt đội áo mưa đi tới con đường Nguyễn Văn Lộc để tìm quán karaoke, và bùm, dit con me nó nhắc lại vãi lon cái quả đâm xe vào chân 1 cách éo thể ngờ. Anh kêu sao em không chặn lại để trách con nhỏ đó đền bù, nhưng lúc í thật sự chính em còn đang đơ người không hỉu cái gì đang xảy ra, và cái chân mình bị cái lon gì thế này =))))",
          "Lần đầu mình ghé hiệu thuốc cùng nhau, hôm í vẫn là trời mưa, thay vì đau thì em vẫn muốn đi hát để giải tỏa, cái quan trọng là không mún bùng kèo, ==sư tử nói lời giữ lời==, đã đi là phải đi, hong có delay.",
        ],
        microcopy: "2 đứa vẫn quấn quýt đội áo mưa.",
        quote: "Đã đi là phải đi, hong có delay.",
        secretTone: "bold",
        memoryCaption: "Kara tay vịn, view hẹp trá hình.",
        gallery: [
          {
            src: "/images/story/part-three/karaoke-hand.jpg",
            alt: "Phòng karaoke ánh đèn cam đỏ, một bàn tay đặt trên đầu gối, máy tính bảng đang tìm bài Baby",
            caption: "Kara tay vịn, view hẹp trá hình.",
          },
          {
            src: "/images/story/part-three/karaoke-song.jpg",
            alt: "Anh cầm mic bọc lưới hồng, gõ tìm bài trên máy tính bảng, ô cửa kính hồng vẽ nốt nhạc và đôi môi",
            caption: "Thay vì đau thì em vẫn muốn đi hát.",
          },
          {
            src: "/images/story/part-three/karaoke-feet.jpg",
            alt: "Hai bàn chân trên sàn phòng karaoke, cổ chân em quấn băng trắng, máy tính bảng mở danh sách bài hát",
            caption: "Lần đầu mình ghé hiệu thuốc cùng nhau.",
          },
        ],
        mood: "neon",
        accentColor: "#FF5D7E",
        accent: "#FF5D7E",
        image: "/images/story/part-three/karaoke-hand.jpg",
        imageAlt: "Phòng karaoke ánh đèn cam đỏ, một bàn tay đặt trên đầu gối, máy tính bảng đang tìm bài Baby",
        alignment: "left",
        visualType: "karaoke",
        artifactType: "karaoke-mic",
        threadState: "karaoke",
      },
      {
        id: "clinic-day",
        sceneIndex: 2,
        year: "16.09.2026",
        title: "Phòng khám Hồng Ngọc",
        shortTitle: "Phòng khám",
        description: "Đưa Hồng Ngọc đi phòng khám Hồng Ngọc =))) để khám chân, rồi lại vào chốn cũ, 59A Yên Bình, xem 2 bộ phim lận.",
        paragraphs: [
          "Đưa Hồng Ngọc đi phòng khám Hồng Ngọc =))) để khám chân, 1 buổi sáng đẹp zời tiếp theo, chúng ta dành cả ngày với nhau, nhưng lần này rơi vào hoàn cảnh khác, em đã đi lại khó khăn mà thật may nó không bị gì hết, anh trả viện phí chụp X-Quang cho em, và đưa em đi ăn gà tần tẩm bổ =)))) bổ hay không không chắc nhưng mà ngon.",
          "Skip cả buổi sáng hôm í chỉ có đi tìm phòng khám và ăng thì sau đó chúng ta lại vào chốn cũ, 59A Yên Bình để tận hưởng cảm giác bình yên, lần này phòng phải nói là vừa đẹp vừa thơm, nhưng con người tui thì hơi khó chịu với cái chân đau 1 xí.",
          "Lần này tiến bộ thí, chúng mình xem 2 bộ phim lận, ==chăm chú ngồi tựa vai nhau trên chiếc ghế êm và ăn vặt==, iu ơi là iu í, ko chụp lại, ko cả dùng điện thoại cho hôm í luôn :))) dã cả man.",
        ],
        microcopy: "ko chụp lại, ko cả dùng điện thoại luôn.",
        quote: "Iu ơi là iu í.",
        secretTone: "soft",
        memoryCaption: "Hôm í không có tấm ảnh nào.",
        gallery: [],
        mood: "clinic",
        accentColor: "#F7A6B9",
        accent: "#F7A6B9",
        image: "",
        imageAlt: "Phòng khám Hồng Ngọc, phim X-Quang, bát gà tần và căn phòng 59A Yên Bình",
        alignment: "right",
        visualType: "clinic",
        artifactType: "x-ray",
        threadState: "clinic",
      },
      {
        id: "van-quan-rain",
        sceneIndex: 3,
        year: "16.09.2026",
        title: "Tình iu nó lạ z á",
        shortTitle: "Văn Quán",
        description: "Mình bên nhau mấy tiếng đồng hồ cho tới 6h tối, ăn ốc, rồi ngồi cf Văn Quán với màn mưa, sinh tố bơ và cốc gì đó cụa anh.",
        paragraphs: [
          "Mình bên nhau mấy tiếng đồng hồ cho tới 6h tối, chúng ta đi ăn gì e lại quên mất gòi, nhớ giùm e vớiiii. Ui nhớ gòi, là ăn ốc, phải quay lại quán đó vì cả 2 đều chấm điểm cao cho các món ở đây.",
          "Kết ngày, mình lang thang ngồi cf Văn Quán với không gian siêu chill, tâm sự và deep talk, với màn mưa cùng 1 chút sinh tố bơ và cốc gì đó cụa anh. Mải nói chuyện quá mà mưa to thì vl nhưng mà phải về gòi, dành cả ngày nghỉ cho nhau rùi, mưa to điên lên được, về chỉ lo anh bị cảm lạnh thôi, mà ==2 đứa cười ha hả trên đường về như dở ấy== chả hỉu sao :)) chắc tình iu nó lạ z á anh ha.",
        ],
        microcopy: "tâm sự và deep talk, với màn mưa.",
        quote: "Chắc tình iu nó lạ z á anh ha.",
        secretTone: "spark",
        memoryCaption: "Sinh tố bơ và cốc gì đó cụa anh.",
        gallery: [
          {
            src: "/images/story/part-three/van-quan-night.jpg",
            alt: "Bàn đá tròn bên hồ Văn Quán về đêm: cốc sinh tố bơ, cốc sữa chua, hai đĩa hạt hướng dương, dây cờ đỏ phía trên",
            caption: "Sinh tố bơ và cốc gì đó cụa anh.",
          },
          {
            src: "/images/story/part-three/van-quan-night-two.jpg",
            alt: "Hồ Văn Quán về đêm, nhà cao tầng sáng đèn phía xa, trên bàn là sinh tố bơ và hạt hướng dương",
            caption: "cf Văn Quán, không gian siêu chill.",
          },
        ],
        mood: "lakeside",
        accentColor: "#F2C14E",
        accent: "#F2C14E",
        image: "/images/story/part-three/van-quan-night.jpg",
        imageAlt: "Bàn đá tròn bên hồ Văn Quán về đêm: cốc sinh tố bơ, cốc sữa chua, hai đĩa hạt hướng dương, dây cờ đỏ phía trên",
        alignment: "left",
        visualType: "lakeside",
        artifactType: "avocado-smoothie",
        threadState: "lakeside",
      },
      {
        id: "tiny-cafe",
        sceneIndex: 4,
        year: "19.09.2026",
        title: "Xin phép phụ huynh qua thăm em",
        shortTitle: "Tiny cf",
        description: "Cũng mạnh ha, nhắn tin cho bố Tiến xin qua thăm em Ngọc, rồi chill chill quanh Văn Quán, cụ thể là Tiny cf, với cuốn sổ tay và cây bút.",
        paragraphs: [
          "Cũng mạnh ha, nhắn tin cho bố Tiến xin qua thăm em Ngọc vì nhà em khó =)))) hôm đó vào thứ 7, 1 buổi chiều lẽ ra cái chân này phải đi bay mới phải, chiều siêu đẹp, nắng vàng gió mát người xinh, thế mà lại chill chill quanh Văn Quán, cụ thể là Tiny cf.",
          "Nhắc Hoàng đem theo cuốn sổ tay với bút đi không có thừa tí nào mà, ==viết lách đáng iu ghê hong==.",
        ],
        microcopy: "chill chill quanh Văn Quán.",
        quote: "Nắng vàng gió mát người xinh.",
        secretTone: "soft",
        memoryCaption: "Vệt son môi và dòng chữ ở sổ.",
        gallery: [
          {
            src: "/images/story/part-three/permission-chat.jpg",
            alt: "Tin nhắn Zalo chiều 18/9/2026: Hoàng xin phép bố Tiến cuối tuần qua nhà thăm Ngọc đang đau chân, bố cảm ơn Hoàng đã giúp đỡ em và gửi lời hỏi thăm gia đình",
            caption: "Tin nhắn xin phép bố Tiến, cũng mạnh ha.",
            screen: true,
          },
          {
            src: "/images/story/part-three/tiny-letter.jpg",
            alt: "Trang sổ ô li viết tay ngày 19 tháng 9 năm 2026, có vệt son môi đỏ và dòng chữ Em yêu Anh",
            caption: "Vệt son môi và dòng chữ ở sổ.",
          },
          {
            src: "/images/story/part-three/tiny-lego.jpg",
            alt: "Bàn gỗ ở Tiny Cafe: hai cốc sinh tố có nhánh hương thảo, khăn giấy in chữ Tiny Cafe và những mảnh lego đang lắp dở",
            caption: "Tiny cf, ngồi lắp lego chưa xong cí chân :))",
          },
          {
            src: "/images/story/part-three/notebook-afternoon.jpg",
            alt: "Trang sổ ghi 1 buổi chiều thu ở Tiny Cafe, Ga Văn Quán: olong kem mặn 6/10, sữa chua xôi xoài 8,5/10, hình vẽ hai người nắm tay",
            caption: "1 buổi chiều thu, chấm điểm cả đồ uống.",
          },
          {
            src: "/images/story/part-three/tiny-writing.jpg",
            alt: "Bàn tay đeo vòng hạt đang viết vào cuốn sổ ô li đặt trên tấm thảm thổ cẩm",
            caption: "Cuốn sổ tay với bút, không có thừa tí nào.",
          },
        ],
        mood: "notebook",
        accentColor: "#E8506A",
        accent: "#E8506A",
        image: "/images/story/part-three/tiny-letter.jpg",
        imageAlt: "Trang sổ ô li viết tay ngày 19 tháng 9 năm 2026, có vệt son môi đỏ và dòng chữ Em yêu Anh",
        alignment: "right",
        visualType: "notebook",
        artifactType: "lip-letter",
        threadState: "notebook",
      },
      {
        id: "cuc-cu-night",
        sceneIndex: 5,
        year: "19.09.2026",
        title: "Mình yêu nhau từ kiếp nào",
        shortTitle: "Cúc cu",
        description: "Jolibee thì ngon, công viên thì nóng, nhưng quán cf Cúc cu thì dịu vô cùng, nơi chúng mình ngồi nghe hát cùng nhau.",
        paragraphs: [
          "Ui quá là nhìu hoạt động cần phải kể, thời gian thì ngắn mà 2 ta thì đi lắm, cả năm trời em chưa có ăn Jolibee, mình đi thôiii.",
          "Dài quá kể mau mau ha, jolibee thì ngon, công viên thì nóng, nhưng quán cf Cúc cu thì dịu vô cùng ạ, nơi chúng mình ngồi nghe hát cùng nhau, ca khúc ấn tượng làm nổi bật tối hôm đó: Mình Yêu Nhau Từ Kiếp Nào + Em Là Không Thể, ==suýt nữa được trình bày bởi ca sĩ Xuân Hoàng gòi== =))))",
        ],
        microcopy: "jolibee thì ngon, công viên thì nóng.",
        quote: "Quán cf Cúc cu thì dịu vô cùng ạ.",
        secretTone: "spark",
        memoryCaption: "Cả năm trời em chưa có ăn Jolibee.",
        gallery: [
          {
            src: "/images/story/part-three/jollibee.jpg",
            alt: "Khay Jollibee với hai phần gà rán, mì Ý sốt cà chua, khoai tây chiên và hai cốc nước ngọt",
            caption: "Cả năm trời em chưa có ăn Jolibee.",
          },
          {
            src: "/images/story/part-three/cuc-cu-stage.jpg",
            alt: "Quán cà phê Cúc Cu có sân khấu acoustic tường vàng, hai bàn tay nắm chặt, trên bàn là hạt hướng dương và cốc matcha latte",
            caption: "Nắm tay nghe hát ở Cúc cu.",
          },
          {
            src: "/images/story/part-three/cuc-cu-hands.jpg",
            alt: "Hai bàn tay đan vào nhau, đồng hồ trên cổ tay anh, chiếc túi chữ Hanoi trên váy trắng của em",
            caption: "Mình Yêu Nhau Từ Kiếp Nào + Em Là Không Thể.",
          },
          {
            src: "/images/story/part-three/notebook-night.jpg",
            alt: "Trang sổ viết tay Tối 19/9/2026: gà rán Jolibee, mưa nhẹ, công viên Phùng Khoang, trà đào Mixue, Cucu coffee và những lời yêu",
            caption: "Cuốn sổ ghi chép lại kỉ niệm nhỏ.",
          },
        ],
        mood: "acoustic",
        accentColor: "#F6C945",
        accent: "#F6C945",
        image: "/images/story/part-three/jollibee.jpg",
        imageAlt: "Khay Jollibee với hai phần gà rán, mì Ý sốt cà chua, khoai tây chiên và hai cốc nước ngọt",
        alignment: "left",
        visualType: "acoustic",
        artifactType: "setlist",
        threadState: "acoustic",
      },
    ],
  },
  {
    id: "birthday-month",
    index: 6,
    year: "23.09.2026",
    title: "Sinh nhật Hoàng iu",
    shortTitle: "Sinh nhật",
    description: "Trung thu, hẹn hò tacos, chơi game, cơm Nhật, kara, và cuối cùng là sinh nhật anh iu.",
    paragraphs: ["Trung thu, hẹn hò tacos, chơi game, cơm Nhật, kara, và cuối cùng là sinh nhật anh iu."],
    microcopy: "trước khi tới sinh nhật anh iu.",
    quote: "Em iu Anh.",
    secretTone: "spark",
    memoryCaption: "Từ trung thu tới sinh nhật anh iu.",
    gallery: [],
    mood: "planner",
    accentColor: "#E0263F",
    accent: "#E0263F",
    image: "",
    imageAlt: "Cuối tháng 9: trung thu, tacos, cơm Nhật, kara và sinh nhật anh iu ngày 1/10",
    alignment: "right",
    visualType: "planner",
    artifactType: "calendar",
    threadState: "planner",
    scenes: [
      {
        id: "birthday-plans",
        sceneIndex: 1,
        year: "23.09.2026",
        title: "Lên lịch cho sinh nhật anh",
        shortTitle: "Lên lịch",
        description: "Khoan đã, trước khi tới phần này thì còn phải qua trung thu, hẹn hò tacos và chơi game kakaka, thú vị phết.\n\nNhưng biết không, tui đã muốn lên lịch cho ngày sinh nhật của anh trước 1 tuần.",
        paragraphs: [
          "Khoan đã, trước khi tới phần này thì còn phải qua trung thu, hẹn hò tacos và chơi game kakaka, thú vị phết.",
          "Nhưng biết không, tui đã muốn lên lịch cho ngày sinh nhật của anh trước 1 tuần, nhưng vì cái chân đau không đi lại nhiều được, tui ở nhà mà bực bội quá trời, nhiều lúc mải mê set lịch mà không nhắn tin và cheap moment thường xuyên như hồi mới yêu nữa, chúng tui lại rơi vào cãi vã, bằng cách lồn nào đó, ==lại như không có chuyện gì xảy ra== =))) thế mới tày.",
        ],
        microcopy: "mải mê set lịch mà không nhắn tin.",
        quote: "Thế mới tày.",
        secretTone: "bold",
        memoryCaption: "Sinh nhật anh được lên lịch trước 1 tuần.",
        gallery: [],
        mood: "planner",
        accentColor: "#D98BA6",
        accent: "#D98BA6",
        image: "",
        imageAlt: "Tờ lịch có ngày 1/10 khoanh đỏ, cuốn sổ kế hoạch và chiếc điện thoại im lặng",
        alignment: "right",
        visualType: "planner",
        artifactType: "calendar",
        threadState: "planner",
      },
      {
        id: "mid-autumn",
        sceneIndex: 2,
        year: "24.09.2026",
        title: "Trung thu với cí chân chưa khỏi hẳn",
        shortTitle: "Trung thu",
        description: "Đi chơi trung thu với cí chân chưa khỏi hẳn, đi ăn Tacos ngõ Ao Sen, rồi tạt đi chơi game.",
        paragraphs: [
          "Đi chơi trung thu với cí chân chưa khỏi hẳn, nhưng mà vẫn phải mặc đồ chinh, mà chỉ dc đi loanh quanh Hà Đông típ thoi, đi ăn Tacos ngõ Ao Sen, rồi tạt đi chơi game ở Playik, kết thúc tết trung thu, mình ghé vào cái hotel như ma =))) ==nghĩ tới mà sợ nhưng mà cũng cũng có kỉ niệm i==, chả sao hết.",
        ],
        microcopy: "vẫn phải mặc đồ chinh.",
        quote: "Chả sao hết.",
        secretTone: "spark",
        memoryCaption: "Tết trung thu, tacos ngõ Ao Sen.",
        gallery: [],
        mood: "lantern",
        accentColor: "#FF7A45",
        accent: "#FF7A45",
        image: "",
        imageAlt: "Đêm trung thu: trăng tròn, đèn lồng đỏ, đĩa tacos và máy chơi game",
        alignment: "left",
        visualType: "lantern",
        artifactType: "mooncake",
        threadState: "lantern",
      },
      {
        id: "phung-khoang",
        sceneIndex: 3,
        year: "26.09.2026",
        title: "Saku siêu ngon siêu ưng",
        shortTitle: "Phùng Khoang",
        description: "Mình lại ghé Phùng Khoang để khám phá những cí mới, cụ thể là ăn cơm Nhật, rồi đi hát kara quán random.",
        paragraphs: [
          "Mình lại ghé Phùng Khoang để khám phá những cí mới, cụ thể là ăn cơm Nhật, ==woaaa saku siêu ngon siêu ưng==, lần này chân em bớt đau hơn gòi, đi lại cũng ok hơn nên phấn chấn lắm, hôm í đi hát kara quán random mà siêu nhiều bài hát với nhau, vui vc ra nói chung là trọn vẹn, mà anh ơi :)) ý là cứ xong là lại hotel í phần này hơi nhiều chốn nghỉ chân nhaaaa.",
        ],
        microcopy: "đi hát kara quán random.",
        quote: "Nói chung là trọn vẹn.",
        secretTone: "spark",
        memoryCaption: "Cơm Nhật ở Phùng Khoang, saku siêu ngon.",
        gallery: [
          {
            src: "/images/story/part-three/saku-dinner.jpg",
            alt: "Bữa cơm Nhật ở Phùng Khoang: cơm cà ri katsu, gà karaage rưới sốt bên bắp cải bào và hai cốc nước mát",
            caption: "Cơm Nhật ở Phùng Khoang, saku siêu ngon.",
          },
        ],
        mood: "bento",
        accentColor: "#F08C6A",
        accent: "#F08C6A",
        image: "/images/story/part-three/saku-dinner.jpg",
        imageAlt: "Bữa cơm Nhật ở Phùng Khoang: cơm cà ri katsu, gà karaage rưới sốt bên bắp cải bào và hai cốc nước mát",
        alignment: "right",
        visualType: "bento",
        artifactType: "bento-box",
        threadState: "bento",
      },
      {
        id: "hoang-birthday",
        sceneIndex: 4,
        year: "01.10.2026",
        title: "Sinh nhật anh iu",
        shortTitle: "Sinh nhật",
        description: "Cuối cùng cũng tới sinh nhật anh iu 1/10/2026. Tadaaaa phần này để riêng anh viết và cảm nhận nhá =)))) Em iu Anh. Ngày sinh nhật a hỏ, ngày sinh nhật đó anh nghĩ phải là ngày tuyệt vời nhất trên đời. Lần đầu tiên a có ai đó ở bên cùng tổ chức sinh nhật. hêhhe viết ra thì dài lắm nói chung là tuyệt ơi là tuyệt hêhhe",
        paragraphs: [
          "Cuối cùng cũng tới sinh nhật anh iu 1/10/2026.",
          "Tadaaaa ==phần này để riêng anh viết và cảm nhận nhá== =)))) Em iu Anh",
        ],
        // Hoàng's part, in his own words.
        reply: {
          label: "Phần riêng anh viết",
          paragraphs: [
            "Ngày sinh nhật a hỏ, ngày sinh nhật đó anh nghĩ phải là ==ngày tuyệt vời nhất trên đời==. Lần đầu tiên a có ai đó ở bên cùng tổ chức sinh nhật.",
            "hêhhe viết ra thì dài lắm nói chung là tuyệt ơi là tuyệt hêhhe",
          ],
        },
        microcopy: "phần này để riêng anh viết.",
        quote: "Ngày tuyệt vời nhất trên đời.",
        secretTone: "bold",
        memoryCaption: "Sinh nhật anh iu, 1/10/2026.",
        gallery: [],
        mood: "birthday",
        accentColor: "#E0263F",
        accent: "#E0263F",
        image: "",
        imageAlt: "Bánh sinh nhật thắp nến, bó hoa ly đỏ và lá thư anh viết: ngày tuyệt vời nhất trên đời",
        alignment: "left",
        visualType: "birthday",
        artifactType: "birthday-cake",
        threadState: "birthday",
      },
    ],
  },
];

export const storyParts: StoryPart[] = [
  {
    id: "before-meeting",
    number: 1,
    eyebrow: "PHẦN I",
    title: "Trước khi gặp nhau",
    subtitle: "Những lần kết nối, bỏ lỡ và tìm thấy nhau qua một màn hình.",
    chapters: storyChapters,
  },
  {
    id: "together-offline",
    number: 2,
    eyebrow: "PHẦN II",
    title: "Thật sự đứng cạnh nhau",
    subtitle: "Đi lượn, Mixue, thủy cung, café và một buổi hoàng hôn. Lần đầu, kỷ niệm có đủ cả hai.",
    chapters: partTwoChapters,
  },
  {
    id: "too-fast",
    number: 3,
    eyebrow: "PHẦN III",
    title: "Quá nhanh, quá nguy hiểm",
    subtitle: "Từ homestay đầu tiên, Lăng Bác, những cơn mưa và cái chân đau, tới trung thu và sinh nhật anh iu. Toàn là những lần đầu với nhau.",
    chapters: partThreeChapters,
  },
];

/** Each part's own page, so a link to another part leaves this one. */
export const partHrefs: Record<StoryPartId, string> = {
  "before-meeting": "/",
  "together-offline": "/part-2/",
  "too-fast": "/part-3/",
};

export const romanNumeral = (number: StoryPartNumber) => ["I", "II", "III"][number - 1];

/** The diary each part is written in: Part III goes on in Part II's (see pageScopes in src/app/storyPage.ts). */
export const partClassNames: Record<StoryPartId, string> = {
  "before-meeting": "story-part-1",
  "together-offline": "story-part-2",
  "too-fast": "story-part-2 story-part-3",
};

export function createStoryScrollItems(parts: readonly StoryPart[]): StoryScrollItem[] {
  return parts.flatMap((part) =>
    part.chapters.flatMap<StoryScrollItem>((chapter) => {
      const shared = {
        partId: part.id,
        partNumber: part.number,
        partTitle: part.title,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        chapterIndex: chapter.index,
        chapterCount: part.chapters.length,
      };

      if (chapter.scenes?.length) {
        return chapter.scenes.map((scene): StoryScrollItem => ({
          ...scene,
          ...shared,
          index: chapter.index,
          sceneIndex: scene.sceneIndex,
          sceneCount: chapter.scenes?.length,
        }));
      }

      return [{ ...chapter, ...shared } as StoryScrollItem];
    }),
  );
}

export const storyScrollItems = createStoryScrollItems(storyParts);

export interface PartTransitionCopy {
  lead: string[];
  eyebrow: string;
  title: string;
  /** Leading words of the title that get the part's gradient. */
  accent: string;
}

/** The title pages of the parts that open on one (Part I opens on its own hero instead). */
export const partTransitionCopy: Record<Exclude<StoryPartId, "before-meeting">, PartTransitionCopy> = {
  "together-offline": {
    lead: [
      "Có những người bước vào đời mình qua một màn hình.",
      "Rồi một ngày, người ấy đứng ngay bên cạnh.",
    ],
    eyebrow: "PHẦN II · 2026",
    title: "Thật sự đứng cạnh nhau",
    accent: "Thật sự",
  },
  "too-fast": {
    lead: [
      "Hoàng và Ngọc ơi =)))))",
      "Sang 1 chương mới, chúng ta đã có quá nhiều thứ diễn ra trong giai đoạn này, so với thời điểm bắt đầu gặp gỡ thì dường như mọi thứ là quá nhanh quá nguy hiểmmmm.",
    ],
    eyebrow: "PHẦN III · MÙA THU · 2026",
    title: "Quá nhanh, quá nguy hiểm",
    accent: "Quá nhanh,",
  },
};

export const partOneEndingCopy = {
  title: "Câu chuyện bước ra ngoài màn hình.",
  body: "Phần tiếp theo bắt đầu khi hai người thật sự đứng cạnh nhau.",
  cta: "Đọc Phần II",
  footnote: "Cuối Phần I — và cũng là lúc một trang mới bắt đầu.",
  image: "/images/story/lover/flower-peace.jpg",
};

export interface EnvelopeCopy {
  /** When the envelope opens on its own (ISO 8601, Vietnam time +07:00). */
  opensAt: string;
  sealedTitle: string;
  openTitle: string;
  sealedNote: string;
  openNote: string;
  stamp: string;
  openLabel: string;
  countdownLabels: { days: string; hours: string; minutes: string; seconds: string };
  /** Where an open envelope leads, once the part inside has a page of its own. */
  link?: { href: string; label: string };
}

/**
 * The envelopes that close a part: sealed behind a countdown until `opensAt`, then open on their own.
 *
 * ▸ ĐỔI NGÀY Ở ĐÂY: `opensAt` là ngày giờ phong bì tự mở ra (ISO 8601, giờ Việt Nam +07:00).
 *   Trước ngày đó trang hiện phong bì dán kín kèm đồng hồ đếm ngược; đúng ngày thì phong bì mở ra.
 *
 * Part II's envelope held Part III and opened the day Part III was written in, so it now leads to its page.
 */
export const partThreeCopy: EnvelopeCopy = {
  opensAt: "2026-10-06T00:00:00+07:00",
  sealedTitle: "Một phong bì đang chờ",
  openTitle: "Phần III",
  sealedNote: "Bên trong là chương tiếp theo. Chưa tới ngày nên anh niêm lại đã.",
  openNote: "Tới ngày rồi. Phong bì mở ra, và chuyện của chúng mình được viết tiếp.",
  stamp: "Hát & Nờ",
  openLabel: "Mở vào ngày",
  countdownLabels: { days: "ngày", hours: "giờ", minutes: "phút", seconds: "giây" },
  link: { href: partHrefs["too-fast"], label: "Đọc Phần III" },
};

/** The envelope that closes Part III: the chapter after it, sealed until the date Part II's envelope used to wait for. */
export const nextPartCopy: EnvelopeCopy = {
  ...partThreeCopy,
  opensAt: "2026-12-20T20:00:00+07:00",
  openTitle: "Chương tiếp theo",
  link: undefined,
};

/** The five real places Part II actually happened, laid out on a stylised map of Hà Nội. */
export const journeyMapStops = [
  { id: "in-person-meeting", name: "SDU Tower", place: "Văn Quán, Hà Đông", x: 76, y: 416 },
  { id: "our-dates", name: "Công viên Phùng Khoang", place: "Hai cốc Mixue", x: 108, y: 330 },
  { id: "aquarium", name: "Lotte Mall Tây Hồ", place: "Thủy cung", x: 72, y: 96 },
  { id: "cafe", name: "Philo Garden", place: "Café sân vườn", x: 160, y: 212 },
  { id: "sunset", name: "Đường Thanh Niên", place: "Hoàng hôn Hồ Tây", x: 268, y: 172 },
];

export const journeyMapCopy = {
  eyebrow: "Bản đồ của chúng mình",
  title: "Năm điểm dừng trên một thành phố",
  note: "Từ chân tòa nhà ở Hà Đông, ngược lên Hồ Tây, rồi kết lại bên đường Thanh Niên.",
};

/**
 * The ribbons that run across the gaps between sections as the page scrolls (ScrollRibbon), in words the story already
 * uses. The ribbons after the chapters spell out the page's own chapters on their front band, taken from the chapters
 * themselves.
 */
export const scrollRibbonCopy = {
  /** Part I, between the opening page and the scrapbook. */
  partOneOpening: {
    front: ["những ngày mình thương", "hát & nờ", "2023 — 2026", "một cuốn nhật ký của hai người"],
    back: ["nhớ", "gặp", "thương", "những điều mình giữ lại"],
  },
  /** Part I, between the last chapter and the ending. */
  partOneRecap: { back: ["năm chương, một hành trình", "trước khi gặp nhau"] },
  /** Part II, between the last scene and the keepsake box. */
  partTwoStops: { back: ["năm điểm dừng trên một thành phố", "thật sự đứng cạnh nhau"] },
  /** Part II, between the keepsake box and the ending. */
  partTwoClosing: {
    front: ["hà đông", "hồ tây", "đường thanh niên", "còn tiếp"],
    back: ["hẹn", "cạnh", "mãi"],
  },
  /** Part III, between the last scene and the credits. */
  partThreeStops: { back: ["quá nhanh, quá nguy hiểm", "mùa thu · 2026", "toàn là những lần đầu"] },
};

/** The single Saturday that Chapter 3 covers, split across its three stops. */
export const dayTimeline = {
  start: "10:30",
  end: "19:00",
  stops: {
    aquarium: { from: "10:30", to: "14:00", note: "gặp nhau, thủy cung rồi đi ăn" },
    cafe: { from: "14:00", to: "17:30", note: "café sân vườn bên hồ" },
    sunset: { from: "17:30", to: "19:00", note: "ngắm hoàng hôn rồi đưa em về" },
  },
} as const;

export const endingCopy = {
  title: "Còn tiếp...",
  body: "Người bảo em chẳng nhớ chẳng thương, nhưng người nào biết, nỗi nhớ người em chẳng dám tỏ cùng ai. Viết đến khi những nếp giấy dày lên theo năm tháng, hay đến khi mực cũ nhòe đi, mà nỗi nhớ vẫn vẹn nguyên như thuở ban đầu. Và nếu có thể, em vẫn luôn muốn cùng người đi qua hết thảy những mùa thương của nhân gian.\nEm bé của anh, Hồng Ngọc, nhớ thương anh rất nhiều!",
  replayAllCta: "Xem lại từ đầu",
  replayDatesCta: "Xem lại những buổi hẹn",
  footnote: "Từ những lần gặp qua màn hình đến những ngày thật sự ở cạnh nhau.",
  image: "/images/story/part-two/aquarium-couple.jpg",
};

/**
 * Part III closes like the film it is named after: end credits, every line of them taken from Ngọc's writing (the three
 * pieces of chapter 3 and the notebook pages), then the next chapter's envelope.
 */
export const partThreeEndingCopy = {
  kicker: "hết phần iii",
  title: "Còn tiếp...",
  creditsTitle: "Một thước phim mùa thu của",
  stars: "Xuân Hoàng & Hồng Ngọc",
  credits: [
    {
      role: "Bối cảnh",
      names: ["Hà Đông", "Hoàng Mai", "Lăng Bác", "Chùa Một Cột", "Triệu Việt Vương", "Nguyễn Văn Lộc", "59A Yên Bình", "Văn Quán", "Tiny cf", "Phùng Khoang", "Cúc cu", "ngõ Ao Sen", "Playik"],
    },
    { role: "Phim định xem", names: ["Me Before You", "365 Days"], note: "đều không xem được =)))))" },
    { role: "Phim xem được", names: ["2 bộ lận"], note: "tựa vai nhau trên chiếc ghế êm" },
    { role: "Nhạc nền", names: ["The Weeknd", "Mình Yêu Nhau Từ Kiếp Nào", "Em Là Không Thể"], note: "suýt được trình bày bởi ca sĩ Xuân Hoàng" },
    { role: "Ứng dụng", names: ["Inlove", "Widgetable"] },
    { role: "Hai đứa con tinh thần", names: ["Bi", "Bơ"], note: "Bố Hoàng + Mẹ Ngọc" },
    { role: "Thực đơn", names: ["bánh ngọt", "nước trái cây", "bún riêu", "gà tần", "ốc", "sinh tố bơ", "Jolibee", "tacos", "cơm Nhật saku"] },
    { role: "Đạo cụ", names: ["chiếc xe ô tô đỏ", "bộ hoa đỏ đầm ngủ", "áo mưa", "cuốn sổ tay với bút", "lego lắp dở"] },
    { role: "Thời tiết", names: ["siêu siêu mê", "mưa lúc trưa", "mây trôi chiều tà", "mưa thâm lặng giời", "nắng vàng gió mát"] },
    { role: "Khách mời", names: ["quầy hàng của bà bên ghế đá", "bố Tiến", "phòng khám Hồng Ngọc"] },
  ],
  replayAllCta: "Xem lại từ đầu",
  previousPartCta: "Về Phần II",
  footnote: "Hai đứa, phản chiếu trên chiếc xe đỏ.",
  image: "/images/story/part-three/red-car-reflection-two.jpg",
  imageAlt: "Hai người ngồi tựa vào nhau, phản chiếu trên cửa một chiếc ô tô màu đỏ",
};

/** The day Hoàng and Ngọc set in Inlove as the day they fell for each other (Part III, Chương 02). */
export const loveCounterStart = "2026-04-24T00:00:00+07:00";
