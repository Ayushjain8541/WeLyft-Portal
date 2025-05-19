import MainLayout from "@/components/layouts/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function Reports() {
  const [period, setPeriod] = useState("30");
  const [compareWith, setCompareWith] = useState("previous");
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Fetch report data
  const { data: reportData, isLoading } = useQuery({
    queryKey: ["/api/reports", period, compareWith],
  });

  // Top performing drivers data
  const driverPerformanceData = reportData?.driverPerformance || [
    { name: "Alex Johnson", orders: 184, completion: 98.4, rating: 5.0 },
    { name: "Sarah Kim", orders: 156, completion: 97.2, rating: 4.9 },
    { name: "Marcus Chen", orders: 122, completion: 94.5, rating: 4.7 },
    { name: "Maria Rodriguez", orders: 95, completion: 96.8, rating: 4.8 },
    { name: "James Wilson", orders: 88, completion: 93.6, rating: 4.6 },
  ];

  // Daily delivery volume data for the line chart
  const dailyVolumeData = reportData?.dailyVolume || [
    { name: "Mon", completed: 65, total: 78 },
    { name: "Tue", completed: 75, total: 82 },
    { name: "Wed", completed: 85, total: 91 },
    { name: "Thu", completed: 78, total: 88 },
    { name: "Fri", completed: 90, total: 95 },
    { name: "Sat", completed: 43, total: 50 },
    { name: "Sun", completed: 35, total: 40 },
  ];

  // Zone performance data for the bar chart
  const zonePerformanceData = reportData?.zonePerformance || [
    { name: "North Zone", orders: 120, onTime: 92 },
    { name: "East Zone", orders: 98, onTime: 88 },
    { name: "South Zone", orders: 86, onTime: 95 },
    { name: "West Zone", orders: 92, onTime: 89 },
    { name: "Central Zone", orders: 110, onTime: 94 },
  ];

  return (
    <MainLayout title="Reports">
      <div className="mt-6 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
            Delivery Performance Dashboard
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Track key metrics and performance indicators for your delivery operations.
          </p>
        </div>

        {/* Date Filter */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:flex md:items-center md:justify-between">
            <div className="flex items-center">
              <span className="text-gray-700 dark:text-gray-300 font-medium mr-3">Time period:</span>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {period === "custom" && (
              <div className="flex items-center">
                <span className="text-gray-700 dark:text-gray-300 font-medium mr-3">Date:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[200px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <div className="flex items-center">
              <span className="text-gray-700 dark:text-gray-300 font-medium mr-3">Compare to:</span>
              <Select value={compareWith} onValueChange={setCompareWith}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select comparison" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="previous">Previous period</SelectItem>
                  <SelectItem value="lastYear">Same period last year</SelectItem>
                  <SelectItem value="none">No comparison</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Main Dashboard Cards */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-5">
                  <Skeleton className="h-6 w-40 mb-2" />
                  <Skeleton className="h-8 w-20 mb-3" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))
            ) : (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Completion Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-baseline">
                      <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        84.6%
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400 flex items-baseline">
                        <svg className="h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        3.2%
                      </div>
                    </div>
                    <Progress className="h-2 mt-3" value={84.6} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Average Delivery Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-baseline">
                      <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        38 min
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400 flex items-baseline">
                        <svg className="h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        4.5%
                      </div>
                    </div>
                    <Progress className="h-2 mt-3" value={65} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Customer Satisfaction
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-baseline">
                      <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        4.8/5
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400 flex items-baseline">
                        <svg className="h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        0.2
                      </div>
                    </div>
                    <Progress className="h-2 mt-3" value={96} />
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Charts Tabs */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
          <Tabs defaultValue="volume" className="space-y-4">
            <TabsList>
              <TabsTrigger value="volume">Delivery Volume</TabsTrigger>
              <TabsTrigger value="zones">Zone Performance</TabsTrigger>
              <TabsTrigger value="drivers">Driver Performance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="volume">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Delivery Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={dailyVolumeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="total" 
                          stroke="#3b82f6" 
                          name="Total Orders" 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="completed" 
                          stroke="#10b981" 
                          name="Completed Orders" 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="zones">
              <Card>
                <CardHeader>
                  <CardTitle>Zone Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={zonePerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                        <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                        <Tooltip />
                        <Legend />
                        <Bar 
                          yAxisId="left" 
                          dataKey="orders" 
                          fill="#3b82f6" 
                          name="Total Orders" 
                        />
                        <Bar 
                          yAxisId="right" 
                          dataKey="onTime" 
                          fill="#10b981" 
                          name="On-Time %" 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="drivers">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Drivers</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Driver</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Orders</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Completion</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rating</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {driverPerformanceData.map((driver, idx) => (
                            <tr key={idx}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{driver.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{driver.orders}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{driver.completion}%</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{driver.rating.toFixed(1)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
