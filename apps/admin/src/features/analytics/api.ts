import { apiRequest } from "../../lib/api-client";
export const analyticsAdminApi = { statistics: () => apiRequest("/admin/statistics") };
