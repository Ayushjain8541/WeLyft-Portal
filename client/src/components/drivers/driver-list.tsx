import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil, Truck, MapPin, Star } from "lucide-react";
import { Driver } from "@/types/driver";
import { Badge } from "@/components/ui/badge";

interface DriverListProps {
  drivers: Driver[];
  onEdit?: (driver: Driver) => void;
}

export default function DriverList({ drivers, onEdit }: DriverListProps) {
  // Split drivers by status for better organization
  const { activeDrivers, inactiveDrivers } = useMemo(() => {
    const active = drivers.filter(driver => driver.status === "active");
    const inactive = drivers.filter(driver => driver.status !== "active");
    return { activeDrivers: active, inactiveDrivers: inactive };
  }, [drivers]);

  const allDrivers = [...activeDrivers, ...inactiveDrivers];

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
        {allDrivers.length > 0 ? (
          allDrivers.map((driver) => (
            <li key={driver.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={driver.profileImageUrl} alt={driver.name} />
                        <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                        {driver.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {driver.id} • Working since {new Date(driver.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Badge 
                      variant={driver.status === "active" ? "success" : "secondary"}
                      className="text-xs px-2.5 py-0.5"
                    >
                      {driver.status === "active" ? "Active" : "Off duty"}
                    </Badge>
                    <div className="flex">
                      <Button 
                        size="icon" 
                        onClick={() => onEdit?.(driver)}
                        variant="outline"
                        className="h-8 w-8 rounded-full"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit driver</span>
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex sm:space-x-4">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Truck className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                      {driver.vehicleType}
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                      <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                      {driver.zone}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                    <div className="flex items-center">
                      <span className="text-gray-900 dark:text-gray-100 font-medium">{driver.rating}</span>
                      <div className="ml-1 flex">
                        <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
                      </div>
                    </div>
                    <span className="ml-2">• {driver.activeOrders} active orders</span>
                  </div>
                </div>
              </div>
            </li>
          ))
        ) : (
          <li className="px-4 py-4 sm:px-6 text-center text-gray-500 dark:text-gray-400">
            No drivers found. Add your first driver to get started.
          </li>
        )}
      </ul>
    </div>
  );
}
