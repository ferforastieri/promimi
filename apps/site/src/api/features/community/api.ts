import { apiRequest } from "../../client";

export const communityApi = {
  comments: (offerId: string) => apiRequest(`/offers/${offerId}/comments`), favorite: (offerId: string) => apiRequest(`/offers/${offerId}/favorite`, { method: "POST" }),
  comment: (offerId: string, body: string) => apiRequest(`/offers/${offerId}/comments`, { method: "POST", body: JSON.stringify({ body }) }),
  report: (commentId: string, reason: string) => apiRequest(`/comments/${commentId}/report`, { method: "POST", body: JSON.stringify({ reason }) })
};
