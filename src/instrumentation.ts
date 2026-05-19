export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Next.js 15.3+ passes --localstorage-file to Node, creating a broken
    // localStorage where the object exists but methods are not functions.
    // Supabase auth-js checks `typeof globalThis.localStorage !== 'undefined'`
    // (passes) then calls .getItem() (throws). Delete the broken stub.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = globalThis as any;
    if (g.localStorage && typeof g.localStorage.getItem !== "function") {
      delete g.localStorage;
    }
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
) => {
  const { captureRequestError } = await import("@sentry/nextjs");
  // @ts-expect-error — spread matches Sentry's onRequestError signature
  captureRequestError(...args);
};
