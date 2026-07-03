import { pgTable, serial, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const priorityLevelEnum = pgEnum("priority_level", ["high", "medium", "low"]);

export const trademarksTable = pgTable("trademarks", {
  id: serial("id").primaryKey(),
  applicationNumber: text("application_number").notNull(),
  trademarkName: text("trademark_name").notNull(),
  clientName: text("client_name"),
  currentStatus: text("current_status").notNull(),
  priorityLevel: priorityLevelEnum("priority_level").notNull().default("low"),
  recommendedAction: text("recommended_action"),
  lastUpdatedDate: text("last_updated_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTrademarkSchema = createInsertSchema(trademarksTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  priorityLevel: true,
  recommendedAction: true,
});

export type InsertTrademark = z.infer<typeof insertTrademarkSchema>;
export type Trademark = typeof trademarksTable.$inferSelect;
