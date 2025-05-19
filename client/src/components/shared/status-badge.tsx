import { cn } from "@/lib/utils";

type OrderStatus = "pending" | "assigned" | "in-transit" | "completed" | "canceled";

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusStyles = {
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    assigned: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    "in-transit": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    canceled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  const statusLabels = {
    pending: "Pending",
    assigned: "Assigned",
    "in-transit": "In Transit",
    completed: "Completed",
    canceled: "Canceled",
  };

  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded-full text-xs font-medium",
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
