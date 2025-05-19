import { useState } from "react";
import MainLayout from "@/components/layouts/main-layout";
import DriverList from "@/components/drivers/driver-list";
import AddDriverDialog from "@/components/drivers/add-driver-dialog";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { Driver } from "@/types/driver";
import { Skeleton } from "@/components/ui/skeleton";

export default function Drivers() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDriver, setEditDriver] = useState<Driver | null>(null);

  const { data: drivers = [], isLoading } = useQuery<Driver[]>({
    queryKey: ['/api/drivers'],
  });

  const handleEditDriver = (driver: Driver) => {
    setEditDriver(driver);
    setAddDialogOpen(true);
  };

  const handleAddDialogChange = (open: boolean) => {
    setAddDialogOpen(open);
    if (!open) {
      setEditDriver(null);
    }
  };

  return (
    <MainLayout title="Drivers">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Drivers</h1>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Driver
        </Button>
      </div>

      {isLoading ? (
        <div className="mt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-4 shadow rounded-md mb-4">
              <div className="flex justify-between">
                <div className="flex">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="ml-4 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
              <div className="mt-4 flex justify-between">
                <div className="flex space-x-4">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <DriverList drivers={drivers} onEdit={handleEditDriver} />
        </div>
      )}

      <AddDriverDialog
        open={addDialogOpen}
        onOpenChange={handleAddDialogChange}
        editDriver={editDriver}
      />
    </MainLayout>
  );
}
