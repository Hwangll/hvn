import { CakeSlice, CalendarDays, CalendarHeart, CloudSunRain, Coffee, CupSoda, Film, Fish, Flower2, Gift, Guitar, HeartHandshake, Landmark, Mic, Moon, NotebookPen, Smartphone, Stethoscope, Sunset, Utensils } from "lucide-react";
import type { StoryThreadState } from "../data/story";

/** What each stop is called on a route, where its own short title is too long. */
export const routeLabels: Partial<Record<StoryThreadState, string>> = {
  "in-person": "Đi lượn",
  dating: "Mixue",
  aquarium: "Thủy cung",
  cafe: "Café",
  sunset: "Hoàng hôn",
  homestay: "Homestay",
  apps: "Bi & Bơ",
  office: "Hoàng Mai",
  museum: "Lăng Bác",
  pagoda: "Chùa",
  rain: "Chiều tà",
  karaoke: "Đi hát",
  clinic: "Phòng khám",
  lakeside: "Văn Quán",
  notebook: "Tiny cf",
  acoustic: "Cúc cu",
  planner: "Lên lịch",
  lantern: "Trung thu",
  bento: "Phùng Khoang",
  birthday: "Sinh nhật",
};

/** Each stop's icon, on the route and on the autumn's map. */
export const routeIcons = {
  "in-person": HeartHandshake,
  dating: CalendarHeart,
  aquarium: Fish,
  cafe: Coffee,
  sunset: Sunset,
  homestay: Film,
  apps: Smartphone,
  office: CakeSlice,
  museum: Landmark,
  pagoda: Flower2,
  rain: CloudSunRain,
  karaoke: Mic,
  clinic: Stethoscope,
  lakeside: CupSoda,
  notebook: NotebookPen,
  acoustic: Guitar,
  planner: CalendarDays,
  lantern: Moon,
  bento: Utensils,
  birthday: Gift,
} as const;
