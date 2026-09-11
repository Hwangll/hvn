export type StoryPartId = "before-meeting" | "together-offline";
export type StoryMood = "spark" | "quiet" | "return" | "parallel" | "warmth" | "daylight" | "aqua" | "cafe" | "sunset";
export type StoryAlignment = "left" | "right";
export type StoryVisualType = "swipe" | "disconnect" | "suggestion" | "parallel" | "wheel" | "in-person" | "dates" | "aquarium" | "cafe" | "sunset";
export type StoryArtifactType = "profiles" | "silent-chat" | "friend-request" | "eight-hour-clock" | "open-loop" | "pair-frame" | "date-card" | "aquarium-ticket" | "cafe-cup" | "sunset-photo";
export type StoryThreadState = "meeting" | "disconnected" | "reconnecting" | "parallel" | "staying" | "in-person" | "dating" | "aquarium" | "cafe" | "sunset";
export type SecretTone = "spark" | "soft" | "bold";

export interface StoryPhoto {
  src?: string;
  alt: string;
  caption: string;
  placeholderNote?: string;
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
  number: 1 | 2;
  eyebrow: string;
  title: string;
  subtitle: string;
  chapters: StoryChapter[];
}

export interface StoryScrollItem extends Omit<StoryChapter, "scenes"> {
  partId: StoryPartId;
  partNumber: 1 | 2;
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
];

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

export const partTransitionCopy = {
  lead: [
    "Có những người bước vào đời mình qua một màn hình.",
    "Rồi một ngày, người ấy đứng ngay bên cạnh.",
  ],
  eyebrow: "PHẦN II · 2026",
  title: "Thật sự đứng cạnh nhau",
  /** Leading words of the title that get the aqua-to-dusk gradient. */
  accent: "Thật sự",
};

export const partOneEndingCopy = {
  title: "Câu chuyện bước ra ngoài màn hình.",
  body: "Phần tiếp theo bắt đầu khi hai người thật sự đứng cạnh nhau.",
  cta: "Đọc Phần II",
  footnote: "Cuối Phần I — và cũng là lúc một trang mới bắt đầu.",
  image: "/images/story/lover/flower-peace.jpg",
};

/**
 * The sealed envelope that closes Part II.
 *
 * ▸ ĐỔI NGÀY Ở ĐÂY: `opensAt` là ngày giờ phong bì tự mở ra (ISO 8601, giờ Việt Nam +07:00).
 *   Trước ngày đó trang hiện phong bì dán kín kèm đồng hồ đếm ngược; đúng ngày thì phong bì mở ra.
 */
export const partThreeCopy = {
  opensAt: "2026-12-20T20:00:00+07:00",
  sealedTitle: "Một phong bì đang chờ",
  openTitle: "Phần III",
  sealedNote: "Bên trong là chương tiếp theo. Chưa tới ngày nên anh niêm lại đã.",
  openNote: "Tới ngày rồi. Phong bì mở ra, và chuyện của chúng mình được viết tiếp.",
  stamp: "Hát & Nờ",
  openLabel: "Mở vào ngày",
  countdownLabels: { days: "ngày", hours: "giờ", minutes: "phút", seconds: "giây" },
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
