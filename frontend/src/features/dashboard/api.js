import { reportsApi } from '../reports/api'

// Re-exported for a clean feature boundary: the dashboard only ever
// needs the admin summary endpoint.
export const dashboardApi = {
  summary: reportsApi.dashboard,
}
