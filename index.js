import express from "express";
import { verifyRequest } from "@contentful/node-apps-toolkit";
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
const simulateMigrationProgress = (migrationId) => {
  const migration = migrations[migrationId];
  if (!migration || migration.status !== "started") return;

  // Simulate random completion between 10-30 seconds
  const completionTime = Math.random() * 20000 + 10000; // 10-30 seconds

  setTimeout(() => {
    // 90% chance of success, 10% chance of failure for demo
    const success = Math.random() > 0.1;
    migrations[migrationId] = {
      ...migration,
      status: success ? "completed" : "failed",
      completedAt: Date.now(),
      duration: Date.now() - migration.startedAt,
    };
    console.log(`Migration ${migrationId} ${success ? "completed" : "failed"}`);
  }, completionTime);
};

// Contentful App Identity validator middleware
const validateRequest = (req, res, next) => {
  try {
    // For POC, you can skip verification or uncomment below for actual validation
    if (process.env.CONTENTFUL_APP_SECRET) {
      const canonicalRequest = {
        path: req.path,
        headers: req.headers,
        method: req.method,
        body: JSON.stringify(req.body),
      };
      const isValid = verifyRequest(
        process.env.CONTENTFUL_APP_SECRET,
        canonicalRequest
      );
      if (!isValid) {
        return res.status(403).json({ error: "Unauthorized" });
      }
    }
    next();
  } catch (error) {
    console.error("Request verification error:", error);
    res.status(403).json({ error: "Unauthorized" });
  }
};

// POST /start-migration
app.post("/start-migration", validateRequest, (req, res) => {
  //This endpoint starts a migration process and will use the CMA to do things like:
  // - install content types
  // - install entries
  // - install roles
  // - install apps
  // - whatever else you need to do in your migration

  // For POC, just simulate a migration start
  // Generate a fake migration ID
  const migrationId = Math.random().toString(36).substring(2, 10);
  migrations[migrationId] = { status: "started", startedAt: Date.now() };

  // Start the simulation
  simulateMigrationProgress(migrationId);

  console.log(`Migration ${migrationId} started`);
  res.json({
    migrationId,
    status: "started",
    startedAt: migrations[migrationId].startedAt,
  });
});

// GET /migration-status/:id
app.get("/migration-status/:id", validateRequest, (req, res) => {
  const migration = migrations[req.params.id];
  if (!migration) {
    return res.status(404).json({ error: "Migration not found" });
  }

  // Return full migration details including timestamps
  res.json({
    migrationId: req.params.id,
    status: migration.status,
    startedAt: migration.startedAt,
    completedAt: migration.completedAt,
    duration: migration.duration,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Migration backend app running on port ${PORT}`);
});
