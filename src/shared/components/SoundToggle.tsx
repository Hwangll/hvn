import { Volume2, VolumeX } from "lucide-react";

interface SoundToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export function SoundToggle({ enabled, onToggle }: SoundToggleProps) {
  const label = enabled ? "Tắt âm thanh" : "Bật âm thanh";

  return (
    <button className="sound-toggle" type="button" aria-pressed={enabled} aria-label={label} onClick={onToggle}>
      {enabled ? <Volume2 aria-hidden="true" size={18} /> : <VolumeX aria-hidden="true" size={18} />}
      <span className="sound-toggle-text">
        <strong>{enabled ? "Đang phát" : "Im lặng"}</strong>
        <small>{enabled ? "Tình mình lạ kỳ" : "Bật nhạc nền"}</small>
      </span>
    </button>
  );
}
