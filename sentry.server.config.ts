// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://b3de05edef6b34b73537c949d682fa30@o4511415734566912.ingest.de.sentry.io/4511415739678805",
  environment: process.env.NODE_ENV,

  // 10% sampling in production — enough signal without burning quota
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // RGPD: never capture PII (emails, IPs, cookies)
  sendDefaultPii: false,

  // Enable structured logs to Sentry
  enableLogs: true,

  // Expected Next.js internals — not real errors
  ignoreErrors: [
    "AbortError",
    /NEXT_NOT_FOUND/,
    /NEXT_REDIRECT/,
  ],
});
