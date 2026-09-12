import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { communityApi } from "../../api/features/community/api";

export type CommunityComment = { id: string; body: string; createdAt: string; author: string };
const commentsKey = (offerId: string) => ["offer-comments", offerId] as const;

export function useOfferComments(offerId: string) {
  return useQuery({ queryKey: commentsKey(offerId), queryFn: async () => (await communityApi.comments(offerId) as { data: CommunityComment[] }).data });
}

export function useFavoriteOffer() { return useMutation({ mutationFn: communityApi.favorite }); }
export function useCreateComment(offerId: string) { const queryClient = useQueryClient(); return useMutation({ mutationFn: (body: string) => communityApi.comment(offerId, body), onSuccess: () => queryClient.invalidateQueries({ queryKey: commentsKey(offerId) }) }); }
export function useReportComment() { return useMutation({ mutationFn: ({ commentId, reason }: { commentId: string; reason: string }) => communityApi.report(commentId, reason) }); }
