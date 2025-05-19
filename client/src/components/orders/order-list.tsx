import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusBadge from "@/components/shared/status-badge";
import { Order } from "@/types/order";
import { PhoneCall, MapPin, Calendar, User, ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface OrderListProps {
  orders: Order[];
  onOrderClick: (orderId: string | number) => void;
}

export default function OrderList({ orders, onOrderClick }: OrderListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Filter orders based on search term and status filter
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchTerm === "" ||
      order.id.toString().includes(searchTerm) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="mt-4 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
        <div className="-ml-4 -mt-2 flex items-center justify-between flex-wrap sm:flex-nowrap">
          <div className="ml-4 mt-2">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
              All Orders
            </h3>
          </div>
          <div className="ml-4 mt-2 flex-shrink-0">
            <div className="flex space-x-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <Input
                  type="text"
                  name="search"
                  id="search"
                  className="block w-full pl-10 pr-3 py-2"
                  placeholder="Search orders"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in-transit">In Transit</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
      <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <li
              key={order.id}
              className="block hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => onOrderClick(order.id)}
            >
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="truncate">
                    <div className="flex">
                      <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">
                        Order #{order.id}
                      </p>
                      <p className="ml-1 flex-shrink-0 font-normal text-gray-500 dark:text-gray-400">
                        to {order.customerName}
                      </p>
                    </div>
                    <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                      <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                        <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                        {order.deliveryAddress}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                        <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                        Created on {format(new Date(order.createdAt), "MMM dd, yyyy")}
                      </div>
                    </div>
                  </div>
                  <div className="ml-5 flex-shrink-0 flex items-center">
                    <StatusBadge status={order.status} />
                    <ChevronRight className="ml-5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <PhoneCall className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                      {order.customerPhone}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                    <div className="flex items-center">
                      <User className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                      {order.driverName || "Unassigned"}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))
        ) : (
          <li className="px-4 py-4 sm:px-6 text-center text-gray-500 dark:text-gray-400">
            No orders found. Try adjusting your filters or create a new order.
          </li>
        )}
      </ul>
    </div>
  );
}
