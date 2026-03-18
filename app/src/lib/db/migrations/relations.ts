import { relations } from "drizzle-orm/relations";
import { users, families, instances, kids, provisionEvents, sessions, accounts } from "./schema";

export const familiesRelations = relations(families, ({one, many}) => ({
	user: one(users, {
		fields: [families.userId],
		references: [users.id]
	}),
	instances: many(instances),
	kids: many(kids),
}));

export const usersRelations = relations(users, ({many}) => ({
	families: many(families),
	sessions: many(sessions),
	accounts: many(accounts),
}));

export const instancesRelations = relations(instances, ({one, many}) => ({
	family: one(families, {
		fields: [instances.familyId],
		references: [families.id]
	}),
	provisionEvents: many(provisionEvents),
}));

export const kidsRelations = relations(kids, ({one}) => ({
	family: one(families, {
		fields: [kids.familyId],
		references: [families.id]
	}),
}));

export const provisionEventsRelations = relations(provisionEvents, ({one}) => ({
	instance: one(instances, {
		fields: [provisionEvents.instanceId],
		references: [instances.id]
	}),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));

export const accountsRelations = relations(accounts, ({one}) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	}),
}));