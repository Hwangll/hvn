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
    memoryCaption: "Chỗ dành cho tấm ảnh của buổi tối hai cốc Mixue kéo dài tới một giờ sáng.",
    gallery: [
      {
        src: "",
        alt: "Vị trí chờ ảnh buổi tối Mixue",
        caption: "Hai cốc Mixue",
        placeholderNote: "Thêm ảnh buổi tối Mixue tại đây.",
      },
    ],
    mood: "daylight",
    accentColor: "#8BCBD8",
    accent: "#8BCBD8",
    image: "",
    imageAlt: "Vị trí chờ ảnh buổi tối Mixue",
    imageNote: "Thêm ảnh buổi tối Mixue tại đây.",
    alignment: "right",
    visualType: "dates",
    artifactType: "date-card",
    threadState: "dating",
  },
  {
    id: "most-comfortable-day",
    index: 3,
    year: "Gần đây",
    title: "Một ngày thoải mái nhất trên đời",
    shortTitle: "Một ngày thật thoải mái",
    description: "Một ngày đi từ thủy cung, qua café, rồi cùng nhau ngắm hoàng hôn.",
    paragraphs: ["Một ngày đi từ thủy cung, qua café, rồi cùng nhau ngắm hoàng hôn."],
    microcopy: "ba điểm dừng, cùng một nhịp bình yên.",
    quote: "Một ngày thoải mái nhất trên đời.",
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
        description: "Ngày ấy bắt đầu ở thủy cung, nơi cả hai cùng ngắm nhìn thế giới dưới nước.",
        paragraphs: [
          "Ngày ấy bắt đầu ở thủy cung.",
          "Giữa sắc xanh và những chuyển động chậm dưới nước, cả hai cùng đứng cạnh nhau để ngắm nhìn.",
        ],
        microcopy: "cùng nhìn về một phía.",
        quote: "Một điểm dừng xanh và thật chậm.",
        secretTone: "soft",
        memoryCaption: "Vị trí dành cho ảnh và chiếc vé của buổi đi thủy cung.",
        gallery: [
          {
            src: "",
            alt: "Vị trí chờ ảnh ở thủy cung",
            caption: "Khoảnh khắc ở thủy cung",
            placeholderNote: "Thêm ảnh ở thủy cung tại đây.",
          },
        ],
        mood: "aqua",
        accentColor: "#67D9ED",
        accent: "#67D9ED",
        image: "",
        imageAlt: "Vị trí chờ ảnh ở thủy cung",
        imageNote: "Thêm ảnh ở thủy cung tại đây.",
        alignment: "left",
        visualType: "aquarium",
        artifactType: "aquarium-ticket",
        threadState: "aquarium",
      },
      {
        id: "cafe",
        sceneIndex: 2,
        year: "Điểm dừng 02",
        title: "Café",
        shortTitle: "Café",
        description: "Rời thủy cung, ngày ấy tiếp tục bằng một khoảng nghỉ ở café.",
        paragraphs: [
          "Rời thủy cung, ngày ấy tiếp tục bằng một khoảng nghỉ ở café.",
          "Một nhịp chậm hơn, ấm hơn, vừa đủ để ngồi cạnh nhau và để thời gian trôi thật nhẹ.",
        ],
        microcopy: "một khoảng nghỉ thật êm.",
        quote: "Không cần vội khi đang thấy thoải mái.",
        secretTone: "soft",
        memoryCaption: "Trang nhật ký bên bàn café đang chờ ảnh và một ghi chú thật của hai người.",
        gallery: [
          {
            src: "",
            alt: "Vị trí chờ ảnh ở café",
            caption: "Khoảng nghỉ ở café",
            placeholderNote: "Thêm ảnh và ghi chú ở café tại đây.",
          },
        ],
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
        description: "Cuối ngày, cả hai cùng ngắm hoàng hôn và nhận ra mình vừa có một ngày rất đặc biệt.",
        paragraphs: [
          "Cuối ngày là khoảng trời chuyển dần sang màu đào, cam và tím nhạt.",
          "Sau thủy cung và café, cả hai cùng ngắm hoàng hôn rồi cùng thừa nhận cảm giác của ngày hôm ấy.",
        ],
        microcopy: "hai đường, cùng một hướng.",
        quote: "Một ngày thoải mái nhất trên đời.",
        secretTone: "spark",
        memoryCaption: "Vị trí dành cho tấm ảnh cuối ngày, khi cả hai cùng nhìn về một hướng.",
        gallery: [
          {
            src: "",
            alt: "Vị trí chờ ảnh ngắm hoàng hôn",
            caption: "Khoảnh khắc ngắm hoàng hôn",
            placeholderNote: "Thêm ảnh hoàng hôn tại đây.",
          },
        ],
        mood: "sunset",
        accentColor: "#D8BACF",
        accent: "#D8BACF",
        image: "",
        imageAlt: "Vị trí chờ ảnh ngắm hoàng hôn",
        imageNote: "Thêm ảnh hoàng hôn tại đây.",
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

export const endingCopy = {
  title: "Còn tiếp...",
  body: "Lần này, câu chuyện có thêm những ngày ở cạnh nhau.",
  replayAllCta: "Xem lại từ đầu",
  replayDatesCta: "Xem lại những buổi hẹn",
  footnote: "Từ những lần gặp qua màn hình đến những ngày thật sự ở cạnh nhau.",
  image: "/images/story/lover/flower-peace.jpg",
};
