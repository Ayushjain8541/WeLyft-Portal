import { cn } from "@/lib/utils";
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  Package, 
  CheckCircle, 
  Clock, 
  Users 
} from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    isPositive: boolean;
  };
  icon: "orders" | "completed" | "time" | "drivers";
  className?: string;
}

export default function StatsCard({ title, value, change, icon, className }: StatsCardProps) {
  // Determine icon component
  const IconComponent = () => {
    switch (icon) {
      case "orders":
        return <Package className="h-6 w-6 text-white" />;
      case "completed":
        return <CheckCircle className="h-6 w-6 text-white" />;
      case "time":
        return <Clock className="h-6 w-6 text-white" />;
      case "drivers":
        return <Users className="h-6 w-6 text-white" />;
      default:
        return <Package className="h-6 w-6 text-white" />;
    }
  };

  // Determine icon background color
  const iconBgColor = () => {
    switch (icon) {
      case "orders":
        return "bg-indigo-500";
      case "completed":
        return "bg-green-500";
      case "time":
        return "bg-yellow-500";
      case "drivers":
        return "bg-blue-500";
      default:
        return "bg-indigo-500";
    }
  };

  return (
    <div className={cn("bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg", className)}>
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 rounded-md p-3", iconBgColor())}>
            <IconComponent />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {value}
                </div>
                {change && (
                  <div
                    className={cn(
                      "ml-2 flex items-baseline text-sm font-semibold",
                      change.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}
                  >
                    {change.isPositive ? (
                      <ArrowUpIcon className="self-center flex-shrink-0 h-5 w-5 text-green-500 dark:text-green-400" />
                    ) : (
                      <ArrowDownIcon className="self-center flex-shrink-0 h-5 w-5 text-red-500 dark:text-red-400" />
                    )}
                    <span className="sr-only">
                      {change.isPositive ? "Increased by" : "Decreased by"}
                    </span>
                    {change.value}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
