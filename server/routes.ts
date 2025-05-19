import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import { 
  insertDataSourceSchema, 
  insertDashboardSchema, 
  insertVisualizationSchema, 
  insertReportSchema, 
  insertTeamSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware setup
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        ...user,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || "User"
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard data
  app.get('/api/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      // Get user role
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Only admins can access dashboard data
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to access dashboard data" });
      }
      
      // Get dashboard data
      const orders = await storage.getRecentOrders(5);
      const stats = {
        totalOrders: await storage.getOrderCount(),
        completedOrders: await storage.getCompletedOrderCount(),
        avgCompletionTime: 42, // Placeholder, would calculate from actual data
        activeDrivers: await storage.getActiveDriverCount()
      };
      
      const metrics = {
        completionRate: 85,
        onTimeRate: 92,
        driverEfficiency: 78,
        customerSatisfaction: 94
      };
      
      res.json({
        orders,
        stats,
        metrics
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Driver routes
  app.get('/api/drivers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to access driver data" });
      }
      
      const drivers = await storage.getAllDrivers();
      res.json(drivers);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      res.status(500).json({ message: "Failed to fetch drivers" });
    }
  });

  app.post('/api/drivers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to create drivers" });
      }
      
      // Validate request body
      const validatedData = insertDriverSchema.parse(req.body);
      
      // Create driver
      const driver = await storage.createDriver(validatedData);
      res.status(201).json(driver);
    } catch (error) {
      console.error("Error creating driver:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid driver data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create driver" });
    }
  });

  app.patch('/api/drivers/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to update drivers" });
      }
      
      const driverId = parseInt(req.params.id);
      if (isNaN(driverId)) {
        return res.status(400).json({ message: "Invalid driver ID" });
      }
      
      // Validate request body
      const validatedData = insertDriverSchema.partial().parse(req.body);
      
      // Update driver
      const driver = await storage.updateDriver(driverId, validatedData);
      if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
      }
      
      res.json(driver);
    } catch (error) {
      console.error("Error updating driver:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid driver data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update driver" });
    }
  });

  // Driver Profile Routes for logged-in drivers
  app.get('/api/drivers/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.role !== "driver") {
        return res.status(403).json({ message: "Not a driver account" });
      }
      
      const driver = await storage.getDriverByUserId(userId);
      if (!driver) {
        return res.status(404).json({ message: "Driver profile not found" });
      }
      
      res.json(driver);
    } catch (error) {
      console.error("Error fetching driver profile:", error);
      res.status(500).json({ message: "Failed to fetch driver profile" });
    }
  });

  app.patch('/api/drivers/me/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.role !== "driver") {
        return res.status(403).json({ message: "Not a driver account" });
      }
      
      const driver = await storage.getDriverByUserId(userId);
      if (!driver) {
        return res.status(404).json({ message: "Driver profile not found" });
      }
      
      // Validate profile data
      const profileSchema = z.object({
        name: z.string().min(2).optional(),
        email: z.string().email().optional(),
        phone: z.string().min(10).optional(),
      });
      
      const validatedData = profileSchema.parse(req.body);
      
      // Update driver profile
      const updatedDriver = await storage.updateDriver(driver.id, validatedData);
      res.json(updatedDriver);
    } catch (error) {
      console.error("Error updating driver profile:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.patch('/api/drivers/me/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.role !== "driver") {
        return res.status(403).json({ message: "Not a driver account" });
      }
      
      const driver = await storage.getDriverByUserId(userId);
      if (!driver) {
        return res.status(404).json({ message: "Driver profile not found" });
      }
      
      // Validate settings data
      const settingsSchema = z.object({
        status: z.enum(["active", "off-duty"]).optional(),
        preferredZone: z.string().min(1).optional(),
        notifications: z.boolean().optional(),
      });
      
      const validatedData = settingsSchema.parse(req.body);
      
      // Map settings to driver update
      const driverUpdate: any = {};
      if (validatedData.status) driverUpdate.status = validatedData.status;
      if (validatedData.preferredZone) driverUpdate.zone = validatedData.preferredZone;
      if (validatedData.notifications !== undefined) driverUpdate.notifications = validatedData.notifications;
      
      // Update driver settings
      const updatedDriver = await storage.updateDriver(driver.id, driverUpdate);
      res.json(updatedDriver);
    } catch (error) {
      console.error("Error updating driver settings:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid settings data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Driver order routes
  app.get('/api/drivers/me/orders/active', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.role !== "driver") {
        return res.status(403).json({ message: "Not a driver account" });
      }
      
      const driver = await storage.getDriverByUserId(userId);
      if (!driver) {
        return res.status(404).json({ message: "Driver profile not found" });
      }
      
      // Get active orders for driver
      const orders = await storage.getDriverActiveOrders(driver.id);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching driver orders:", error);
      res.status(500).json({ message: "Failed to fetch driver orders" });
    }
  });

  app.get('/api/drivers/me/orders/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.role !== "driver") {
        return res.status(403).json({ message: "Not a driver account" });
      }
      
      const driver = await storage.getDriverByUserId(userId);
      if (!driver) {
        return res.status(404).json({ message: "Driver profile not found" });
      }
      
      // Get order history for driver
      const orders = await storage.getDriverOrderHistory(driver.id);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching driver order history:", error);
      res.status(500).json({ message: "Failed to fetch driver order history" });
    }
  });

  app.get('/api/drivers/me/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.role !== "driver") {
        return res.status(403).json({ message: "Not a driver account" });
      }
      
      const driver = await storage.getDriverByUserId(userId);
      if (!driver) {
        return res.status(404).json({ message: "Driver profile not found" });
      }
      
      // Get driver stats
      const deliveredOrders = await storage.getDriverCompletedOrderCount(driver.id);
      const totalRatings = 42; // Placeholder, would get from actual rating data
      const completionRate = 98; 
      const onTimeRate = 95;
      const avgDeliveryTime = 32;
      
      res.json({
        deliveredOrders,
        totalRatings,
        completionRate,
        onTimeRate,
        avgDeliveryTime
      });
    } catch (error) {
      console.error("Error fetching driver stats:", error);
      res.status(500).json({ message: "Failed to fetch driver stats" });
    }
  });

  // Order routes
  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to access orders" });
      }
      
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(403).json({ message: "Not authorized to access orders" });
      }
      
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      const order = await storage.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // For drivers, check if order is assigned to them
      if (user.role === "driver") {
        const driver = await storage.getDriverByUserId(userId);
        if (!driver || order.driverId !== driver.id) {
          return res.status(403).json({ message: "Not authorized to access this order" });
        }
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to create orders" });
      }
      
      // Validate request body
      const validatedData = insertOrderSchema.parse(req.body);
      
      // Create order
      const order = await storage.createOrder(validatedData);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.patch('/api/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to update orders" });
      }
      
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      // Validate request body
      const validatedData = insertOrderSchema.partial().parse(req.body);
      
      // Update order
      const order = await storage.updateOrder(orderId, validatedData);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error updating order:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  app.patch('/api/orders/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      // Validate status
      const statusSchema = z.object({
        status: z.enum(["pending", "assigned", "in-transit", "completed", "canceled"]),
      });
      
      const { status } = statusSchema.parse(req.body);
      
      // Get the order
      const order = await storage.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // For drivers, check if order is assigned to them and only allow status updates to 'in-transit' or 'completed'
      if (user.role === "driver") {
        const driver = await storage.getDriverByUserId(userId);
        if (!driver || order.driverId !== driver.id) {
          return res.status(403).json({ message: "Not authorized to update this order" });
        }
        
        if (status !== "in-transit" && status !== "completed") {
          return res.status(403).json({ message: "Drivers can only mark orders as in-transit or completed" });
        }
      }
      
      // Update order status
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid status", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  app.patch('/api/orders/:id/assign', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to assign orders" });
      }
      
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      // Validate driver ID
      const assignSchema = z.object({
        driverId: z.string().transform((val) => val === "" ? null : parseInt(val)),
      });
      
      const { driverId } = assignSchema.parse(req.body);
      
      // If driverId is not null, check if driver exists
      if (driverId !== null) {
        const driver = await storage.getDriverById(driverId);
        if (!driver) {
          return res.status(404).json({ message: "Driver not found" });
        }
      }
      
      // Assign driver to order
      const updatedOrder = await storage.assignOrderToDriver(orderId, driverId);
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error assigning driver to order:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid driver ID", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to assign driver to order" });
    }
  });
  
  // Reports API
  app.get('/api/reports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to access reports" });
      }
      
      // Period could be sent as a query parameter
      const period = req.query.period || "30";
      const compareWith = req.query.compareWith || "previous";
      
      // Get report data
      const driverPerformance = [
        { name: "Alex Johnson", orders: 184, completion: 98.4, rating: 5.0 },
        { name: "Sarah Kim", orders: 156, completion: 97.2, rating: 4.9 },
        { name: "Marcus Chen", orders: 122, completion: 94.5, rating: 4.7 },
        { name: "Maria Rodriguez", orders: 95, completion: 96.8, rating: 4.8 },
        { name: "James Wilson", orders: 88, completion: 93.6, rating: 4.6 },
      ];
      
      const dailyVolume = [
        { name: "Mon", completed: 65, total: 78 },
        { name: "Tue", completed: 75, total: 82 },
        { name: "Wed", completed: 85, total: 91 },
        { name: "Thu", completed: 78, total: 88 },
        { name: "Fri", completed: 90, total: 95 },
        { name: "Sat", completed: 43, total: 50 },
        { name: "Sun", completed: 35, total: 40 },
      ];
      
      const zonePerformance = [
        { name: "North Zone", orders: 120, onTime: 92 },
        { name: "East Zone", orders: 98, onTime: 88 },
        { name: "South Zone", orders: 86, onTime: 95 },
        { name: "West Zone", orders: 92, onTime: 89 },
        { name: "Central Zone", orders: 110, onTime: 94 },
      ];
      
      res.json({
        period,
        compareWith,
        driverPerformance,
        dailyVolume,
        zonePerformance
      });
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  // Create an HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
