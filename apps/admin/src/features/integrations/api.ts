import { apiRequest } from "../../lib/api-client";
export const integrationsAdminApi = { list: () => apiRequest("/admin/integrations"), validateWhatsApp: () => apiRequest("/admin/integrations/whatsapp/validate", { method: "POST" }) };
