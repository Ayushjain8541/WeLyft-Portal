import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface PerformanceMetric {
  name: string;
  value: number;
  color: string;
}

interface PerformanceMetricsProps {
  metrics: PerformanceMetric[];
  className?: string;
}

export default function PerformanceMetrics({ metrics, className }: PerformanceMetricsProps) {
  // Define colors for progress bars
  const colorClasses = {
    green: "bg-green-500 dark:bg-green-600",
    blue: "bg-blue-500 dark:bg-blue-600",
    yellow: "bg-yellow-500 dark:bg-yellow-600",
    indigo: "bg-indigo-500 dark:bg-indigo-600",
    red: "bg-red-500 dark:bg-red-600",
  };
  
  return (
    <Card className={className}>
      <CardHeader className="px-4 py-5 sm:px-6">
        <CardTitle className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
          Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-0 sm:px-6 pb-6">
        <div className="space-y-4">
          {metrics.map((metric) => (
            <div key={metric.name}>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {metric.name}
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {metric.value}%
                </div>
              </div>
              <div className="mt-1">
                <Progress 
                  value={metric.value} 
                  className="h-2 bg-gray-200 dark:bg-gray-700" 
                  indicatorClassName={colorClasses[metric.color as keyof typeof colorClasses]} 
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
