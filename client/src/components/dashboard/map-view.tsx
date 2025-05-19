import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeliveryLocation {
  id: string | number;
  address: string;
  lat: number;
  lng: number;
  status: "pending" | "assigned" | "in-transit" | "completed" | "canceled";
}

interface MapViewProps {
  deliveryLocations: DeliveryLocation[];
  className?: string;
}

export default function MapView({ deliveryLocations, className }: MapViewProps) {
  const mapPoints = useMemo(() => {
    return deliveryLocations.map((loc) => {
      // Convert lat/lng to relative positions on the map (simplified)
      const x = ((loc.lng + 180) / 360) * 100; // Convert longitude to x percent
      const y = ((90 - loc.lat) / 180) * 100; // Convert latitude to y percent
      
      // Status-based colors
      const statusColors = {
        pending: "text-amber-500",
        assigned: "text-blue-500",
        "in-transit": "text-blue-500",
        completed: "text-green-500",
        canceled: "text-red-500",
      };
      
      return { ...loc, x, y, colorClass: statusColors[loc.status] };
    });
  }, [deliveryLocations]);

  return (
    <Card className={cn("bg-white dark:bg-gray-800 overflow-hidden", className)}>
      <CardHeader className="px-4 py-5 sm:px-6">
        <CardTitle className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
          Active Deliveries Map
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-0 sm:px-6 pb-6">
        <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-700 overflow-hidden rounded-lg relative">
          {/* Simplified map visualization */}
          <div className="w-full h-full bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/0,0,1/600x400?access_token=pk.placeholder')] bg-cover bg-center">
            {/* Pins for each delivery location */}
            {mapPoints.map((point) => (
              <div 
                key={point.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ 
                  left: `${point.x}%`, 
                  top: `${point.y}%`,
                }}
              >
                <MapPin className={cn("h-6 w-6", point.colorClass)} />
              </div>
            ))}
            
            {/* Overlay instructions */}
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 text-white">
              <span className="bg-black bg-opacity-50 px-4 py-2 rounded">
                Map View (Interactive in production)
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
