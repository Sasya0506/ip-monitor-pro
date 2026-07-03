import { Badge } from "@/components/ui/badge";

type PriorityLevel = "high" | "medium" | "low";

interface PriorityBadgeProps {
  priority: PriorityLevel | string;
  className?: string;
}

export function TrademarkPriorityBadge({ priority, className }: PriorityBadgeProps) {
  const p = priority.toLowerCase();
  
  if (p === "high") {
    return <Badge variant="destructive" className={className}>High Priority</Badge>;
  }
  
  if (p === "medium") {
    return <Badge variant="secondary" className={`bg-amber-100 text-amber-900 hover:bg-amber-200 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800 ${className || ''}`}>Medium Priority</Badge>;
  }
  
  if (p === "low") {
    return <Badge variant="secondary" className={`bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-800 ${className || ''}`}>Low Priority</Badge>;
  }
  
  return <Badge variant="outline" className={className}>{priority}</Badge>;
}
