import { pgTable, foreignKey, unique, uuid, text, timestamp, integer, boolean, serial, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const instanceStatus = pgEnum("instance_status", ['pending', 'creating', 'installing', 'configuring', 'ready', 'error', 'destroyed'])


export const families = pgTable("families", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	name: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "families_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("families_user_id_unique").on(table.userId),
]);

export const instances = pgTable("instances", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	familyId: uuid("family_id").notNull(),
	hetznerServerId: text("hetzner_server_id"),
	ipv4: text(),
	status: instanceStatus().default('pending').notNull(),
	provisionStep: text("provision_step"),
	provisionError: text("provision_error"),
	gatewayToken: text("gateway_token"),
	provisionSecret: text("provision_secret"),
	webchatPort: integer("webchat_port").default(3000),
	subdomain: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.familyId],
			foreignColumns: [families.id],
			name: "instances_family_id_families_id_fk"
		}).onDelete("cascade"),
	unique("instances_family_id_unique").on(table.familyId),
]);

export const kids = pgTable("kids", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	familyId: uuid("family_id").notNull(),
	name: text().notNull(),
	token: text().notNull(),
	phone: text(),
	avatarSeed: text("avatar_seed"),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.familyId],
			foreignColumns: [families.id],
			name: "kids_family_id_families_id_fk"
		}).onDelete("cascade"),
	unique("kids_token_unique").on(table.token),
]);

export const provisionEvents = pgTable("provision_events", {
	id: serial().primaryKey().notNull(),
	instanceId: uuid("instance_id").notNull(),
	step: text().notNull(),
	message: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.instanceId],
			foreignColumns: [instances.id],
			name: "provision_events_instance_id_instances_id_fk"
		}).onDelete("cascade"),
]);

export const sessions = pgTable("sessions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	sessionToken: text("session_token").notNull(),
	userId: uuid("user_id").notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "sessions_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("sessions_session_token_unique").on(table.sessionToken),
]);

export const verificationTokens = pgTable("verification_tokens", {
	identifier: text().notNull(),
	token: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	unique("verification_tokens_token_unique").on(table.token),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text(),
	email: text().notNull(),
	emailVerified: timestamp("email_verified", { mode: 'string' }),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const accounts = pgTable("accounts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	type: text().notNull(),
	provider: text().notNull(),
	providerAccountId: text("provider_account_id").notNull(),
	refreshToken: text("refresh_token"),
	accessToken: text("access_token"),
	expiresAt: integer("expires_at"),
	tokenType: text("token_type"),
	scope: text(),
	idToken: text("id_token"),
	sessionState: text("session_state"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "accounts_user_id_users_id_fk"
		}).onDelete("cascade"),
]);
