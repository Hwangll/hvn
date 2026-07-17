import { AtSign } from "lucide-react";

interface RecommendationCardProps {
  title?: string;
  subtitle?: string;
}

export function RecommendationCard({
  title = "Người có thể bạn biết",
  subtitle = "và từng lỡ mất",
}: RecommendationCardProps) {
  return (
    <div className="recommendation-card">
      <AtSign size={18} aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
    </div>
  );
}
