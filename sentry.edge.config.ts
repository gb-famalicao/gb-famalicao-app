// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://b3de05edef6b34b73537c949d682fa30@o4511415734566912.ingest.de.sentry.io/4511415739678805",
  environment: process.env.NODE_ENV,

  // Edge (middleware) — errors only, no tracing overhead
  tracesSampleRate: 0,

  // RGPD: never capture PII (emails, IPs, cookies)
  sendDefaultPii: false,

  // Enable structured logs to Sentry
  enableLogs: true,
});
