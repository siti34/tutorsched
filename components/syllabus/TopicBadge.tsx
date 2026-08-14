import { CheckCircle2, Circle } from "lucide-react";

interface TopicBadgeProps {
  name: string;
  covered: boolean;
  size?: "sm" | "md";
}

export default function TopicBadge({
  name,
  covered,
  size = "md",
}: TopicBadgeProps) {
  const iconSize = size === "sm" ? 9 : 11;
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";
  const padding = size === "sm" ? "px-2 py-0.5" : "px-2.5 py-1";

  if (covered) {
    return (
      <span
        className={`inline-flex items-center gap-1 ${textSize} font-medium ${padding} rounded-full bg-success-bg text-success-text`}
      >
        <CheckCircle2 size={iconSize} className="text-success-text flex-shrink-0" />
        {name}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 ${textSize} font-medium ${padding} rounded-full bg-page text-muted-foreground border border-border`}
    >
      <Circle size={iconSize} className="text-muted-foreground flex-shrink-0" />
      {name}
    </span>
  );
}
