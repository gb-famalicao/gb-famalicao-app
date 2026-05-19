import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  sendDefaultPii: false,
  beforeBreadcrumb(breadcrumb) {
    // Strip query params — may contain tokens or emails (RGPD)
    if (breadcrumb.data?.url) {
      try {
        const u = new URL(breadcrumb.data.url);
        u.search = "";
        breadcrumb.data.url = u.toString();
      } catch { /* ignore */ }
    }
    return breadcrumb;
  },
  ignoreErrors: [
    "AbortError",
    "TypeError: Failed to fetch",
    "TypeError: NetworkError",
    "TypeError: Load failed",
    /^Navigation cancelled/,
  ],
  integrations: [Sentry.browserTracingIntegration()],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
