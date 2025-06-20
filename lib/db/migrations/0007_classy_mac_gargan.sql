CREATE TABLE IF NOT EXISTS "knowledge_chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar NOT NULL,
	"title" text NOT NULL,
	"level" integer,
	"content" text NOT NULL,
	"embedding" vector(1536),
	"archetype" text,
	"capability" text,
	"service" text,
	"offering" text,
	"business_line" text,
	"tags" json,
	"source" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
