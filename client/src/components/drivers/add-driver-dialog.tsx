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
  DialogTrigger,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Driver } from "@/types/driver";
import { Loader2 } from "lucide-react";

// Form schema
const driverFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  vehicleType: z.string().min(1, { message: "Please select a vehicle type" }),
  zone: z.string().min(1, { message: "Please assign a zone" }),
  status: z.enum(["active", "off-duty"]),
});

type DriverFormValues = z.infer<typeof driverFormSchema>;

interface AddDriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editDriver?: Driver | null;
}

export default function AddDriverDialog({
  open,
  onOpenChange,
  editDriver = null,
}: AddDriverDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form with default values or editDriver values if provided
  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: editDriver ? {
      name: editDriver.name,
      email: editDriver.email,
      phone: editDriver.phone,
      vehicleType: editDriver.vehicleType,
      zone: editDriver.zone,
      status: editDriver.status,
    } : {
      name: "",
      email: "",
      phone: "",
      vehicleType: "",
      zone: "",
      status: "active",
    },
  });

  // Create or update driver mutation
  const driverMutation = useMutation({
    mutationFn: async (data: DriverFormValues) => {
      if (editDriver) {
        // Update existing driver
        const res = await apiRequest("PATCH", `/api/drivers/${editDriver.id}`, data);
        return res.json();
      } else {
        // Create new driver
        const res = await apiRequest("POST", "/api/drivers", data);
        return res.json();
      }
    },
    onSuccess: () => {
      // Invalidate drivers query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['/api/drivers'] });
      
      // Show success toast
      toast({
        title: editDriver ? "Driver updated" : "Driver added",
        description: editDriver 
          ? `${form.getValues().name} has been updated` 
          : `${form.getValues().name} has been added to your driver list`,
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

  function onSubmit(data: DriverFormValues) {
    setIsSubmitting(true);
    driverMutation.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editDriver ? "Edit Driver" : "Add New Driver"}</DialogTitle>
          <DialogDescription>
            {editDriver 
              ? "Update the driver's information below" 
              : "Fill in the details to add a new driver to your team"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vehicleType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Delivery Van">Delivery Van</SelectItem>
                        <SelectItem value="Delivery Car">Delivery Car</SelectItem>
                        <SelectItem value="Electric Scooter">Electric Scooter</SelectItem>
                        <SelectItem value="Bicycle">Bicycle</SelectItem>
                        <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="zone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Zone</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select delivery zone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="North Zone">North Zone</SelectItem>
                        <SelectItem value="East Zone">East Zone</SelectItem>
                        <SelectItem value="South Zone">South Zone</SelectItem>
                        <SelectItem value="West Zone">West Zone</SelectItem>
                        <SelectItem value="Central Zone">Central Zone</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="off-duty">Off Duty</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                {editDriver ? "Update Driver" : "Add Driver"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
