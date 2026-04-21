import { createAppKit } from "@circle-fin/app-kit";

/**
 * Circle App Kit publishable client key.
 *
 * The `KIT_KEY:` prefix indicates this is a public, browser-safe key
 * scoped to your Circle project — analogous to Stripe's `pk_*` publishable
 * key. It is safe to ship in client bundles.
 *
 * If you ever need to rotate it, replace the value below.
 */
export const CIRCLE_KIT_KEY =
  (import.meta.env.VITE_CIRCLE_KIT_KEY as string | undefined) ??
  "KIT_KEY:44e61332f294bca9fbf99affb277f3cf:d84987d0b1fff5f71b74441cdcd241b3";

export const kit = createAppKit({
  kitKey: CIRCLE_KIT_KEY,
});
