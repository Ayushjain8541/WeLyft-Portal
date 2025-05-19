import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import MainLayout from "@/components/layouts/main-layout";
import StatusBadge from "@/components/shared/status-badge";
import OrderDetailsDialog from "@/components/orders/order-details-dialog";
import { MapPin, Phone, Clock, FileText, CheckCircle } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderWithDriver } from "@/types/order";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function DriverOrders() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Fetch active orders for the driver
  const { data: activeOrders = [], isLoading: isActiveOrdersLoading } = useQuery({
    queryKey: ["/api/drivers/me/orders/active"],
    enabled: isAuthenticated,
  });

  // Fetch selected order details
  const { data: selectedOrder } = useQuery({
    queryKey: [`/api/orders/${selectedOrderId}`],
    enabled: !!selectedOrderId,
  });

  // Mutation to mark order as in-transit
  const startDeliveryMutation = useMutation({
    mutationFn: async (orderId: string | number) => {
      const res = await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status: "in-transit" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers/me/orders/active"] });
      toast({
        title: "Delivery started",
        description: "The order has been marked as in transit.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start delivery.",
        variant: "destructive",
      });
    },
  });

  // Mutation to mark order as completed
  const completeDeliveryMutation = useMutation({
    mutationFn: async (orderId: string | number) => {
      const res = await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status: "completed" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers/me/orders/active"] });
      toast({
        title: "Delivery completed",
        description: "The order has been marked as completed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete delivery.",
        variant: "destructive",
      });
    },
  });

  const handleOrderClick = (orderId: string | number) => {
    setSelectedOrderId(orderId);
    setDetailsDialogOpen(true);
  };

  const handleStartDelivery = (orderId: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    startDeliveryMutation.mutate(orderId);
  };

  const handleCompleteDelivery = (orderId: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    completeDeliveryMutation.mutate(orderId);
  };

  return (
    <MainLayout title="My Orders">
      <Tabs defaultValue="active" className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active Orders</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isActiveOrdersLoading ? (
              // Skeleton loading state
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-24 rounded-full" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                        <Skeleton className="h-4 flex-1" />
                      </div>
                      <div className="flex items-center">
                        <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                        <Skeleton className="h-4 flex-1" />
                      </div>
                      <div className="flex items-center">
                        <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                        <Skeleton className="h-4 flex-1" />
                      </div>
                      <Skeleton className="h-9 w-full mt-2" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : activeOrders.length > 0 ? (
              // Active orders
              activeOrders.map((order: OrderWithDriver) => (
                <Card 
                  key={order.id} 
                  className="shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleOrderClick(order.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-md font-medium">Order #{order.id}</CardTitle>
                      <StatusBadge status={order.status} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-start text-sm">
                        <MapPin className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{order.deliveryAddress}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{order.customerPhone}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      {order.deliveryNotes && (
                        <div className="flex items-start text-sm">
                          <FileText className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">{order.deliveryNotes}</span>
                        </div>
                      )}
                    </div>

                    {order.status === "assigned" ? (
                      <Button 
                        className="w-full" 
                        onClick={(e) => handleStartDelivery(order.id, e)}
                      >
                        Start Delivery
                      </Button>
                    ) : order.status === "in-transit" ? (
                      <Button 
                        className="w-full" 
                        variant="success"
                        onClick={(e) => handleCompleteDelivery(order.id, e)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Complete Delivery
                      </Button>
                    ) : (
                      <Badge className="w-full flex justify-center py-2" variant="outline">
                        {order.status === "completed" ? "Delivered" : "Processing"}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              // Empty state
              <div className="col-span-full flex flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                <CheckCircle className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No active orders</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  You don't have any active orders at the moment. Check back later.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="upcoming">
          <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Clock className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No upcoming orders</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              You don't have any upcoming orders scheduled. All assigned orders are shown in the Active tab.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <OrderDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        order={selectedOrder || null}
        onEdit={() => {}}
        drivers={[]}
        isAdmin={false}
      />
    </MainLayout>
  );
}
