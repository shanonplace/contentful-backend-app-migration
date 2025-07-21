import fetch from "node-fetch";
import { getAppToken } from "./backend-app-helpers.js";
import {
  MigrationResult,
  CreatedEntry,
  CategoryData,
  ContentfulEntry,
  ContentfulEntryFields,
} from "./types.js";

const BASE_URL = "https://api.contentful.com";

// Function to create a single entry
const createEntry = async (
  appAccessToken: string,
  spaceId: string,
  environmentId: string,
  contentType: string,
  fields: ContentfulEntryFields
): Promise<ContentfulEntry> => {
  const createUrl = `${BASE_URL}/spaces/${spaceId}/environments/${environmentId}/entries`;
  console.log(`🌐 Making request to: ${createUrl}`);

  const createResponse = await fetch(createUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${appAccessToken}`,
      "X-Contentful-Content-Type": contentType,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });

  console.log(
    `📡 Create response status: ${createResponse.status} ${createResponse.statusText}`
  );

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    console.log(`❌ Create error response: ${errorText}`);
    throw new Error(
      `Failed to create entry: ${createResponse.status} ${errorText}`
    );
  }

  return (await createResponse.json()) as ContentfulEntry;
};

// Function to publish an entry
const publishEntry = async (
  appAccessToken: string,
  spaceId: string,
  environmentId: string,
  entryId: string,
  version: number
): Promise<ContentfulEntry> => {
  const publishUrl = `${BASE_URL}/spaces/${spaceId}/environments/${environmentId}/entries/${entryId}/published`;
  console.log(`🌐 Making publish request to: ${publishUrl}`);

  const publishResponse = await fetch(publishUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${appAccessToken}`,
      "X-Contentful-Version": version.toString(),
      "Content-Type": "application/json",
    },
  });

  console.log(
    `📡 Publish response status: ${publishResponse.status} ${publishResponse.statusText}`
  );

  if (!publishResponse.ok) {
    const errorText = await publishResponse.text();
    console.log(`❌ Publish error response: ${errorText}`);
    throw new Error(
      `Failed to publish entry: ${publishResponse.status} ${errorText}`
    );
  }

  return (await publishResponse.json()) as ContentfulEntry;
};

// Function to generate category data
const generateCategoryData = (numEntries: number = 5): CategoryData[] => {
  const categories: CategoryData[] = [];

  for (let i = 0; i < numEntries; i++) {
    // Generate completely random values
    const randomId = Math.random().toString(36).substring(2, 8);
    const randomNumber = Math.floor(Math.random() * 10000);

    const title = `Category ${randomNumber}`;
    const slug = `category-${randomId}`;

    categories.push({
      slug: slug,
      title: title,
    });
  }

  return categories;
};

// Main migration function
export const performMigrationTasks = async (
  migrationId: string,
  spaceId: string,
  environmentId: string
): Promise<MigrationResult> => {
  const createdEntries: CreatedEntry[] = [];

  try {
    console.log(
      `Starting migration tasks for ${migrationId} in space ${spaceId}, environment ${environmentId}`
    );

    // Get app token for CMA requests
    const appAccessToken = await getAppToken(spaceId, environmentId);

    console.log(`🌍 Fetching space ${spaceId}...`);

    // Generate category data
    const numEntriesToCreate = parseInt(process.env.NUM_ENTRIES || "5");
    const categoriesToCreate = generateCategoryData(numEntriesToCreate);

    console.log(`📝 Creating ${categoriesToCreate.length} category entries...`);

    for (const category of categoriesToCreate) {
      try {
        console.log(`📄 Creating entry for: ${category.title}`);

        // Create entry using direct API call
        const createdEntry = await createEntry(
          appAccessToken,
          spaceId,
          environmentId,
          "category",
          {
            slug: { "en-US": category.slug },
            title: { "en-US": category.title },
          }
        );

        console.log(
          `✓ Created entry: ${category.title} (${createdEntry.sys.id})`
        );

        // Publish the entry
        console.log(`🚀 Publishing entry: ${category.title}`);
        const publishedEntry = await publishEntry(
          appAccessToken,
          spaceId,
          environmentId,
          createdEntry.sys.id,
          createdEntry.sys.version
        );

        createdEntries.push({
          id: publishedEntry.sys.id,
          slug: category.slug,
          title: category.title,
        });

        console.log(
          `✓ Created and published category entry: ${category.title} (${publishedEntry.sys.id})`
        );
      } catch (entryError: any) {
        console.error(
          `✗ Failed to create category entry ${category.title}:`,
          entryError.message
        );
      }
    }

    console.log(
      `Migration ${migrationId} completed successfully. Created ${createdEntries.length} entries.`
    );
    return { success: true, createdEntries };
  } catch (error: any) {
    console.error(`Migration ${migrationId} failed:`, error.message);
    return { success: false, error: error.message };
  }
};
