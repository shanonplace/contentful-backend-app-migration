import fetch from "node-fetch";
import { getAppToken } from "./backend-app-helpers.js";

const BASE_URL  try {
    console.log(`Starting migration ${migrationId} for space ${spaceId}`);

    // Step 1: Get an App Identities token using the node-apps-toolkit
    const appAccessToken = await getAppToken(spaceId, environmentId);

    // Step 2: Generate some sample data to create
    const numEntriesToCreate = parseInt(process.env.NUM_ENTRIES || "5");
    const categoriesToCreate = generateCategoryData(numEntriesToCreate);

    console.log(`Creating ${categoriesToCreate.length} category entries...`);

    // Step 3: Create and publish each entry using the CMA
    for (const category of categoriesToCreate) {
      try {
        console.log(`Creating entry: ${category.title}`);contentful.com";

// Simple function to create a category entry in Contentful
const createEntry = async (
  appAccessToken: string,
  spaceId: string,
  environmentId: string,
  slug: string,
  title: string
) => {
  const createUrl = `${BASE_URL}/spaces/${spaceId}/environments/${environmentId}/entries`;
  console.log(`Creating entry: ${title}`);

  // Create the entry with category content type
  const createResponse = await fetch(createUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${appAccessToken}`,
      "X-Contentful-Content-Type": "category", // Hard-coded since this is a specific example
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        slug: { "en-US": slug },
        title: { "en-US": title },
      },
    }),
  });

  console.log(`Create response: ${createResponse.status}`);

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    console.log(`Create failed: ${errorText}`);
    throw new Error(`Failed to create entry: ${createResponse.status}`);
  }

  return await createResponse.json();
};

// Simple function to publish an entry in Contentful
const publishEntry = async (
  appAccessToken: string,
  spaceId: string,
  environmentId: string,
  entryId: string,
  version: number
) => {
  const publishUrl = `${BASE_URL}/spaces/${spaceId}/environments/${environmentId}/entries/${entryId}/published`;
  console.log(`Publishing entry: ${entryId}`);

  const publishResponse = await fetch(publishUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${appAccessToken}`,
      "X-Contentful-Version": version.toString(),
      "Content-Type": "application/json",
    },
  });

  console.log(`Publish response: ${publishResponse.status}`);

  if (!publishResponse.ok) {
    const errorText = await publishResponse.text();
    console.log(`Publish failed: ${errorText}`);
    throw new Error(`Failed to publish entry: ${publishResponse.status}`);
  }

  return await publishResponse.json();
};

// Simple function to generate random category data for the example
const generateCategoryData = (numEntries: number = 5) => {
  const categories = [];

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

// Main function that demonstrates how to use App Identities to create entries
export const performMigrationTasks = async (
  migrationId: string,
  spaceId: string,
  environmentId: string
) => {
  const createdEntries = [];

  try {
    console.log(`🚀 Starting migration ${migrationId} for space ${spaceId}`);

    // Step 1: Get an App Identities token using the node-apps-toolkit
    const appAccessToken = await getAppToken(spaceId, environmentId);

    // Step 2: Generate some sample data to create
    const numEntriesToCreate = parseInt(process.env.NUM_ENTRIES || "5");
    const categoriesToCreate = generateCategoryData(numEntriesToCreate);

    console.log(`📝 Creating ${categoriesToCreate.length} category entries...`);

    // Step 3: Create and publish each entry using the CMA
    for (const category of categoriesToCreate) {
      try {
        console.log(`📄 Creating entry: ${category.title}`);

        // Create the entry using the CMA
        const createdEntry = await createEntry(
          appAccessToken,
          spaceId,
          environmentId,
          category.slug,
          category.title
        );

        console.log(`Created entry: ${category.title} (${createdEntry.sys.id})`);

        // Publish the entry to make it live
        const publishedEntry = await publishEntry(
          appAccessToken,
          spaceId,
          environmentId,
          createdEntry.sys.id,
          createdEntry.sys.version
        );

        // Keep track of what we created
        createdEntries.push({
          id: publishedEntry.sys.id,
          slug: category.slug,
          title: category.title,
        });

        console.log(`Published entry: ${category.title}`);
      } catch (entryError) {
        console.error(`Failed to create entry ${category.title}:`, entryError.message);
        }
    }

    console.log(`Migration ${migrationId} completed! Created ${createdEntries.length} entries.`);
    return { success: true, createdEntries };
  } catch (error) {
    console.error(`Migration ${migrationId} failed:`, error.message);
    return { success: false, error: error.message };
  }
};
