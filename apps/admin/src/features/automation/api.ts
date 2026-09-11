import { apiRequest } from "../../lib/api-client";
export const automationAdminApi = { routines: () => apiRequest("/admin/routines"), control: () => apiRequest("/admin/automation") };
