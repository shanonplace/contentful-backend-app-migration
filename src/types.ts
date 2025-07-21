// Type definitions for the migration backend app

export interface Migration {
  status: "started" | "completed" | "failed";
  startedAt: number;
  completedAt?: number;
  duration?: number;
  spaceId: string;
  environmentId: string;
  createdEntries?: CreatedEntry[];
  error?: string;
}

export interface CreatedEntry {
  id: string;
  slug: string;
  title: string;
}

export interface MigrationResult {
  success: boolean;
  createdEntries?: CreatedEntry[];
  error?: string;
}

export interface CategoryData {
  slug: string;
  title: string;
}

export interface StartMigrationResponse {
  migrationId: string;
  status: string;
  startedAt: number;
  spaceId: string;
  environmentId: string;
}

export interface MigrationStatusResponse {
  migrationId: string;
  status: string;
  startedAt: number;
  completedAt?: number;
  duration?: number;
  spaceId: string;
  environmentId: string;
  createdEntries: CreatedEntry[];
  error?: string;
}

export interface ContentfulHeaders {
  "x-contentful-space-id"?: string;
  "x-contentful-environment-id"?: string;
  "x-contentful-signature"?: string;
  "x-contentful-signed-headers"?: string;
  "x-contentful-timestamp"?: string;
  "x-contentful-crn"?: string;
  "x-contentful-user-id"?: string;
}

export interface ContentfulEntryFields {
  [key: string]: {
    [locale: string]: any;
  };
}

export interface ContentfulEntry {
  sys: {
    id: string;
    version: number;
    type: string;
    contentType: {
      sys: {
        id: string;
      };
    };
  };
  fields: ContentfulEntryFields;
}
