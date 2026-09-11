import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser } from "../../api/features/auth/get-current-user";
import { login, type LoginInput } from "../../api/features/auth/login";
import { logout } from "../../api/features/auth/logout";

export const sessionQueryKey = ["session"] as const;
export const useCurrentSession = () =>
  useQuery({
    queryKey: sessionQueryKey,
    queryFn: getCurrentUser,
    retry: false,
  });
export const useLogin = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: () => client.invalidateQueries({ queryKey: sessionQueryKey }),
  });
};
export const useLogout = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSettled: () => client.removeQueries({ queryKey: sessionQueryKey }),
  });
};
