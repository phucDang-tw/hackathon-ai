import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  archetype,
  archetypeExpectation,
  archetypeService,
  capability,
  capabilityType,
  competency,
  competencyGroup,
  competencyLevel,
  competencyLevelBehavior,
  service,
  serviceLine,
} from "../lib/db/schema";

// Load environment variables
config({ path: ".env.local" });
config({ path: ".env" });

const connection = postgres(process.env.POSTGRES_URL!, { max: 1 });
const db = drizzle(connection);

// Add your cookies here - copy from browser dev tools
const COOKIES =
  process.env.CAPABLE_COOKIES ||
  `_pk_id.34.7f86=df4187f49dece6e1.1750146364.; _gid=GA1.2.377795281.1750255985; _ga_RN24SMN5LX=GS2.1.s1750255984$o47$g0$t1750257526$j60$l0$h0; _ga=GA1.2.951462832.1735800728; _ga_4PMZZ3YZW8=GS2.1.s1750325060$o4$g1$t1750325123$j60$l0$h0; _ga_ZK29164C94=GS2.1.s1750325060$o4$g1$t1750325127$j60$l0$h0; connect.sid=s%3Apmfi9m3HrOY4zNaiso9yvCEooNnAI03f.7bwQ4n58LXpBO0ZczywEdJEfnY9D4Bmy6wpHdUBr868`;

const BASE_URL = "https://capable.thoughtworks.net/api";

interface ApiResponse {
  [key: string]: any;
}

