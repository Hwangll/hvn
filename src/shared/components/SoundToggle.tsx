import { Volume2, VolumeX } from "lucide-react";
import { useTuckOnScrollDown } from "../hooks/useTuckOnScrollDown";

interface SoundToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export function SoundToggle({ enabled, onToggle }: SoundToggleProps) {
  const label = enabled ? "Tắt âm thanh" : "Bật âm thanh";
  // Small screens tuck the toggle away while reading down, like the part navigation; styles opt in per page.
  const tucked = useTuckOnScrollDown();

  return (
    <button className={`sound-toggle ${tucked ? "is-tucked" : ""}`} type="button" aria-pressed={enabled} aria-label={label} onClick={onToggle}>
      {enabled ? <Volume2 aria-hidden="true" size={18} /> : <VolumeX aria-hidden="true" size={18} />}
      <span className="sound-toggle-text">
        <strong>{enabled ? "Đang phát" : "Im lặng"}</strong>
        <small>{enabled ? "Tình mình lạ kỳ" : "Bật nhạc nền"}</small>
      </span>
    </button>
  );
}
