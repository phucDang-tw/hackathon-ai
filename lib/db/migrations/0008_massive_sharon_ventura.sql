CREATE TABLE IF NOT EXISTS "Archetype" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"activities" json,
	"hub" varchar(255) NOT NULL,
	"base_archetype_id" varchar(255),
	"category" varchar(255) NOT NULL,
	"archetype_family" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ArchetypeExpectation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"archetype_id" varchar(255) NOT NULL,
	"competency_id" varchar(255) NOT NULL,
	"competency_level_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ArchetypeService" (
	"archetype_id" varchar(255) NOT NULL,
	"service_identifier" varchar(255) NOT NULL,
	CONSTRAINT "ArchetypeService_archetype_id_service_identifier_pk" PRIMARY KEY("archetype_id","service_identifier")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Capability" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"capability_type_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "CapabilityCompetency" (
	"capability_id" varchar(255) NOT NULL,
	"competency_id" varchar(255) NOT NULL,
	CONSTRAINT "CapabilityCompetency_capability_id_competency_id_pk" PRIMARY KEY("capability_id","competency_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "CapabilityType" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Competency" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"competency_group_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "CompetencyGroup" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "CompetencyLevel" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "CompetencyLevelBehavior" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"competency_id" varchar(255) NOT NULL,
	"competency_level_id" varchar(255) NOT NULL,
	"behavior" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Service" (
	"identifier" varchar(255) PRIMARY KEY NOT NULL,
	"short_description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ServiceCapability" (
	"service_identifier" varchar(255) NOT NULL,
	"capability_id" varchar(255) NOT NULL,
	CONSTRAINT "ServiceCapability_service_identifier_capability_id_pk" PRIMARY KEY("service_identifier","capability_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ServiceLine" (
	"identifier" varchar(255) PRIMARY KEY NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ServiceServiceLine" (
	"service_identifier" varchar(255) NOT NULL,
	"service_line_identifier" varchar(255) NOT NULL,
	CONSTRAINT "ServiceServiceLine_service_identifier_service_line_identifier_pk" PRIMARY KEY("service_identifier","service_line_identifier")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ArchetypeExpectation" ADD CONSTRAINT "ArchetypeExpectation_archetype_id_Archetype_id_fk" FOREIGN KEY ("archetype_id") REFERENCES "public"."Archetype"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ArchetypeExpectation" ADD CONSTRAINT "ArchetypeExpectation_competency_id_Competency_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."Competency"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ArchetypeExpectation" ADD CONSTRAINT "ArchetypeExpectation_competency_level_id_CompetencyLevel_id_fk" FOREIGN KEY ("competency_level_id") REFERENCES "public"."CompetencyLevel"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ArchetypeService" ADD CONSTRAINT "ArchetypeService_archetype_id_Archetype_id_fk" FOREIGN KEY ("archetype_id") REFERENCES "public"."Archetype"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ArchetypeService" ADD CONSTRAINT "ArchetypeService_service_identifier_Service_identifier_fk" FOREIGN KEY ("service_identifier") REFERENCES "public"."Service"("identifier") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Capability" ADD CONSTRAINT "Capability_capability_type_id_CapabilityType_id_fk" FOREIGN KEY ("capability_type_id") REFERENCES "public"."CapabilityType"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CapabilityCompetency" ADD CONSTRAINT "CapabilityCompetency_capability_id_Capability_id_fk" FOREIGN KEY ("capability_id") REFERENCES "public"."Capability"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CapabilityCompetency" ADD CONSTRAINT "CapabilityCompetency_competency_id_Competency_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."Competency"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Competency" ADD CONSTRAINT "Competency_competency_group_id_CompetencyGroup_id_fk" FOREIGN KEY ("competency_group_id") REFERENCES "public"."CompetencyGroup"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CompetencyLevelBehavior" ADD CONSTRAINT "CompetencyLevelBehavior_competency_id_Competency_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."Competency"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CompetencyLevelBehavior" ADD CONSTRAINT "CompetencyLevelBehavior_competency_level_id_CompetencyLevel_id_fk" FOREIGN KEY ("competency_level_id") REFERENCES "public"."CompetencyLevel"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ServiceCapability" ADD CONSTRAINT "ServiceCapability_service_identifier_Service_identifier_fk" FOREIGN KEY ("service_identifier") REFERENCES "public"."Service"("identifier") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ServiceCapability" ADD CONSTRAINT "ServiceCapability_capability_id_Capability_id_fk" FOREIGN KEY ("capability_id") REFERENCES "public"."Capability"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ServiceServiceLine" ADD CONSTRAINT "ServiceServiceLine_service_identifier_Service_identifier_fk" FOREIGN KEY ("service_identifier") REFERENCES "public"."Service"("identifier") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ServiceServiceLine" ADD CONSTRAINT "ServiceServiceLine_service_line_identifier_ServiceLine_identifier_fk" FOREIGN KEY ("service_line_identifier") REFERENCES "public"."ServiceLine"("identifier") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
