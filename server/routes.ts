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
      // Get user ID
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get dashboard data
      const dashboards = await storage.getAllDashboards(userId);
      const dataSources = await storage.getAllDataSources(userId);
      const reports = await storage.getAllReports(userId);
      
      // Get some recent visualizations
      const allVisualizations = await storage.getAllVisualizations(userId);
      const recentVisualizations = allVisualizations.sort((a, b) => {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }).slice(0, 5);
      
      // Calculate stats
      const stats = {
        dashboardCount: dashboards.length,
        dataSourceCount: dataSources.length,
        reportCount: reports.length,
        visualizationCount: allVisualizations.length,
      };
      
      // Calculate usage metrics
      const publicDashboards = dashboards.filter(d => d.isPublic).length;
      const publicReports = reports.filter(r => r.isPublic).length;
      
      const metrics = {
        publicResourcePercentage: dashboards.length > 0 ? Math.round((publicDashboards / dashboards.length) * 100) : 0,
        dataSourceUtilization: dataSources.length > 0 ? Math.round((allVisualizations.length / dataSources.length) * 100) : 0,
        reportGeneration: reports.length > 0 ? publicReports : 0,
        teamCollaboration: 85 // Placeholder until we implement team activity tracking
      };
      
      res.json({
        recentDashboards: dashboards.slice(0, 5),
        recentVisualizations,
        stats,
        metrics
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Data Source routes
  app.get('/api/data-sources', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const dataSources = await storage.getAllDataSources(userId);
      res.json(dataSources);
    } catch (error) {
      console.error("Error fetching data sources:", error);
      res.status(500).json({ message: "Failed to fetch data sources" });
    }
  });

  app.post('/api/data-sources', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Validate request body
      const validatedData = insertDataSourceSchema.parse({
        ...req.body,
        userId
      });
      
      // Create data source
      const dataSource = await storage.createDataSource(validatedData);
      res.status(201).json(dataSource);
    } catch (error) {
      console.error("Error creating data source:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data source data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create data source" });
    }
  });

  app.patch('/api/data-sources/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const dataSourceId = parseInt(req.params.id);
      if (isNaN(dataSourceId)) {
        return res.status(400).json({ message: "Invalid data source ID" });
      }
      
      // Get the data source to check ownership
      const dataSource = await storage.getDataSourceById(dataSourceId);
      if (!dataSource) {
        return res.status(404).json({ message: "Data source not found" });
      }
      
      // Check if user owns the data source
      if (dataSource.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this data source" });
      }
      
      // Validate request body
      const updateSchema = z.object({
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        type: z.string().optional(), 
        config: z.record(z.any()).optional(),
        isPublic: z.boolean().optional()
      });
      
      const validatedData = updateSchema.parse(req.body);
      
      // Update data source
      const updatedDataSource = await storage.updateDataSource(dataSourceId, validatedData);
      
      res.json(updatedDataSource);
    } catch (error) {
      console.error("Error updating data source:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data source data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update data source" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboards', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const dashboards = await storage.getAllDashboards(userId);
      res.json(dashboards);
    } catch (error) {
      console.error("Error fetching dashboards:", error);
      res.status(500).json({ message: "Failed to fetch dashboards" });
    }
  });

  app.post('/api/dashboards', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Validate dashboard data
      const dashboardData = insertDashboardSchema.parse({
        ...req.body,
        userId,
        layout: req.body.layout || {} // Default empty layout
      });
      
      // Create dashboard
      const dashboard = await storage.createDashboard(dashboardData);
      res.status(201).json(dashboard);
    } catch (error) {
      console.error("Error creating dashboard:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid dashboard data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create dashboard" });
    }
  });

  app.get('/api/dashboards/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const dashboardId = parseInt(req.params.id);
      if (isNaN(dashboardId)) {
        return res.status(400).json({ message: "Invalid dashboard ID" });
      }
      
      // Get the dashboard with visualizations
      const dashboard = await storage.getDashboardWithVisualizations(dashboardId);
      if (!dashboard) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      
      // Check if user has access to the dashboard
      if (dashboard.userId !== userId && !dashboard.isPublic) {
        return res.status(403).json({ message: "Not authorized to access this dashboard" });
      }
      
      res.json(dashboard);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      res.status(500).json({ message: "Failed to fetch dashboard" });
    }
  });

  // Visualization routes
  app.get('/api/visualizations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const visualizations = await storage.getAllVisualizations(userId);
      res.json(visualizations);
    } catch (error) {
      console.error("Error fetching visualizations:", error);
      res.status(500).json({ message: "Failed to fetch visualizations" });
    }
  });

  app.post('/api/visualizations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Validate visualization data
      const visualizationData = insertVisualizationSchema.parse({
        ...req.body,
        userId,
        config: req.body.config || {} // Default empty config
      });
      
      // Create visualization
      const visualization = await storage.createVisualization(visualizationData);
      res.status(201).json(visualization);
    } catch (error) {
      console.error("Error creating visualization:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid visualization data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create visualization" });
    }
  });

  app.get('/api/visualizations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const visualizationId = parseInt(req.params.id);
      if (isNaN(visualizationId)) {
        return res.status(400).json({ message: "Invalid visualization ID" });
      }
      
      // Get the visualization
      const visualization = await storage.getVisualizationById(visualizationId);
      if (!visualization) {
        return res.status(404).json({ message: "Visualization not found" });
      }
      
      // Check if user owns the visualization or if it belongs to a public dashboard
      if (visualization.userId !== userId) {
        // Check if visualization belongs to a public dashboard
        if (visualization.dashboardId) {
          const dashboard = await storage.getDashboardById(visualization.dashboardId);
          if (!dashboard || !dashboard.isPublic) {
            return res.status(403).json({ message: "Not authorized to access this visualization" });
          }
        } else {
          return res.status(403).json({ message: "Not authorized to access this visualization" });
        }
      }
      
      res.json(visualization);
    } catch (error) {
      console.error("Error fetching visualization:", error);
      res.status(500).json({ message: "Failed to fetch visualization" });
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
