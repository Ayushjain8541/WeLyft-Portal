import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import MainLayout from "@/components/layouts/main-layout";
import StatusBadge from "@/components/shared/status-badge";
import OrderDetailsDialog from "@/components/orders/order-details-dialog";
import { Calendar, MapPin, Clock, User } from "lucide-react";
import { format, compareDesc } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { OrderWithDriver } from "@/types/order";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

export default function DriverHistory() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Fetch order history for the driver
  const { data: orderHistory = [], isLoading: isHistoryLoading } = useQuery({
    queryKey: ["/api/drivers/me/orders/history"],
    enabled: isAuthenticated,
  });

  // Fetch selected order details
  const { data: selectedOrder } = useQuery({
    queryKey: [`/api/orders/${selectedOrderId}`],
    enabled: !!selectedOrderId,
  });

  const handleOrderClick = (orderId: string | number) => {
    setSelectedOrderId(orderId);
    setDetailsDialogOpen(true);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const filteredOrders = [...orderHistory].filter((order: OrderWithDriver) => {
    const matchesStatus = !statusFilter || order.status === statusFilter;
    const matchesSearch = !searchTerm || 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm);
    
    return matchesStatus && matchesSearch;
  }).sort((a: OrderWithDriver, b: OrderWithDriver) => {
    const dateA = new Date(a.updatedAt || a.createdAt);
    const dateB = new Date(b.updatedAt || b.createdAt);
    
    return sortOrder === "asc" 
      ? compareDesc(dateB, dateA) 
      : compareDesc(dateA, dateB);
  });

  return (
    <MainLayout title="Delivery History">
      <div className="mt-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative w-full sm:w-auto sm:flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <Input
              type="text"
              name="search"
              placeholder="Search orders..."
              className="block w-full pl-10"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as "asc" | "desc")}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest First</SelectItem>
              <SelectItem value="asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          {isHistoryLoading ? (
            <div className="p-4 space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-32" />
              </div>
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="py-4 space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-52" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order: OrderWithDriver) => (
                    <TableRow 
                      key={order.id}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                      onClick={() => handleOrderClick(order.id)}
                    >
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell className="max-w-xs truncate">{order.deliveryAddress}</TableCell>
                      <TableCell>{format(new Date(order.updatedAt || order.createdAt), "MMM dd, yyyy")}</TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No orders found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || statusFilter 
                  ? "Try adjusting your search filters to find what you're looking for." 
                  : "You haven't completed any deliveries yet."}
              </p>
            </div>
          )}
        </div>
      </div>

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
