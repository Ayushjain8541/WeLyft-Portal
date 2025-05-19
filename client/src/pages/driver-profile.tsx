import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import MainLayout from "@/components/layouts/main-layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Loader2, Star, Package, CheckCircle, Award, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Form schema for profile
const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
});

// Form schema for settings
const settingsFormSchema = z.object({
  notifications: z.boolean(),
  status: z.enum(["active", "off-duty"]),
  preferredZone: z.string().min(1, { message: "Please select a preferred zone" }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function DriverProfile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Fetch driver profile data
  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ["/api/drivers/me"],
    enabled: isAuthenticated,
  });

  // Fetch driver stats
  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ["/api/drivers/me/stats"],
    enabled: isAuthenticated,
  });

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
    values: profileData ? {
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
    } : undefined,
  });

  // Settings form
  const settingsForm = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      notifications: true,
      status: "active",
      preferredZone: "",
    },
    values: profileData ? {
      notifications: profileData.notifications ?? true,
      status: profileData.status,
      preferredZone: profileData.zone,
    } : undefined,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest("PATCH", "/api/drivers/me/profile", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: SettingsFormValues) => {
      const res = await apiRequest("PATCH", "/api/drivers/me/settings", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Your settings have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Form submission handlers
  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  const onSettingsSubmit = (data: SettingsFormValues) => {
    updateSettingsMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <MainLayout title="Driver Profile">
      <div className="space-y-6 mt-6">
        {/* Profile Overview Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profileData?.profileImageUrl} alt={profileData?.name || "Driver"} />
                  <AvatarFallback className="text-2xl">{profileData?.name?.charAt(0) || "D"}</AvatarFallback>
                </Avatar>
                <div className="mt-2 flex items-center">
                  <Star className="text-yellow-400 h-5 w-5 fill-yellow-400" />
                  <span className="ml-1 font-semibold text-gray-900 dark:text-gray-100">
                    {profileData?.rating?.toFixed(1) || "4.8"}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">
                    ({statsData?.totalRatings || "42"} ratings)
                  </span>
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex-1 space-y-2 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {isProfileLoading ? <Skeleton className="h-8 w-40 mx-auto md:mx-0" /> : profileData?.name}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Driver ID: {profileData?.id || "N/A"}
                </p>
                
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center md:justify-start">
                      <Package className="text-primary h-5 w-5 mr-1" />
                      <span className="font-semibold">{statsData?.deliveredOrders || "0"}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Deliveries</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center md:justify-start">
                      <CheckCircle className="text-green-500 h-5 w-5 mr-1" />
                      <span className="font-semibold">{statsData?.completionRate || "98"}%</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Completion</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center md:justify-start">
                      <Award className="text-amber-500 h-5 w-5 mr-1" />
                      <span className="font-semibold">{statsData?.onTimeRate || "95"}%</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">On-time</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center md:justify-start">
                      <Clock className="text-blue-500 h-5 w-5 mr-1" />
                      <span className="font-semibold">{statsData?.avgDeliveryTime || "32"} min</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Time</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Profile Edit and Settings */}
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          {/* Profile Edit Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <FormField
                      control={profileForm.control}
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
                    
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="john@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="(123) 456-7890" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="border p-4 rounded-md bg-gray-50 dark:bg-gray-800">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Vehicle information and identity verification can only be updated by an administrator. 
                        Please contact your supervisor if you need to change your vehicle or update your documents.
                      </p>
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                      className="w-full md:w-auto"
                    >
                      {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Settings</CardTitle>
                <CardDescription>
                  Manage your availability and delivery preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...settingsForm}>
                  <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <FormField
                        control={settingsForm.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Availability Status</FormLabel>
                                <FormDescription>
                                  Set your current availability for deliveries
                                </FormDescription>
                              </div>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="off-duty">Off Duty</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={settingsForm.control}
                        name="preferredZone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Zone</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your preferred zone" />
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
                            <FormDescription>
                              You will be prioritized for orders in this zone when available
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Separator />
                      
                      <FormField
                        control={settingsForm.control}
                        name="notifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Notifications
                              </FormLabel>
                              <FormDescription>
                                Receive notifications for new orders and updates
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={updateSettingsMutation.isPending}
                      className="w-full md:w-auto"
                    >
                      {updateSettingsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Settings
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
