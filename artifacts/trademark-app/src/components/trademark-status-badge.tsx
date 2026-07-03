import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function TrademarkStatusBadge({ status, className }: StatusBadgeProps) {
  let variant: "default" | "destructive" | "outline" | "secondary" = "outline";
  let colorClass = "";

  const s = status.toLowerCase();

  // High Priority
  if (
    s.includes("hearing") || 
    s.includes("opposed") || 
    s.includes("examination report") || 
    s.includes("objected")
  ) {
    variant = "destructive";
  } 
  // Medium Priority
  else if (
    s.includes("marked for examination") || 
    s.includes("formalities check") || 
    s.includes("accepted")
  ) {
    variant = "secondary";
    colorClass = "bg-amber-100 text-amber-900 hover:bg-amber-200 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800";
  }
  // Low Priority
  else if (
    s.includes("registered") || 
    s.includes("renewed") || 
    s.includes("closed") || 
    s.includes("withdrawn") || 
    s.includes("refused") || 
    s.includes("abandoned")
  ) {
    variant = "secondary";
    colorClass = "bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-800";
    
    // Make closed/withdrawn/refused slightly grayed out but still green-ish or gray
    if (s.includes("closed") || s.includes("withdrawn") || s.includes("refused") || s.includes("abandoned")) {
      colorClass = "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    }
  }

  return (
    <Badge variant={variant} className={`${colorClass} ${className || ''}`}>
      {status}
    </Badge>
  );
}
