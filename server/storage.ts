import { 
  users, 
  dataSources,
  dashboards,
  visualizations,
  reports,
  teams,
  teamMembers,
  type User, 
  type UpsertUser,
  type DataSource,
  type InsertDataSource,
  type Dashboard,
  type InsertDashboard,
  type Visualization,
  type InsertVisualization,
  type Report,
  type InsertReport,
  type Team,
  type InsertTeam,
  type TeamMember,
  type InsertTeamMember
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, count, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Driver management operations
  getAllDrivers(): Promise<any[]>;
  getDriverById(id: number | string): Promise<any | undefined>;
  getDriverByUserId(userId: string): Promise<any | undefined>;
  createDriver(driver: any): Promise<any>;
  updateDriver(id: number | string, data: any): Promise<any | undefined>;
  deleteDriver(id: number | string): Promise<boolean>;
  
  // Order management operations
  getAllOrders(): Promise<any[]>;
  getOrderById(id: number | string): Promise<any | undefined>;
  createOrder(order: any): Promise<any>;
  updateOrderStatus(id: number | string, status: string): Promise<any | undefined>;
  assignOrderToDriver(orderId: number | string, driverId: number | string): Promise<any | undefined>;
  
  // Data Source operations
  getAllDataSources(userId: string, includePublic?: boolean): Promise<DataSource[]>;
  getDataSourceById(id: number): Promise<DataSource | undefined>;
  createDataSource(dataSource: InsertDataSource): Promise<DataSource>;
  updateDataSource(id: number, data: Partial<DataSource>): Promise<DataSource | undefined>;
  deleteDataSource(id: number): Promise<boolean>;
  
  // Dashboard operations
  getAllDashboards(userId: string, includePublic?: boolean): Promise<Dashboard[]>;
  getDashboardById(id: number): Promise<Dashboard | undefined>;
  getDashboardWithVisualizations(id: number): Promise<any | undefined>;
  createDashboard(dashboard: InsertDashboard): Promise<Dashboard>;
  updateDashboard(id: number, data: Partial<Dashboard>): Promise<Dashboard | undefined>;
  deleteDashboard(id: number): Promise<boolean>;
  
  // Visualization operations
  getAllVisualizations(userId: string): Promise<Visualization[]>;
  getVisualizationById(id: number): Promise<Visualization | undefined>;
  getVisualizationsByDashboardId(dashboardId: number): Promise<Visualization[]>;
  createVisualization(visualization: InsertVisualization): Promise<Visualization>;
  updateVisualization(id: number, data: Partial<Visualization>): Promise<Visualization | undefined>;
  deleteVisualization(id: number): Promise<boolean>;
  
  // Report operations
  getAllReports(userId: string, includePublic?: boolean): Promise<Report[]>;
  getReportById(id: number): Promise<Report | undefined>;
  createReport(report: InsertReport): Promise<Report>;
  updateReport(id: number, data: Partial<Report>): Promise<Report | undefined>;
  deleteReport(id: number): Promise<boolean>;
  
  // Team operations
  getAllTeams(userId: string): Promise<Team[]>;
  getTeamById(id: number): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: number, data: Partial<Team>): Promise<Team | undefined>;
  deleteTeam(id: number): Promise<boolean>;
  
  // Team Member operations
  getTeamMembers(teamId: number): Promise<TeamMember[]>;
  addTeamMember(teamMember: InsertTeamMember): Promise<TeamMember>;
  removeTeamMember(teamId: number, userId: string): Promise<boolean>;
  getUserTeams(userId: string): Promise<Team[]>;
}

