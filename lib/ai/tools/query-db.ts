import { DataStreamWriter, tool } from "ai";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { Session } from "next-auth";
import postgres from "postgres";
import { z } from "zod";

// Initialize database connection
const connection = postgres(process.env.POSTGRES_URL!);
const db = drizzle(connection);

// Export database schema prompt for AI
export const DATABASE_SCHEMA_PROMPT = `
You have access to a Thoughtworks Capable database with the following schema:

## Available Tables:
- archetype - Job roles and positions
- competency - Skills and abilities  
- competencyGroup - Groupings of related competencies
- competencyLevel - Proficiency levels (novice, advanced beginner, practitioner, proficient, expert)
- competencyLevelBehavior - Specific behaviors for competency levels
- capability - What services can deliver
- capabilityType - Categories of capabilities
- service - Business service offerings
- serviceLine - Business areas/divisions
- archetypeExpectation - Expected competencies for archetypes
- archetypeService - Which services archetypes work on
- serviceServiceLine - Service to service line mappings
- serviceCapability - Service to capability mappings  
- capabilityCompetency - Capability to competency mappings

## Query Pattern:
Use standard SQL queries:
\`\`\`sql
SELECT name FROM archetype WHERE category = 'Technology'
\`\`\`

## Key Relationships:
- Archetypes → expectations (competencies at levels) → behaviors
- Services → capabilities → competencies → groups
- Services → service lines, archetypes work on services
`;

interface QueryDatabaseProps {
  session: Session;
  dataStream: DataStreamWriter;
}

export const queryDatabase = ({ session, dataStream }: QueryDatabaseProps) =>
  tool({
    description: `Execute raw SQL queries on the Thoughtworks Capable database.
    
Use standard SQL syntax to query the database.
Database contains roles, skills, services and their relationships.`,
    parameters: z.object({
      query_description: z.string().describe("Describe what you want to query"),
      sql_query: z.string().describe("Raw SQL query to execute"),
    }),
    execute: async ({ query_description, sql_query }) => {
      dataStream.writeData({
        type: "query-start",
        content: `Executing: ${query_description}`,
      });

      dataStream.writeData({
        type: "sql-query",
        content: sql_query,
      });

      try {
        // Execute raw SQL query directly
        console.log("Executing query", sql_query);
        const results = await db.execute(sql.raw(sql_query));

        dataStream.writeData({
          type: "query-results",
          content: JSON.stringify(results, null, 2),
        });

        const count = Array.isArray(results) ? results.length : 1;
        const summary = `Query executed successfully. Retrieved ${count} result(s).`;

        dataStream.writeData({
          type: "query-summary",
          content: summary,
        });

        return {
          query_description,
          sql_query,
          results_count: count,
          results,
          summary,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        console.log("Query error", errorMessage);
        dataStream.writeData({
          type: "query-error",
          content: `Query failed: ${errorMessage}`,
        });

        dataStream.writeData({
          type: "schema-info",
          content: DATABASE_SCHEMA_PROMPT,
        });

        // Return error information instead of throwing, so LLM can see and potentially retry
        return {
          query_description,
          sql_query,
          results_count: 0,
          results: [],
          summary: `Query failed: ${errorMessage}`,
          error: true,
          error_message: errorMessage,
          schema_info: DATABASE_SCHEMA_PROMPT,
        };
      }
    },
  });
