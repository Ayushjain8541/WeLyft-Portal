export interface Order {
  id: string | number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryNotes?: string;
  status: "pending" | "assigned" | "in-transit" | "completed" | "canceled";
  driverId?: string | number;
  driverName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderWithDriver extends Order {
  driver?: {
    id: string | number;
    name: string;
    profileImageUrl?: string;
    phone?: string;
  };
}
