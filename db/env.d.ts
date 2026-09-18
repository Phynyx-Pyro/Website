declare namespace Cloudflare {
  interface Env {
    DB: D1Database
    GHL_LOCATION_ID: string
    GHL_PIPELINE_ID: string
    GHL_PIPELINE_STAGE_ID: string
    GHL_PRIVATE_INTEGRATION_TOKEN: string
    STUDIO_BRIDGE_SECRET?: string
    STUDIO_BRIDGE_ORIGIN?: string
  }
}
