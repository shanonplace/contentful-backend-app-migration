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
    `Attempting App Identities authentication for space ${spaceId}, env ${environmentId}`
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
      `Generated App Identities token: ${token.substring(
        0,
        10
      )}...${token.substring(token.length - 6)}`
    );
    console.log(
      `Token length: ${token.length}, starts with: ${token.substring(0, 20)}`
    );
    // Do NOT log the full token for security reasons

    return token;
  } catch (appIdentityError: any) {
    console.error(
      `App Identities authentication failed:`,
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
    if (!process.env.CONTENTFUL_APP_SIGNING_SECRET) {
      res.status(403).json({ error: "Unauthorized: Missing signing secret" });
      return;
    }
    // Extract the required Contentful headers for request verification
    // These are the headers that the frontend signed when making the request
    const headers = {
      "x-contentful-signature": req.headers["x-contentful-signature"] as string,
      "x-contentful-signed-headers": req.headers[
        "x-contentful-signed-headers"
      ] as string,
      "x-contentful-timestamp": req.headers["x-contentful-timestamp"] as string,
      "x-contentful-space-id": req.headers["x-contentful-space-id"] as string,
      "x-contentful-environment-id": req.headers[
        "x-contentful-environment-id"
      ] as string,
    };

    // Create the request object for Contentful's verifyRequest function
    // This must match exactly what the frontend used when signing the request
    const requestToVerify = {
      path: req.path,
      headers,
      method: "POST", // Since we only handle POST requests in this example
      body: JSON.stringify(req.body),
    };
    const isValid = verifyRequest(
      process.env.CONTENTFUL_APP_SIGNING_SECRET,
      requestToVerify
    );
    if (!isValid) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }
    next();
  } catch (error) {
    console.error("Request verification error:", error);
    res.status(403).json({ error: "Unauthorized" });
  }
};
