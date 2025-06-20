import type { InferSelectModel } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  integer,
  json,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
  vector,
} from "drizzle-orm/pg-core";

export const user = pgTable("User", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  email: varchar("email", { length: 64 }).notNull(),
  password: varchar("password", { length: 64 }),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable("Chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  title: text("title").notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  visibility: varchar("visibility", { enum: ["public", "private"] })
    .notNull()
    .default("private"),
});

export type Chat = InferSelectModel<typeof chat>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
export const messageDeprecated = pgTable("Message", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id),
  role: varchar("role").notNull(),
  content: json("content").notNull(),
  createdAt: timestamp("createdAt").notNull(),
});

export type MessageDeprecated = InferSelectModel<typeof messageDeprecated>;

export const message = pgTable("Message_v2", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id),
  role: varchar("role").notNull(),
  parts: json("parts").notNull(),
  attachments: json("attachments").notNull(),
  createdAt: timestamp("createdAt").notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
export const voteDeprecated = pgTable(
  "Vote",
  {
    chatId: uuid("chatId")
      .notNull()
      .references(() => chat.id),
    messageId: uuid("messageId")
      .notNull()
      .references(() => messageDeprecated.id),
    isUpvoted: boolean("isUpvoted").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  }
);

export type VoteDeprecated = InferSelectModel<typeof voteDeprecated>;

export const vote = pgTable(
  "Vote_v2",
  {
    chatId: uuid("chatId")
      .notNull()
      .references(() => chat.id),
    messageId: uuid("messageId")
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean("isUpvoted").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  }
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  "Document",
  {
    id: uuid("id").notNull().defaultRandom(),
    createdAt: timestamp("createdAt").notNull(),
    title: text("title").notNull(),
    content: text("content"),
    kind: varchar("text", { enum: ["text", "code", "image", "sheet"] })
      .notNull()
      .default("text"),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  }
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  "Suggestion",
  {
    id: uuid("id").notNull().defaultRandom(),
    documentId: uuid("documentId").notNull(),
    documentCreatedAt: timestamp("documentCreatedAt").notNull(),
    originalText: text("originalText").notNull(),
    suggestedText: text("suggestedText").notNull(),
    description: text("description"),
    isResolved: boolean("isResolved").notNull().default(false),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  })
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const stream = pgTable(
  "Stream",
  {
    id: uuid("id").notNull().defaultRandom(),
    chatId: uuid("chatId").notNull(),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    chatRef: foreignKey({
      columns: [table.chatId],
      foreignColumns: [chat.id],
    }),
  })
);

export type Stream = InferSelectModel<typeof stream>;

