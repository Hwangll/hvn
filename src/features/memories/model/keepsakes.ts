import type { LucideIcon } from "lucide-react";
import { Flame, Flower2, Heart, ImageIcon, Mail, Star } from "lucide-react";
import type { SoundCue } from "../../../shared/hooks/useSoundToggle";

export type KeepsakeId = "bouquet" | "envelope" | "heart" | "candle" | "polaroid" | "star";

export interface KeepsakeItem {
  id: KeepsakeId;
  label: string;
  hint: string;
  memoryCaption: string;
  unlockChapterIndex: number;
}

export const keepsakes: readonly KeepsakeItem[] = [
  { id: "bouquet", label: "Bó hoa xanh", hint: "Nhắc về những món quà nhỏ mà nhớ lâu.", memoryCaption: "Bó hoa mở hộp: tươi, hơi ngại, và rất giống cảm giác bắt đầu thích ai đó.", unlockChapterIndex: 0 },
  { id: "envelope", label: "Phong bì", hint: "Có những lời chưa nói kịp nhưng vẫn còn nguyên.", memoryCaption: "Phong bì giữ lại mấy câu chưa gửi, kiểu đọc lên là biết từng nhớ nhau nhiều.", unlockChapterIndex: 0 },
  { id: "heart", label: "Tim giấy", hint: "Không cần quá sến, chỉ cần thật lòng một chút.", memoryCaption: "Tim giấy hơi sến, nhưng chuyện này mà không sến một tí thì phí.", unlockChapterIndex: 1 },
  { id: "star", label: "Sao sticker", hint: "Thuật toán đôi khi cũng biết làm nền cho duyên số.", memoryCaption: "Ngôi sao của màn add friend: bé tí nhưng sáng đúng lúc.", unlockChapterIndex: 2 },
  { id: "candle", label: "Nến thơm", hint: "Một khoảng lặng ấm để hai người kể tiếp.", memoryCaption: "Nến thơm dành cho những cuộc nói chuyện dài, lúc cả hai cần một chỗ dịu lại.", unlockChapterIndex: 3 },
  { id: "polaroid", label: "Polaroid", hint: "Ký ức không hoàn hảo, nhưng rất biết cách ở lại.", memoryCaption: "Polaroid cuối hộp: lưu lại mặt đáng yêu, lưu luôn cả lý do muốn ở lại.", unlockChapterIndex: 4 },
];

export const keepsakeIcons: Record<KeepsakeId, LucideIcon> = {
  bouquet: Flower2,
  envelope: Mail,
  heart: Heart,
  candle: Flame,
  polaroid: ImageIcon,
  star: Star,
};

export const keepsakeSoundCues: Record<KeepsakeId, SoundCue> = {
  bouquet: "keepsakeBouquet",
  candle: "keepsakeCandle",
  envelope: "keepsakeEnvelope",
  heart: "keepsakeHeart",
  polaroid: "keepsakePolaroid",
  star: "keepsakeStar",
};
