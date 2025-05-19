import { useState } from "react";
import MainLayout from "@/components/layouts/main-layout";
import OrderList from "@/components/orders/order-list";
import AddOrderDialog from "@/components/orders/add-order-dialog";
import OrderDetailsDialog from "@/components/orders/order-details-dialog";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { Order } from "@/types/order";
import { Driver } from "@/types/driver";
import { Skeleton } from "@/components/ui/skeleton";

export default function Orders() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | string | null>(null);
  const [editOrder, setEditOrder] = useState<Order | null>(null);

  // Fetch orders
  const { data: orders = [], isLoading: isOrdersLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });

  // Fetch drivers (for order assignment)
  const { data: drivers = [] } = useQuery<Driver[]>({
    queryKey: ['/api/drivers'],
  });

  // Fetch selected order details when needed
  const { data: selectedOrder, isLoading: isOrderDetailsLoading } = useQuery<Order>({
    queryKey: [`/api/orders/${selectedOrderId}`],
    enabled: !!selectedOrderId,
  });

  const handleOrderClick = (orderId: string | number) => {
    setSelectedOrderId(orderId);
    setDetailsDialogOpen(true);
  };

  const handleEditOrder = (order: Order) => {
    setEditOrder(order);
    setAddDialogOpen(true);
  };

  const handleAddDialogChange = (open: boolean) => {
    setAddDialogOpen(open);
    if (!open) {
      setEditOrder(null);
    }
  };

  return (
    <MainLayout title="Orders">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Orders</h1>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Order
        </Button>
      </div>

      {isOrdersLoading ? (
        <div className="mt-4">
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700">
              <Skeleton className="h-6 w-32" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between">
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="mt-2 flex justify-between">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <OrderList orders={orders} onOrderClick={handleOrderClick} />
      )}

      <AddOrderDialog
        open={addDialogOpen}
        onOpenChange={handleAddDialogChange}
        editOrder={editOrder}
      />

      <OrderDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        order={selectedOrder || null}
        onEdit={handleEditOrder}
        drivers={drivers}
        isAdmin={true}
      />
    </MainLayout>
  );
}
