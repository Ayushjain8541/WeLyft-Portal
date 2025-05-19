export interface Driver {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  profileImageUrl?: string;
  vehicleType: string;
  zone: string;
  status: "active" | "off-duty";
  rating: number;
  activeOrders: number;
  createdAt: string;
  updatedAt: string;
}
