import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StatusBadge from "@/components/shared/status-badge";
import { MapPin, Clock } from "lucide-react";
import { OrderWithDriver } from "@/types/order";
import { formatDistanceToNow } from "date-fns";

interface ActivityCardProps {
  recentActivity: OrderWithDriver[];
}

export default function ActivityCard({ recentActivity }: ActivityCardProps) {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Recent Activity</h2>
      
      <div className="mt-4 shadow sm:rounded-lg">
        <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:px-6">
          <div className="-ml-4 -mt-2 flex items-center justify-between flex-wrap sm:flex-nowrap">
            <div className="ml-4 mt-2">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                Order Status Updates
              </h3>
            </div>
            <div className="ml-4 mt-2 flex-shrink-0">
              <a 
                href="#" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={(e) => e.preventDefault()}
              >
                View All
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700">
          <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentActivity.length > 0 ? (
              recentActivity.map((order) => (
                <li key={order.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Avatar>
                          <AvatarImage src={order.driver?.profileImageUrl} alt={order.driver?.name || "Driver"} />
                          <AvatarFallback>{order.driver?.name?.charAt(0) || "D"}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                          Order #{order.id}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {order.driver 
                            ? `Delivered by ${order.driver.name}` 
                            : "Pending assignment"}
                        </div>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                        {order.deliveryAddress}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                      <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                      {order.status === "completed" 
                        ? `Delivered ${formatDistanceToNow(new Date(order.updatedAt), { addSuffix: true })}` 
                        : `Created ${formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}`}
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-4 sm:px-6 text-center text-gray-500 dark:text-gray-400">
                No recent activity
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
