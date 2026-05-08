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
  }
}
