import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Driver } from "@/types/driver";

// Form schema
const orderFormSchema = z.object({
  customerName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  customerPhone: z.string().min(10, { message: "Please enter a valid phone number" }),
  deliveryAddress: z.string().min(5, { message: "Please enter a valid address" }),
  deliveryNotes: z.string().optional(),
  driverId: z.string().optional(),
  status: z.enum(["pending", "assigned", "in-transit", "completed", "canceled"]),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

interface AddOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editOrder?: any | null;
}

export default function AddOrderDialog({
  open,
  onOpenChange,
  editOrder = null,
}: AddOrderDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch drivers for assignment
  const { data: drivers = [] } = useQuery<Driver[]>({
    queryKey: ['/api/drivers'],
    enabled: open,
  });
  
  // Initialize form with default values or editOrder values if provided
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: editOrder ? {
      customerName: editOrder.customerName,
      customerPhone: editOrder.customerPhone,
      deliveryAddress: editOrder.deliveryAddress,
      deliveryNotes: editOrder.deliveryNotes || "",
      driverId: editOrder.driverId?.toString() || "",
      status: editOrder.status,
    } : {
      customerName: "",
      customerPhone: "",
      deliveryAddress: "",
      deliveryNotes: "",
      driverId: "",
      status: "pending",
    },
  });

  // Create or update order mutation
  const orderMutation = useMutation({
    mutationFn: async (data: OrderFormValues) => {
      if (editOrder) {
        // Update existing order
        const res = await apiRequest("PATCH", `/api/orders/${editOrder.id}`, data);
        return res.json();
      } else {
        // Create new order
        const res = await apiRequest("POST", "/api/orders", data);
        return res.json();
      }
    },
    onSuccess: () => {
      // Invalidate orders query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      
      // Show success toast
      toast({
        title: editOrder ? "Order updated" : "Order created",
        description: editOrder 
          ? `Order #${editOrder.id} has been updated` 
          : `New order has been created successfully`,
      });
      
      // Close dialog and reset form
      onOpenChange(false);
      form.reset();
      setIsSubmitting(false);
    },
    onError: (error) => {
      // Show error toast
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  function onSubmit(data: OrderFormValues) {
    setIsSubmitting(true);
    orderMutation.mutate(data);
  }

  // Handle status change and driver assignment logic
  const handleStatusChange = (status: string) => {
    form.setValue("status", status as any);
    
    // If changing to pending, clear the driver
    if (status === "pending") {
      form.setValue("driverId", "");
    }
    
    // If changing to assigned or in-transit and no driver is selected, show warning
    if ((status === "assigned" || status === "in-transit") && !form.getValues("driverId")) {
      toast({
        title: "Driver Required",
        description: "Please assign a driver to this order.",
        variant: "default",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{editOrder ? "Edit Order" : "Create New Order"}</DialogTitle>
          <DialogDescription>
            {editOrder 
              ? "Update the order details below" 
              : "Fill in the customer and delivery details to create a new order"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="123-456-7890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="deliveryAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St, City, State, Zip" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="deliveryNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Apartment number, gate code, special instructions, etc."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="driverId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign Driver (Optional)</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>
                      </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Status</FormLabel>
                    <Select 
                      onValueChange={handleStatusChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="in-transit">In Transit</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="canceled">Canceled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editOrder ? "Update Order" : "Create Order"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
