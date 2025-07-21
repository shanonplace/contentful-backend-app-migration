import { Request, Response, NextFunction } from "express";
import {
  getManagementToken,
  verifyRequest,
} from "@contentful/node-apps-toolkit";
import { ContentfulHeaders } from "./types.js";

interface ExtendedRequest extends Request {
  headers: ContentfulHeaders & Request["headers"];
}

// Helper function to create management token using App Identities
export const getAppToken = async (
  spaceId: string,
  environmentId: string
): Promise<string> => {
  if (!process.env.CONTENTFUL_APP_INSTALLATION_ID) {
    throw new Error(
      "CONTENTFUL_APP_INSTALLATION_ID environment variable is required"
    );
  }

  if (!process.env.CONTENTFUL_PRIVATE_KEY) {
    throw new Error("CONTENTFUL_PRIVATE_KEY environment variable is required");
  }

  console.log(
    `🔑 Attempting App Identities authentication for space ${spaceId}, env ${environmentId}`
  );

  // Get private key from environment variable
  const privateKey = process.env.CONTENTFUL_PRIVATE_KEY;

  try {
    // Get management token using App Identities
    const token = await getManagementToken(privateKey, {
      appInstallationId: process.env.CONTENTFUL_APP_INSTALLATION_ID,
      spaceId,
      environmentId,
    });

    console.log(
      `✓ Generated App Identities token: ${token.substring(
        0,
        10
      )}...${token.substring(token.length - 6)}`
    );
    console.log(
      `🔍 Token length: ${token.length}, starts with: ${token.substring(0, 20)}`
    );
    console.log(`🔍 Full token: ${token}`);

    // Verify token format
    if (!token.startsWith("CFPAT-")) {
      console.warn(
        `⚠️ Warning: Token doesn't start with CFPAT- prefix. Got: ${token.substring(
          0,
          10
        )}`
      );
    }

    return token;
  } catch (appIdentityError: any) {
    console.error(
      `❌ App Identities authentication failed:`,
      appIdentityError.message
    );
    throw new Error(
      `App Identities authentication failed: ${appIdentityError.message}`
    );
  }
};

// Contentful App Identity validator middleware
export const validateRequest = (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (process.env.CONTENTFUL_APP_SECRET) {
      // Convert headers to the format expected by verifyRequest
      const headers: { [key: string]: string } = {};
      Object.entries(req.headers).forEach(([key, value]) => {
        if (typeof value === "string") {
          headers[key] = value;
        } else if (Array.isArray(value)) {
          headers[key] = value.join(", ");
        }
      });

      const canonicalRequest = {
        path: req.path,
        headers,
        method: req.method as
          | "GET"
          | "POST"
          | "PUT"
          | "DELETE"
          | "PATCH"
          | "HEAD"
          | "OPTIONS",
        body: JSON.stringify(req.body),
      };
      const isValid = verifyRequest(
        process.env.CONTENTFUL_APP_SECRET,
        canonicalRequest
      );
      if (!isValid) {
        res.status(403).json({ error: "Unauthorized" });
        return;
      }
    }
    next();
  } catch (error) {
    console.error("Request verification error:", error);
    res.status(403).json({ error: "Unauthorized" });
  }
};