async function fetchWithCookies(url: string): Promise<any> {
  try {
    console.log(`🔍 Fetching: ${url}`);

    const response = await fetch(url, {
      headers: {
        Cookie: COOKIES,
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        Referer: "https://capable.thoughtworks.net/",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Handle different response structures
    if (Array.isArray(data)) {
      return data;
    } else if (data.data && Array.isArray(data.data)) {
      return data.data;
    } else if (typeof data === "object") {
      return data;
    }

    return [];
  } catch (error) {
    console.error(`❌ Error fetching ${url}:`, error);
    return null;
  }
}

// Save functions for each entity type
async function saveServiceLines(items: any[]) {
  console.log(`💾 Saving ${items.length} service lines...`);

  for (const item of items) {
    try {
      await db
        .insert(serviceLine)
        .values({
          identifier: item.identifier,
          description: item.description,
        })
        .onConflictDoNothing();

      console.log(`✅ Saved service line: ${item.identifier}`);
    } catch (error) {
      console.error(`❌ Error saving service line ${item.identifier}:`, error);
    }
  }
}

async function saveServices(items: any[]) {
  console.log(`💾 Saving ${items.length} services...`);

  for (const item of items) {
    try {
      await db
        .insert(service)
        .values({
          identifier: item.identifier,
          shortDescription: item.short_description,
        })
        .onConflictDoNothing();

      console.log(`✅ Saved service: ${item.identifier}`);
    } catch (error) {
      console.error(`❌ Error saving service ${item.identifier}:`, error);
    }
  }
}

async function saveCapabilityTypes(items: any[]) {
  console.log(`💾 Saving ${items.length} capability types...`);

  for (const item of items) {
    try {
      await db
        .insert(capabilityType)
        .values({
          id: item.id,
          name: item.name,
        })
        .onConflictDoNothing();

      console.log(`✅ Saved capability type: ${item.name}`);
    } catch (error) {
      console.error(`❌ Error saving capability type ${item.id}:`, error);
    }
  }
}

async function saveCompetencyGroups(items: any[]) {
  console.log(`💾 Saving ${items.length} competency groups...`);

  for (const item of items) {
    try {
      await db
        .insert(competencyGroup)
        .values({
          id: item.id,
          name: item.name,
          description: item.description,
        })
        .onConflictDoNothing();

      console.log(`✅ Saved competency group: ${item.name}`);
    } catch (error) {
      console.error(`❌ Error saving competency group ${item.id}:`, error);
    }
  }
}

async function saveCompetencyLevels(items: any[]) {
  console.log(`💾 Saving ${items.length} competency levels...`);

  for (const item of items) {
    try {
      await db
        .insert(competencyLevel)
        .values({
          id: item.id,
          name: item.name as any,
          description: item.description,
          order: item.order,
        })
        .onConflictDoNothing();

      console.log(`✅ Saved competency level: ${item.name}`);
    } catch (error) {
      console.error(`❌ Error saving competency level ${item.id}:`, error);
    }
  }
}

async function saveCapabilities(items: any[]) {
  console.log(`💾 Saving ${items.length} capabilities...`);

  for (const item of items) {
    try {
      await db
        .insert(capability)
        .values({
          id: item.id,
          name: item.name,
          description: item.description,
          capabilityTypeId: item.capabilityType?.id || item.capability_type_id,
        })
        .onConflictDoNothing();

      console.log(`✅ Saved capability: ${item.name}`);
    } catch (error) {
      console.error(`❌ Error saving capability ${item.id}:`, error);
    }
  }
}

async function saveCompetencies(items: any[]) {
  console.log(`💾 Saving ${items.length} competencies...`);

  for (const item of items) {
    try {
      // First fetch detailed competency data
      const detailedCompetency = await fetchWithCookies(
        `${BASE_URL}/competencies/${item.identifier}`
      );

      if (detailedCompetency) {
        await db
          .insert(competency)
          .values({
            id: detailedCompetency.identifier,
            name: detailedCompetency.name,
            description: detailedCompetency.description,
            competencyGroupId:
              detailedCompetency.competency_group?.id ||
              detailedCompetency.competency_group_id,
          })
          .onConflictDoNothing();

        // Save competency level behaviors
        if (
          detailedCompetency.competency_level &&
          Array.isArray(detailedCompetency.competency_level)
        ) {
          for (const levelBehavior of detailedCompetency.competency_level) {
            try {
              await db
                .insert(competencyLevelBehavior)
                .values({
                  competencyId: detailedCompetency.id,
                  competencyLevelId:
                    levelBehavior.competency_level?.id ||
                    levelBehavior.competency_level_id,
                  behavior: levelBehavior.behavior,
                })
                .onConflictDoNothing();
            } catch (error) {
              console.error(
                `❌ Error saving competency level behavior:`,
                error
              );
            }
          }
        }

        console.log(`✅ Saved competency: ${detailedCompetency.name}`);
      }

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`❌ Error saving competency ${item.id}:`, error);
    }
  }
}

async function saveArchetypes(items: any[]) {
  console.log(`💾 Saving ${items.length} archetypes...`);
  await Promise.all(
    items.map(async (item) => {
      try {
        // First fetch detailed archetype data
        const detailedArchetype = await fetchWithCookies(
          `${BASE_URL}/archetypes/${item.identifier}`
        );

        if (detailedArchetype) {
          await db
            .insert(archetype)
            .values({
              id: detailedArchetype.identifier,
              name: detailedArchetype.name,
              description: detailedArchetype.description,
              activities: detailedArchetype.activities || [],
              hub: detailedArchetype.hub,
              baseArchetypeId: detailedArchetype.base_archetype?.id,
              category: detailedArchetype.category,
              archetypeFamily: detailedArchetype.archetype_family,
            })
            .onConflictDoNothing();

          // Save archetype expectations
          if (
            detailedArchetype.archetype_expectations &&
            Array.isArray(detailedArchetype.archetype_expectations)
          ) {
            for (const expectation of detailedArchetype.archetype_expectations) {
              try {
                await db
                  .insert(archetypeExpectation)
                  .values({
                    archetypeId: detailedArchetype.identifier,
                    competencyId:
                      expectation.competency?.identifier ||
                      expectation.competency_id,
                    competencyLevelId: expectation.competency_level.id,
                  })
                  .onConflictDoNothing();
              } catch (error) {
                console.error(`❌ Error saving archetype expectation:`, error);
              }
            }
          }

          // Save archetype-service relationships
          if (
            detailedArchetype.services &&
            Array.isArray(detailedArchetype.services)
          ) {
            for (const srv of detailedArchetype.services) {
              try {
                await db
                  .insert(archetypeService)
                  .values({
                    archetypeId: detailedArchetype.identifier,
                    serviceIdentifier: srv.identifier || srv.id,
                  })
                  .onConflictDoNothing();
              } catch (error) {
                console.error(
                  `❌ Error saving archetype-service relationship:`,
                  error
                );
              }
            }
          }

          console.log(`✅ Saved archetype: ${detailedArchetype.name}`);
        }

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`❌ Error saving archetype ${item.id}:`, error);
      }
    })
  );
}

async function main() {
  console.log("🎯 Starting Thoughtworks Capable API Crawler");

  if (!COOKIES) {
    console.error("❌ CAPABLE_COOKIES environment variable not set");
    console.log(
      '💡 Set your cookies: export CAPABLE_COOKIES="your-cookies-here"'
    );
    process.exit(1);
  }

  try {
    // 1. Fetch and save service lines
    // console.log("\n🚀 Fetching service lines...");
    // const serviceLines = await fetchWithCookies(`${BASE_URL}/service_lines`);
    // if (serviceLines && serviceLines.length > 0) {
    //   await saveServiceLines(serviceLines);
    // }

    // // 2. Fetch and save services
    // console.log("\n🚀 Fetching services...");
    // const services = await fetchWithCookies(`${BASE_URL}/services`);
    // if (services && services.length > 0) {
    //   await saveServices(services);
    // }

    // // 3. Fetch and save capability types
    // console.log("\n🚀 Fetching capability types...");
    // const capabilityTypes = await fetchWithCookies(
    //   `${BASE_URL}/capability_types`
    // );
    // if (capabilityTypes && capabilityTypes.length > 0) {
    //   await saveCapabilityTypes(capabilityTypes);
    // }

    // // 4. Fetch and save competency groups
    // console.log("\n🚀 Fetching competency groups...");
    // const competencyGroups = await fetchWithCookies(
    //   `${BASE_URL}/competency_groups`
    // );
    // if (competencyGroups && competencyGroups.length > 0) {
    //   await saveCompetencyGroups(competencyGroups);
    // }

    // // 5. Fetch and save competency levels (if endpoint exists)
    // console.log("\n🚀 Fetching competency levels...");
    // const competencyLevels = await fetchWithCookies(
    //   `${BASE_URL}/competency_levels`
    // );
    // if (competencyLevels && competencyLevels.length > 0) {
    //   await saveCompetencyLevels(competencyLevels);
    // }

    // // 6. Fetch and save capabilities
    // console.log("\n🚀 Fetching capabilities...");
    // const capabilities = await fetchWithCookies(`${BASE_URL}/capabilities`);
    // if (capabilities && capabilities.length > 0) {
    //   await saveCapabilities(capabilities);
    // }

    // 7. Fetch and save competencies with detailed data
    // console.log("\n🚀 Fetching competencies...");
    // const competencies = await fetchWithCookies(`${BASE_URL}/competencies`);
    // if (competencies && competencies.length > 0) {
    //   await saveCompetencies(competencies);
    // }

    // 8. Fetch and save archetypes with detailed data
    console.log("\n🚀 Fetching archetypes...");
    const archetypes = await fetchWithCookies(`${BASE_URL}/archetypes`);
    if (archetypes && archetypes.length > 0) {
      await saveArchetypes(archetypes);
    }

    console.log("\n🎉 Crawling completed successfully!");
  } catch (error) {
    console.error("❌ Crawling failed:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

// Run the crawler
if (require.main === module) {
  main();
}

export { main as crawl };
