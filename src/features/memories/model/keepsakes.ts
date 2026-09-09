import type { LucideIcon } from "lucide-react";
import { CalendarDays, Coffee, Flame, Flower2, Heart, ImageIcon, Images, Mail, Star, Sunset, Ticket } from "lucide-react";
import type { SoundCue } from "../../../shared/hooks/useSoundToggle";
import type { StoryPartId } from "../../story/data/story";

export type KeepsakeId = "bouquet" | "envelope" | "heart" | "candle" | "polaroid" | "star" | "pair-frame" | "date-card" | "aquarium-ticket" | "cafe-cup" | "sunset-photo";

export interface KeepsakeItem {
  id: KeepsakeId;
  partId: StoryPartId;
  label: string;
  hint: string;
  memoryCaption: string;
  unlockStoryId: string;
  unlockLabel: string;
}

export const keepsakes: readonly KeepsakeItem[] = [
  { id: "bouquet", partId: "before-meeting", label: "Bó hoa xanh", hint: "Nhắc về những món quà nhỏ mà nhớ lâu.", memoryCaption: "Bó hoa mở hộp: tươi, hơi ngại, và rất giống cảm giác bắt đầu thích ai đó.", unlockStoryId: "first-meeting", unlockLabel: "Phần I · Chương 01" },
  { id: "envelope", partId: "before-meeting", label: "Phong bì", hint: "Có những lời chưa nói kịp nhưng vẫn còn nguyên.", memoryCaption: "Phong bì giữ lại mấy câu chưa gửi, kiểu đọc lên là biết từng nhớ nhau nhiều.", unlockStoryId: "first-meeting", unlockLabel: "Phần I · Chương 01" },
  { id: "heart", partId: "before-meeting", label: "Tim giấy", hint: "Không cần quá sến, chỉ cần thật lòng một chút.", memoryCaption: "Tim giấy hơi sến, nhưng chuyện này mà không sến một tí thì phí.", unlockStoryId: "lost-connection", unlockLabel: "Phần I · Chương 02" },
  { id: "star", partId: "before-meeting", label: "Sao sticker", hint: "Thuật toán đôi khi cũng biết làm nền cho duyên số.", memoryCaption: "Ngôi sao của màn add friend: bé tí nhưng sáng đúng lúc.", unlockStoryId: "meet-again", unlockLabel: "Phần I · Chương 03" },
  { id: "candle", partId: "before-meeting", label: "Nến thơm", hint: "Một khoảng lặng ấm để hai người kể tiếp.", memoryCaption: "Nến thơm dành cho những cuộc nói chuyện dài, lúc cả hai cần một chỗ dịu lại.", unlockStoryId: "no-more-chance", unlockLabel: "Phần I · Chương 04" },
  { id: "polaroid", partId: "before-meeting", label: "Polaroid", hint: "Ký ức không hoàn hảo, nhưng rất biết cách ở lại.", memoryCaption: "Polaroid cuối Phần I: lưu lại lý do hai người vẫn chọn ở lại.", unlockStoryId: "turning-point", unlockLabel: "Phần I · Chương 05" },
  { id: "pair-frame", partId: "together-offline", label: "Khung ảnh đôi", hint: "Lần đầu câu chuyện có một khung hình ở ngoài đời.", memoryCaption: "Khung ảnh đang chờ tấm hình của lần hai người thật sự đứng cạnh nhau.", unlockStoryId: "in-person-meeting", unlockLabel: "Phần II · Chương 01" },
  { id: "date-card", partId: "together-offline", label: "Mẩu lịch hẹn", hint: "Mỗi buổi hẹn là thêm một trang chung.", memoryCaption: "Mẩu lịch không ghi ngày thay bạn; nó chờ một mốc thời gian thật được bổ sung.", unlockStoryId: "our-dates", unlockLabel: "Phần II · Chương 02" },
  { id: "aquarium-ticket", partId: "together-offline", label: "Vé thủy cung", hint: "Một kỷ vật nhỏ từ điểm dừng đầu tiên trong ngày.", memoryCaption: "Chiếc vé giữ sắc xanh của buổi cùng nhau ngắm thế giới dưới nước.", unlockStoryId: "aquarium", unlockLabel: "Phần II · Chương 03 · Cảnh 01" },
  { id: "cafe-cup", partId: "together-offline", label: "Tách café", hint: "Một khoảng nghỉ ấm và thật chậm.", memoryCaption: "Tách café đánh dấu nhịp nghỉ bình yên ở giữa ngày.", unlockStoryId: "cafe", unlockLabel: "Phần II · Chương 03 · Cảnh 02" },
  { id: "sunset-photo", partId: "together-offline", label: "Ảnh hoàng hôn", hint: "Hai đường cùng đi về một hướng ở cuối ngày.", memoryCaption: "Tấm ảnh cuối ngày chờ lưu lại khoảnh khắc cả hai cùng thấy thật thoải mái.", unlockStoryId: "sunset", unlockLabel: "Phần II · Chương 03 · Cảnh 03" },
];

export const keepsakeIcons: Record<KeepsakeId, LucideIcon> = {
  bouquet: Flower2,
  envelope: Mail,
  heart: Heart,
  candle: Flame,
  polaroid: ImageIcon,
  star: Star,
  "pair-frame": Images,
  "date-card": CalendarDays,
  "aquarium-ticket": Ticket,
  "cafe-cup": Coffee,
  "sunset-photo": Sunset,
};

export const keepsakeSoundCues: Record<KeepsakeId, SoundCue> = {
  bouquet: "keepsakeBouquet",
  candle: "keepsakeCandle",
  envelope: "keepsakeEnvelope",
  heart: "keepsakeHeart",
  polaroid: "keepsakePolaroid",
  star: "keepsakeStar",
  "pair-frame": "keepsakePolaroid",
  "date-card": "keepsakeEnvelope",
  "aquarium-ticket": "keepsakeStar",
  "cafe-cup": "keepsakeCandle",
  "sunset-photo": "keepsakePolaroid",
};
