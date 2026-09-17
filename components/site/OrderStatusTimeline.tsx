import { Check } from "lucide-react";
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function OrderStatusTimeline({ status }: { status: string }) {
  if (status === "CANCELLED") {
    return (
      <div className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600">
        This order has been cancelled.
      </div>
    );
  }

  const currentIndex = ORDER_STATUS_FLOW.indexOf(status as (typeof ORDER_STATUS_FLOW)[number]);

  return (
    <div className="flex flex-wrap gap-y-4">
      {ORDER_STATUS_FLOW.map((s, i) => (
        <div key={s} className="flex flex-1 min-w-[100px] flex-col items-center gap-2 px-1 text-center">
          <div className="flex w-full items-center">
            <div
              className={cn(
                "h-0.5 flex-1",
                i === 0 ? "opacity-0" : i <= currentIndex ? "bg-forest-700" : "bg-forest-200"
              )}
            />
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold",
                i <= currentIndex ? "border-forest-700 bg-forest-700 text-cream-100" : "border-forest-200 text-forest-300"
              )}
            >
              {i <= currentIndex ? <Check size={14} /> : i + 1}
            </div>
            <div
              className={cn(
                "h-0.5 flex-1",
                i === ORDER_STATUS_FLOW.length - 1 ? "opacity-0" : i < currentIndex ? "bg-forest-700" : "bg-forest-200"
              )}
            />
          </div>
          <span className={cn("text-xs font-medium", i <= currentIndex ? "text-forest-800" : "text-forest-400")}>
            {ORDER_STATUS_LABELS[s]}
          </span>
        </div>
      ))}
    </div>
  );
}
