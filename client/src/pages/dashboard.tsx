import { useEffect, useState } from "react";
import MainLayout from "@/components/layouts/main-layout";
import StatsCard from "@/components/dashboard/stats-card";
import ActivityCard from "@/components/dashboard/activity-card";
import MapView from "@/components/dashboard/map-view";
import PerformanceMetrics from "@/components/dashboard/performance-metrics";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const { data: dashboardData, isLoading: isDataLoading } = useQuery({
    queryKey: ["/api/dashboard"],
    enabled: isAuthenticated,
  });

  // Sample data for the map view
  const [deliveryLocations, setDeliveryLocations] = useState([]);
  
  useEffect(() => {
    if (dashboardData?.orders) {
      // Convert orders to map locations
      const locations = dashboardData.orders.map((order: any) => ({
        id: order.id,
        address: order.deliveryAddress,
        status: order.status,
        // Generate random coordinates for demonstration
        lat: 40.7128 + (Math.random() - 0.5) * 0.1,
        lng: -74.006 + (Math.random() - 0.5) * 0.1,
      }));
      setDeliveryLocations(locations);
    }
  }, [dashboardData]);

  const performanceMetrics = [
    {
      name: "Order Completion Rate",
      value: dashboardData?.metrics?.completionRate || 85,
      color: "green",
    },
    {
      name: "On-Time Delivery",
      value: dashboardData?.metrics?.onTimeRate || 92,
      color: "blue",
    },
    {
      name: "Driver Efficiency",
      value: dashboardData?.metrics?.driverEfficiency || 78,
      color: "yellow",
    },
    {
      name: "Customer Satisfaction",
      value: dashboardData?.metrics?.customerSatisfaction || 94,
      color: "indigo",
    },
  ];

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <MainLayout title="Dashboard">
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {isDataLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg p-5">
                <div className="flex">
                  <Skeleton className="h-12 w-12 rounded-md" />
                  <div className="ml-5 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            <StatsCard
              title="Total Orders"
              value={dashboardData?.stats?.totalOrders || 0}
              change={{
                value: "8.2%",
                isPositive: true,
              }}
              icon="orders"
            />
            <StatsCard
              title="Completed Orders"
              value={dashboardData?.stats?.completedOrders || 0}
              change={{
                value: "12.5%",
                isPositive: true,
              }}
              icon="completed"
            />
            <StatsCard
              title="Average Completion Time"
              value={`${dashboardData?.stats?.avgCompletionTime || 42} min`}
              change={{
                value: "5.3%",
                isPositive: false,
              }}
              icon="time"
            />
            <StatsCard
              title="Active Drivers"
              value={dashboardData?.stats?.activeDrivers || 0}
              change={{
                value: "2",
                isPositive: true,
              }}
              icon="drivers"
            />
          </>
        )}
      </div>

      {isDataLoading ? (
        <div className="mt-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      ) : (
        <ActivityCard recentActivity={dashboardData?.orders || []} />
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {isDataLoading ? (
          <>
            <Skeleton className="h-[300px] rounded-lg" />
            <Skeleton className="h-[300px] rounded-lg" />
          </>
        ) : (
          <>
            <MapView deliveryLocations={deliveryLocations} />
            <PerformanceMetrics metrics={performanceMetrics} />
          </>
        )}
      </div>
    </MainLayout>
  );
}
