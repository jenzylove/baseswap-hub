import { AppKit } from "@circle-fin/app-kit";

/**
 * Circle App Kit publishable client key.
 *
 * ⚠️ Lovable does not use `.env` files. Because this is a `VITE_*` variable,
 * it is inlined into the client bundle at build time and visible to anyone
 * who opens devtools — `VITE_*` vars are NEVER truly private. The `KIT_KEY:`
 * prefix from Circle indicates this is a publishable, browser-safe key
 * (analogous to Stripe's `pk_*`), so that's fine.
 *
 * To set the key:
 *   Option A (recommended for Lovable): replace the literal "REPLACE_WITH_KIT_KEY"
 *     below with your actual Circle kit key.
 *   Option B: when self-hosting/exporting, define VITE_CIRCLE_KIT_KEY in your
 *     own `.env` file — this code will pick it up automatically.
 */
export const CIRCLE_KIT_KEY: string =
  (import.meta.env.VITE_CIRCLE_KIT_KEY as string | undefined) ??
  "REPLACE_WITH_KIT_KEY";

/** Singleton App Kit client used across the app. */
export const kit = new AppKit();
