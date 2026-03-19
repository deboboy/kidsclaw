import {
  pgTable,
  text,
  timestamp,
  boolean,
  serial,
  integer,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";

export const instanceStatusEnum = pgEnum("instance_status", [
  "pending",
  "creating",
  "installing",
  "configuring",
  "ready",
  "error",
  "destroyed",
]);

// NextAuth tables — names must match @auth/drizzle-adapter defaults
export const users = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accounts = pgTable("account", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const sessions = pgTable("session", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionToken: text("sessionToken").notNull().unique(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verificationToken", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull().unique(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// KidsClaw tables
export const families = pgTable("families", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const instances = pgTable("instances", {
  id: uuid("id").defaultRandom().primaryKey(),
  familyId: uuid("family_id")
    .notNull()
    .unique()
    .references(() => families.id, { onDelete: "cascade" }),
  hetznerServerId: text("hetzner_server_id"),
  ipv4: text("ipv4"),
  status: instanceStatusEnum("status").default("pending").notNull(),
  provisionStep: text("provision_step"),
  provisionError: text("provision_error"),
  gatewayToken: text("gateway_token"), // encrypted
  provisionSecret: text("provision_secret"), // encrypted, one-time
  webchatPort: integer("webchat_port").default(3000),
  subdomain: text("subdomain"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const kids = pgTable("kids", {
  id: uuid("id").defaultRandom().primaryKey(),
  familyId: uuid("family_id")
    .notNull()
    .references(() => families.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  token: text("token").notNull().unique(), // nanoid 22-char
  phone: text("phone"),
  avatarSeed: text("avatar_seed"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const provisionEvents = pgTable("provision_events", {
  id: serial("id").primaryKey(),
  instanceId: uuid("instance_id")
    .notNull()
    .references(() => instances.id, { onDelete: "cascade" }),
  step: text("step").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  role: text("role").notNull(), // "parent" or "kid"
  rating: integer("rating"),
  message: text("message").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
