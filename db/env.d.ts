declare namespace Cloudflare {
  interface Env {
    DB: D1Database
    GHL_LOCATION_ID: string
    GHL_PIPELINE_ID: string
    GHL_PIPELINE_STAGE_ID: string
    GHL_PRIVATE_INTEGRATION_TOKEN: string
    SITE_URL?: string
    WEBSITE_CRM_DISPATCH_ENABLED?: string
    WEBSITE_EXTERNAL_TRACKING_ENABLED?: string
  }
}
