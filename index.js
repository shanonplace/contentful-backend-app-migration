import express from "express";
import { performMigrationTasks } from "./contentfulMigration.js";
import { validateRequest } from "./backend-app-helpers.js";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

// Enable CORS for all routes
app.use(
  cors({
    origin: ["http://localhost:3333", "http://localhost:3000"], // Allow both frontend and backend ports
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Contentful-Signature",
      "X-Contentful-Signed-Headers",
      "X-Contentful-Timestamp",
      "X-Contentful-CRN",
      "X-Contentful-Space-Id",
      "X-Contentful-Environment-Id",
      "X-Contentful-User-Id",
    ],
  })
);

app.use(
  express.json({
    type: ["application/json", "application/vnd.contentful.management.v1+json"],
  })
);

// In-memory store for migration status (POC only)
const migrations = {};

// Simulate migration progression
const simulateMigrationProgress = async (
  migrationId,
  spaceId,
  environmentId
) => {
  const migration = migrations[migrationId];
  if (!migration || migration.status !== "started") return;

  // Simulate some initial delay
  setTimeout(async () => {
    try {
      // Perform actual migration tasks calling the CMA with app identity
      const result = await performMigrationTasks(
        migrationId,
        spaceId,
        environmentId
      );

      migrations[migrationId] = {
        ...migration,
        status: result.success ? "completed" : "failed",
        completedAt: Date.now(),
        duration: Date.now() - migration.startedAt,
        createdEntries: result.createdEntries || [],
        error: result.error,
      };

      if (result.success) {
        console.log(
          `🎉 Migration ${migrationId} completed with ${result.createdEntries.length} entries created`
        );
      } else {
        console.log(`❌ Migration ${migrationId} failed: ${result.error}`);
      }
    } catch (error) {
      console.error(`Migration ${migrationId} failed with error:`, error);
      migrations[migrationId] = {
        ...migration,
        status: "failed",
        completedAt: Date.now(),
        duration: Date.now() - migration.startedAt,
        error: error.message,
      };
    }
  }, 2000); // 2 second delay to simulate some processing time
};

// POST /start-migration
app.post("/start-migration", validateRequest, (req, res) => {
  //This endpoint starts a migration process and will use the CMA to do things like:
  // - install content types
  // - install entries
  // - install roles
  // - install apps
  // - whatever else you need to do in your migration

  // Extract space and environment from Contentful headers
  const spaceId = req.headers["x-contentful-space-id"];
  const environmentId = req.headers["x-contentful-environment-id"] || "master";

  if (!spaceId) {
    return res
      .status(400)
      .json({ error: "Space ID is required in X-Contentful-Space-Id header" });
  }

  // Generate a fake migration ID
  const migrationId = Math.random().toString(36).substring(2, 10);
  migrations[migrationId] = {
    status: "started",
    startedAt: Date.now(),
    spaceId,
    environmentId,
  };

  // Start the migration with actual CMA operations
  simulateMigrationProgress(migrationId, spaceId, environmentId);

  console.log(
    `🚀 Migration ${migrationId} started for space ${spaceId}, environment ${environmentId}`
  );
  res.json({
    migrationId,
    status: "started",
    startedAt: migrations[migrationId].startedAt,
    spaceId,
    environmentId,
  });
});

// GET /migration-status/:id
app.get("/migration-status/:id", validateRequest, (req, res) => {
  const migration = migrations[req.params.id];
  if (!migration) {
    return res.status(404).json({ error: "Migration not found" });
  }

  // Return full migration details including timestamps and created entries
  res.json({
    migrationId: req.params.id,
    status: migration.status,
    startedAt: migration.startedAt,
    completedAt: migration.completedAt,
    duration: migration.duration,
    spaceId: migration.spaceId,
    environmentId: migration.environmentId,
    createdEntries: migration.createdEntries || [],
    error: migration.error,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Migration backend app running on port ${PORT}`);
});