export const knowledgeChunks = pgTable("knowledge_chunks", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  type: varchar("type", {
    enum: ["competency", "capability", "service", "offering", "archetype"],
  }).notNull(),
  title: text("title").notNull(),
  level: integer("level"),
  content: text("content").notNull(),
  embedding: vector("embedding", { dimensions: 1536 }),
  archetype: text("archetype"),
  capability: text("capability"),
  service: text("service"),
  offering: text("offering"),
  businessLine: text("business_line"),
  tags: json("tags").$type<string[]>(),
  source: text("source").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type KnowledgeChunk = InferSelectModel<typeof knowledgeChunks>;

// New tables based on scripts/types.ts

export const serviceLine = pgTable("ServiceLine", {
  identifier: varchar("identifier", { length: 255 }).primaryKey().notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type ServiceLine = InferSelectModel<typeof serviceLine>;

export const competencyLevel = pgTable("CompetencyLevel", {
  id: varchar("id", { length: 255 }).primaryKey().notNull(),
  name: varchar("name", {
    enum: [
      "novice",
      "advanced beginner",
      "practitioner",
      "proficient",
      "expert",
    ],
  }).notNull(),
  description: text("description").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type CompetencyLevel = InferSelectModel<typeof competencyLevel>;

export const capabilityType = pgTable("CapabilityType", {
  id: varchar("id", { length: 255 }).primaryKey().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type CapabilityType = InferSelectModel<typeof capabilityType>;

export const competencyGroup = pgTable("CompetencyGroup", {
  id: varchar("id", { length: 255 }).primaryKey().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type CompetencyGroup = InferSelectModel<typeof competencyGroup>;

export const archetype = pgTable("Archetype", {
  id: varchar("id", { length: 255 }).primaryKey().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  activities: json("activities").$type<string[]>(),
  hub: varchar("hub", { length: 255 }).notNull(),
  baseArchetypeId: varchar("base_archetype_id", { length: 255 }),
  category: varchar("category", { length: 255 }).notNull(),
  archetypeFamily: varchar("archetype_family", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Archetype = InferSelectModel<typeof archetype>;

export const service = pgTable("Service", {
  identifier: varchar("identifier", { length: 255 }).primaryKey().notNull(),
  shortDescription: text("short_description").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Service = InferSelectModel<typeof service>;

export const capability = pgTable("Capability", {
  id: varchar("id", { length: 255 }).primaryKey().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  capabilityTypeId: varchar("capability_type_id", { length: 255 })
    .notNull()
    .references(() => capabilityType.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Capability = InferSelectModel<typeof capability>;

export const competency = pgTable("Competency", {
  id: varchar("id", { length: 255 }).primaryKey().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  competencyGroupId: varchar("competency_group_id", { length: 255 })
    .notNull()
    .references(() => competencyGroup.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Competency = InferSelectModel<typeof competency>;

export const competencyLevelBehavior = pgTable("CompetencyLevelBehavior", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  competencyId: varchar("competency_id", { length: 255 })
    .notNull()
    .references(() => competency.id),
  competencyLevelId: varchar("competency_level_id", { length: 255 })
    .notNull()
    .references(() => competencyLevel.id),
  behavior: text("behavior"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type CompetencyLevelBehavior = InferSelectModel<
  typeof competencyLevelBehavior
>;

export const archetypeExpectation = pgTable("ArchetypeExpectation", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  archetypeId: varchar("archetype_id", { length: 255 })
    .notNull()
    .references(() => archetype.id),
  competencyId: varchar("competency_id", { length: 255 })
    .notNull()
    .references(() => competency.id),
  competencyLevelId: varchar("competency_level_id", { length: 255 })
    .notNull()
    .references(() => competencyLevel.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type ArchetypeExpectation = InferSelectModel<
  typeof archetypeExpectation
>;

// Junction tables for many-to-many relationships

export const serviceServiceLine = pgTable(
  "ServiceServiceLine",
  {
    serviceIdentifier: varchar("service_identifier", { length: 255 })
      .notNull()
      .references(() => service.identifier),
    serviceLineIdentifier: varchar("service_line_identifier", { length: 255 })
      .notNull()
      .references(() => serviceLine.identifier),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.serviceIdentifier, table.serviceLineIdentifier],
    }),
  })
);

export const archetypeService = pgTable(
  "ArchetypeService",
  {
    archetypeId: varchar("archetype_id", { length: 255 })
      .notNull()
      .references(() => archetype.id),
    serviceIdentifier: varchar("service_identifier", { length: 255 })
      .notNull()
      .references(() => service.identifier),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.archetypeId, table.serviceIdentifier] }),
  })
);

export const serviceCapability = pgTable(
  "ServiceCapability",
  {
    serviceIdentifier: varchar("service_identifier", { length: 255 })
      .notNull()
      .references(() => service.identifier),
    capabilityId: varchar("capability_id", { length: 255 })
      .notNull()
      .references(() => capability.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.serviceIdentifier, table.capabilityId] }),
  })
);

export const capabilityCompetency = pgTable(
  "CapabilityCompetency",
  {
    capabilityId: varchar("capability_id", { length: 255 })
      .notNull()
      .references(() => capability.id),
    competencyId: varchar("competency_id", { length: 255 })
      .notNull()
      .references(() => competency.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.capabilityId, table.competencyId] }),
  })
);

export type ServiceServiceLine = InferSelectModel<typeof serviceServiceLine>;
export type ArchetypeService = InferSelectModel<typeof archetypeService>;
export type ServiceCapability = InferSelectModel<typeof serviceCapability>;
export type CapabilityCompetency = InferSelectModel<
  typeof capabilityCompetency
>;
