export type StoryMood = "spark" | "quiet" | "return" | "parallel" | "warmth";
export type StoryAlignment = "left" | "right";
export type StoryVisualType = "swipe" | "disconnect" | "suggestion" | "parallel" | "wheel";
export type StoryArtifactType = "profiles" | "silent-chat" | "friend-request" | "eight-hour-clock" | "open-loop";
export type StoryThreadState = "meeting" | "disconnected" | "reconnecting" | "parallel" | "staying";
export type SecretTone = "spark" | "soft" | "bold";

export interface StoryPhoto {
  src: string;
  alt: string;
  caption: string;
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
  secretNote: {
    label: string;
    text: string;
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
  alignment: StoryAlignment;
  optionalSound?: string;
  visualType: StoryVisualType;
  artifactType: StoryArtifactType;
  threadState: StoryThreadState;
}

export const introCopy = {
  title: "Hát và Nờ",
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
      "Có lẽ tất cả chỉ đang đưa họ quay trở lại đúng người, vào đúng thời điểm.",
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
        caption: "Cái kết mở nên cần một tấm ảnh nhiều hoa.",
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

export const endingCopy = {
  title: "Còn tiếp...",
  body: "Câu chuyện này chưa có một cái kết hoàn chỉnh.\n\nHai người vẫn đang học cách bước vào cuộc đời nhau, không phải bằng những lời hứa thật lớn, mà bằng việc tiếp tục xuất hiện vào ngày mai.",
  cta: "Xem lại hành trình",
  footnote: "Được viết lại từ những lần gặp, mất kết nối và tìm thấy nhau.",
  image: "/images/story/lover/flower-peace.jpg",
};
