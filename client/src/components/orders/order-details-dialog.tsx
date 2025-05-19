import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/shared/status-badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, PhoneCall, User, Clock, FileText, Check, Edit } from "lucide-react";
import { format } from "date-fns";
import { Order } from "@/types/order";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Driver } from "@/types/driver";

interface OrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onEdit: (order: Order) => void;
  drivers: Driver[];
  isAdmin: boolean;
}

export default function OrderDetailsDialog({
  open,
  onOpenChange,
  order,
  onEdit,
  drivers,
  isAdmin
}: OrderDetailsDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
  
  // Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (data: { status: string }) => {
      if (!order) return null;
      const res = await apiRequest("PATCH", `/api/orders/${order.id}/status`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      queryClient.invalidateQueries({ queryKey: [`/api/orders/${order?.id}`] });
      
      // Show success toast
      toast({
        title: "Order status updated",
        description: `Order #${order?.id} status has been updated.`,
      });
      
      setUpdatingStatus(false);
    },
    onError: (error) => {
      toast({
        title: "Error updating status",
        description: error.message || "Failed to update order status. Please try again.",
        variant: "destructive",
      });
      setUpdatingStatus(false);
    },
  });
  
  // Assign driver mutation
  const assignDriverMutation = useMutation({
    mutationFn: async (data: { driverId: string }) => {
      if (!order) return null;
      const res = await apiRequest("PATCH", `/api/orders/${order.id}/assign`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      queryClient.invalidateQueries({ queryKey: [`/api/orders/${order?.id}`] });
      
      // Show success toast
      toast({
        title: "Driver assigned",
        description: `A driver has been assigned to order #${order?.id}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error assigning driver",
        description: error.message || "Failed to assign driver. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Complete order handler (for drivers)
  const handleCompleteOrder = () => {
    setUpdatingStatus(true);
    updateStatusMutation.mutate({ status: "completed" });
  };
  
  // Update status handler (for admins)
  const handleStatusChange = (status: string) => {
    setUpdatingStatus(true);
    updateStatusMutation.mutate({ status });
  };
  
  // Assign driver handler (for admins)
  const handleAssignDriver = (driverId: string) => {
    assignDriverMutation.mutate({ driverId });
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order #{order.id}</span>
            <StatusBadge status={order.status} />
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          {/* Customer Details */}
          <div className="space-y-2">
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">Customer Information</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md space-y-2">
              <div className="flex items-center text-sm">
                <User className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-gray-100">{order.customerName}</span>
              </div>
              <div className="flex items-center text-sm">
                <PhoneCall className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-gray-100">{order.customerPhone}</span>
              </div>
            </div>
          </div>
          
          {/* Delivery Details */}
          <div className="space-y-2">
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">Delivery Information</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md space-y-2">
              <div className="flex items-start text-sm">
                <MapPin className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5" />
                <span className="text-gray-900 dark:text-gray-100">{order.deliveryAddress}</span>
              </div>
              {order.deliveryNotes && (
                <div className="flex items-start text-sm">
                  <FileText className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5" />
                  <span className="text-gray-900 dark:text-gray-100">{order.deliveryNotes}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Order Timing */}
          <div className="space-y-2">
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">Order Timing</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md space-y-2">
              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-gray-100">
                  Created: {format(new Date(order.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                </span>
              </div>
              {order.status === "completed" && (
                <div className="flex items-center text-sm">
                  <Clock className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-gray-100">
                    Completed: {format(new Date(order.updatedAt), "MMM dd, yyyy 'at' h:mm a")}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Driver Assignment (Admin only) */}
          {isAdmin && (
            <div className="space-y-2">
              <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">Driver Assignment</h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                <Select 
                  value={order.driverId?.toString() || ""} 
                  onValueChange={handleAssignDriver}
                  disabled={order.status === "completed" || order.status === "canceled"}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Assign Driver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {drivers
                      .filter(driver => driver.status === "active")
                      .map(driver => (
                        <SelectItem key={driver.id} value={driver.id.toString()}>
                          {driver.name}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          {/* Status Update (Admin only) */}
          {isAdmin && (
            <div className="space-y-2">
              <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">Update Status</h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                <Select 
                  value={order.status} 
                  onValueChange={handleStatusChange}
                  disabled={updatingStatus}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in-transit">In Transit</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="space-x-2">
          {/* Driver can mark as completed */}
          {!isAdmin && order.status !== "completed" && order.status !== "canceled" && (
            <Button
              onClick={handleCompleteOrder}
              disabled={updatingStatus}
              className="gap-2"
            >
              <Check className="h-4 w-4" /> Mark as Completed
            </Button>
          )}
          
          {/* Admin can edit orders */}
          {isAdmin && (
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                onEdit(order);
              }}
              className="gap-2"
            >
              <Edit className="h-4 w-4" /> Edit Order
            </Button>
          )}
          
          <Button
            variant={isAdmin ? "default" : "outline"}
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
