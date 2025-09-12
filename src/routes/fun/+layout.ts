// src/routes/fun/+layout.ts
export const ssr = false;      // don’t SSR anything under /fun
export const prerender = true; // emit static HTML so hard refresh works