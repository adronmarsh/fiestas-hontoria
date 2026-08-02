import { cn } from "@/lib/utils";

type DayBannerProps = {
  weekday: string;
  dayNumber: string;
  className?: string;
  as?: "p" | "h2" | "h3" | "div";
};

export function DayBanner({
  weekday,
  dayNumber,
  className,
  as: Tag = "p",
}: DayBannerProps) {
  return (
    <Tag className={cn("day-banner text-xl sm:text-2xl", className)}>
      {weekday.toUpperCase()}{" "}
      <span className="day-num">{dayNumber}</span> AGOSTO
    </Tag>
  );
}
