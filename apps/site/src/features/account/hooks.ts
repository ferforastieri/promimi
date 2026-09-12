import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Offer } from "../catalog/types";
import { accountApi } from "../../api/features/account/api";

export type Profile = {
  name: string | null;
  email: string;
  emailVerifiedAt: string | null;
};
type AccountSnapshot = { profile: Profile; offers: Offer[] };
const accountKey = ["account"] as const;

export function useAccount() {
  return useQuery({
    queryKey: accountKey,
    queryFn: async (): Promise<AccountSnapshot> => {
      const [profile, favorites] = await Promise.all([
        accountApi.profile() as Promise<{ data: Profile }>,
        accountApi.favorites() as Promise<{ data: Array<{ offer: Offer }> }>,
      ]);
      return {
        profile: profile.data,
        offers: favorites.data.map((item) => item.offer),
      };
    },
  });
}

export function useRemoveAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountApi.remove,
    onSuccess: () => queryClient.removeQueries({ queryKey: accountKey }),
  });
}
