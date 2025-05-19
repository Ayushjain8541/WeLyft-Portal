import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: text("sess").notNull(),
    expire: timestamp("expire").notNull(),
  }
);

// Data sources table
export const dataSources = pgTable("data_sources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // e.g., 'database', 'api', 'file', etc.
  config: jsonb("config").notNull(), // Connection details, credentials, etc.
  userId: varchar("user_id").references(() => users.id), // Owner of the data source
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Dashboards table
export const dashboards = pgTable("dashboards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  layout: jsonb("layout").notNull(), // Layout configuration
  userId: varchar("user_id").references(() => users.id), // Owner of the dashboard
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Visualizations table
export const visualizations = pgTable("visualizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // e.g., 'chart', 'table', 'map', etc.
  config: jsonb("config").notNull(), // Visualization configuration
  dataSourceId: integer("data_source_id").references(() => dataSources.id, { onDelete: "cascade" }),
  query: text("query").notNull(), // SQL query or API endpoint
  dashboardId: integer("dashboard_id").references(() => dashboards.id),
  userId: varchar("user_id").references(() => users.id), // Owner of the visualization
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reports table
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  schedule: jsonb("schedule"), // For scheduled reports
  visualizations: jsonb("visualizations").notNull(), // Array of visualization IDs
  format: text("format").notNull(), // e.g., 'pdf', 'excel', etc.
  userId: varchar("user_id").references(() => users.id), // Owner of the report
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Teams table
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdById: varchar("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Team Members table
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").references(() => teams.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  role: text("role").notNull().default("member"), // e.g., 'admin', 'member', etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Create insert schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  role: true,
});

export const insertDataSourceSchema = createInsertSchema(dataSources).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDashboardSchema = createInsertSchema(dashboards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVisualizationSchema = createInsertSchema(visualizations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  createdAt: true,
});

// Types for database operations
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertDataSource = typeof insertDataSourceSchema._type;
export type DataSource = typeof dataSources.$inferSelect;

export type InsertDashboard = typeof insertDashboardSchema._type;
export type Dashboard = typeof dashboards.$inferSelect;

export type InsertVisualization = typeof insertVisualizationSchema._type;
export type Visualization = typeof visualizations.$inferSelect;

export type InsertReport = typeof insertReportSchema._type;
export type Report = typeof reports.$inferSelect;

export type InsertTeam = typeof insertTeamSchema._type;
export type Team = typeof teams.$inferSelect;

export type InsertTeamMember = typeof insertTeamMemberSchema._type;
export type TeamMember = typeof teamMembers.$inferSelect;
