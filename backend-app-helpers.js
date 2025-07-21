import {
  getManagementToken,
  verifyRequest,
} from "@contentful/node-apps-toolkit";

// Helper function to create management token using App Identities
export const getAppToken = async (spaceId, environmentId) => {
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
  } catch (appIdentityError) {
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
export const validateRequest = (req, res, next) => {
  try {
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