// DatabaseStorage implementation
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Driver Management Operations
  async getAllDrivers(): Promise<any[]> {
    // For now, return mock data
    return [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        phone: "555-1234",
        profileImageUrl: "https://randomuser.me/api/portraits/men/1.jpg",
        vehicleType: "Car",
        zone: "North",
        status: "active",
        rating: 4.8,
        activeOrders: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com", 
        phone: "555-5678",
        profileImageUrl: "https://randomuser.me/api/portraits/women/1.jpg",
        vehicleType: "Scooter",
        zone: "South",
        status: "off-duty",
        rating: 4.5,
        activeOrders: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }
  
  async getDriverById(id: number | string): Promise<any | undefined> {
    const drivers = await this.getAllDrivers();
    return drivers.find(driver => driver.id.toString() === id.toString());
  }
  
  async getDriverByUserId(userId: string): Promise<any | undefined> {
    const drivers = await this.getAllDrivers();
    return drivers[0]; // For testing purposes
  }
  
  async createDriver(driver: any): Promise<any> {
    return {
      id: Date.now(),
      ...driver,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
  
  async updateDriver(id: number | string, data: any): Promise<any | undefined> {
    const driver = await this.getDriverById(id);
    if (!driver) return undefined;
    
    return {
      ...driver,
      ...data,
      updatedAt: new Date().toISOString()
    };
  }
  
  async deleteDriver(id: number | string): Promise<boolean> {
    return true; // For testing purposes
  }
  
  // Order Management Operations
  async getAllOrders(): Promise<any[]> {
    // Return test data for development
    return [
      {
        id: 1,
        customerName: "Customer 1",
        customerPhone: "555-1111",
        deliveryAddress: "123 Main St, City",
        deliveryNotes: "Leave at the door",
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        customerName: "Customer 2",
        customerPhone: "555-2222",
        deliveryAddress: "456 Oak St, City",
        deliveryNotes: "",
        status: "assigned",
        driverId: 1,
        driverName: "John Doe",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 3,
        customerName: "Customer 3",
        customerPhone: "555-3333",
        deliveryAddress: "789 Pine St, City",
        deliveryNotes: "Call before delivery",
        status: "completed",
        driverId: 2,
        driverName: "Jane Smith",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }
  
  async getOrderById(id: number | string): Promise<any | undefined> {
    const orders = await this.getAllOrders();
    return orders.find(order => order.id.toString() === id.toString());
  }
  
  async createOrder(order: any): Promise<any> {
    return {
      id: Date.now(),
      ...order,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
  
  async updateOrderStatus(id: number | string, status: string): Promise<any | undefined> {
    const order = await this.getOrderById(id);
    if (!order) return undefined;
    
    return {
      ...order,
      status,
      updatedAt: new Date().toISOString()
    };
  }
  
  async assignOrderToDriver(orderId: number | string, driverId: number | string): Promise<any | undefined> {
    const order = await this.getOrderById(orderId);
    const driver = await this.getDriverById(driverId);
    
    if (!order || !driver) return undefined;
    
    return {
      ...order,
      status: "assigned",
      driverId: driver.id,
      driverName: driver.name,
      updatedAt: new Date().toISOString()
    };
  }

  // Data Source operations
  async getAllDataSources(userId: string, includePublic = true): Promise<DataSource[]> {
    const query = includePublic
      ? or(eq(dataSources.userId, userId), eq(dataSources.isPublic, true))
      : eq(dataSources.userId, userId);
    
    return db
      .select()
      .from(dataSources)
      .where(query)
      .orderBy(dataSources.name);
  }

  async getDataSourceById(id: number): Promise<DataSource | undefined> {
    const [dataSource] = await db
      .select()
      .from(dataSources)
      .where(eq(dataSources.id, id));
    return dataSource;
  }

  async createDataSource(dataSourceData: InsertDataSource): Promise<DataSource> {
    const [dataSource] = await db
      .insert(dataSources)
      .values(dataSourceData)
      .returning();
    return dataSource;
  }

  async updateDataSource(
    id: number,
    data: Partial<DataSource>
  ): Promise<DataSource | undefined> {
    const [updatedDataSource] = await db
      .update(dataSources)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(dataSources.id, id))
      .returning();
    return updatedDataSource;
  }

  async deleteDataSource(id: number): Promise<boolean> {
    const result = await db
      .delete(dataSources)
      .where(eq(dataSources.id, id))
      .returning();
    return result.length > 0;
  }

  // Dashboard operations
  async getAllDashboards(userId: string, includePublic = true): Promise<Dashboard[]> {
    const query = includePublic
      ? or(eq(dashboards.userId, userId), eq(dashboards.isPublic, true))
      : eq(dashboards.userId, userId);
    
    return db
      .select()
      .from(dashboards)
      .where(query)
      .orderBy(dashboards.name);
  }

  async getDashboardById(id: number): Promise<Dashboard | undefined> {
    const [dashboard] = await db
      .select()
      .from(dashboards)
      .where(eq(dashboards.id, id));
    return dashboard;
  }

  async getDashboardWithVisualizations(id: number): Promise<any | undefined> {
    const dashboard = await this.getDashboardById(id);
    if (!dashboard) return undefined;
    
    const dashboardVisualizations = await this.getVisualizationsByDashboardId(id);
    
    return {
      ...dashboard,
      visualizations: dashboardVisualizations
    };
  }

  async createDashboard(dashboardData: InsertDashboard): Promise<Dashboard> {
    const [dashboard] = await db
      .insert(dashboards)
      .values(dashboardData)
      .returning();
    return dashboard;
  }

  async updateDashboard(
    id: number,
    data: Partial<Dashboard>
  ): Promise<Dashboard | undefined> {
    const [updatedDashboard] = await db
      .update(dashboards)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(dashboards.id, id))
      .returning();
    return updatedDashboard;
  }

  async deleteDashboard(id: number): Promise<boolean> {
    const result = await db
      .delete(dashboards)
      .where(eq(dashboards.id, id))
      .returning();
    return result.length > 0;
  }

  // Visualization operations
  async getAllVisualizations(userId: string): Promise<Visualization[]> {
    return db
      .select()
      .from(visualizations)
      .where(eq(visualizations.userId, userId))
      .orderBy(visualizations.name);
  }

  async getVisualizationById(id: number): Promise<Visualization | undefined> {
    const [visualization] = await db
      .select()
      .from(visualizations)
      .where(eq(visualizations.id, id));
    return visualization;
  }

  async getVisualizationsByDashboardId(dashboardId: number): Promise<Visualization[]> {
    return db
      .select()
      .from(visualizations)
      .where(eq(visualizations.dashboardId, dashboardId))
      .orderBy(visualizations.name);
  }

  async createVisualization(visualizationData: InsertVisualization): Promise<Visualization> {
    const [visualization] = await db
      .insert(visualizations)
      .values(visualizationData)
      .returning();
    return visualization;
  }

  async updateVisualization(
    id: number,
    data: Partial<Visualization>
  ): Promise<Visualization | undefined> {
    const [updatedVisualization] = await db
      .update(visualizations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(visualizations.id, id))
      .returning();
    return updatedVisualization;
  }

  async deleteVisualization(id: number): Promise<boolean> {
    const result = await db
      .delete(visualizations)
      .where(eq(visualizations.id, id))
      .returning();
    return result.length > 0;
  }

  // Report operations
  async getAllReports(userId: string, includePublic = true): Promise<Report[]> {
    const query = includePublic
      ? or(eq(reports.userId, userId), eq(reports.isPublic, true))
      : eq(reports.userId, userId);
    
    return db
      .select()
      .from(reports)
      .where(query)
      .orderBy(reports.name);
  }

  async getReportById(id: number): Promise<Report | undefined> {
    const [report] = await db
      .select()
      .from(reports)
      .where(eq(reports.id, id));
    return report;
  }

  async createReport(reportData: InsertReport): Promise<Report> {
    const [report] = await db
      .insert(reports)
      .values(reportData)
      .returning();
    return report;
  }

  async updateReport(
    id: number,
    data: Partial<Report>
  ): Promise<Report | undefined> {
    const [updatedReport] = await db
      .update(reports)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(reports.id, id))
      .returning();
    return updatedReport;
  }

  async deleteReport(id: number): Promise<boolean> {
    const result = await db
      .delete(reports)
      .where(eq(reports.id, id))
      .returning();
    return result.length > 0;
  }

  // Team operations
  async getAllTeams(userId: string): Promise<Team[]> {
    // Get all teams where the user is a member
    const userTeams = await this.getUserTeams(userId);
    
    // Get all teams created by the user
    const ownTeams = await db
      .select()
      .from(teams)
      .where(eq(teams.createdById, userId))
      .orderBy(teams.name);
    
    // Combine and remove duplicates
    const allTeams = [...userTeams, ...ownTeams];
    const uniqueTeams = allTeams.filter(
      (team, index, self) => 
        index === self.findIndex(t => t.id === team.id)
    );
    
    return uniqueTeams;
  }

  async getTeamById(id: number): Promise<Team | undefined> {
    const [team] = await db
      .select()
      .from(teams)
      .where(eq(teams.id, id));
    return team;
  }

  async createTeam(teamData: InsertTeam): Promise<Team> {
    const [team] = await db
      .insert(teams)
      .values(teamData)
      .returning();
    
    // Automatically add creator as admin member
    await this.addTeamMember({
      teamId: team.id,
      userId: teamData.createdById as string,
      role: "admin"
    });
    
    return team;
  }

  async updateTeam(
    id: number,
    data: Partial<Team>
  ): Promise<Team | undefined> {
    const [updatedTeam] = await db
      .update(teams)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(teams.id, id))
      .returning();
    return updatedTeam;
  }

  async deleteTeam(id: number): Promise<boolean> {
    const result = await db
      .delete(teams)
      .where(eq(teams.id, id))
      .returning();
    return result.length > 0;
  }

  // Team Member operations
  async getTeamMembers(teamId: number): Promise<TeamMember[]> {
    return db
      .select({
        id: teamMembers.id,
        teamId: teamMembers.teamId,
        userId: teamMembers.userId,
        role: teamMembers.role,
        createdAt: teamMembers.createdAt,
        user: {
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl
        }
      })
      .from(teamMembers)
      .leftJoin(users, eq(teamMembers.userId, users.id))
      .where(eq(teamMembers.teamId, teamId))
      .orderBy(teamMembers.role);
  }

  async addTeamMember(teamMemberData: InsertTeamMember): Promise<TeamMember> {
    const [teamMember] = await db
      .insert(teamMembers)
      .values(teamMemberData)
      .returning();
    return teamMember;
  }

  async removeTeamMember(teamId: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, userId)
        )
      )
      .returning();
    return result.length > 0;
  }

  async getUserTeams(userId: string): Promise<Team[]> {
    const memberTeams = await db
      .select({
        id: teams.id,
        name: teams.name,
        description: teams.description,
        createdById: teams.createdById,
        createdAt: teams.createdAt,
        updatedAt: teams.updatedAt
      })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(eq(teamMembers.userId, userId))
      .orderBy(teams.name);
      
    return memberTeams;
  }
}

export const storage = new DatabaseStorage();
