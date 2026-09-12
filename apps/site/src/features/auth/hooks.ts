import { useMutation } from "@tanstack/react-query";
import { accountApi } from "../../api/features/account/api";

export const useLogin = () => useMutation({ mutationFn: accountApi.login });
export const useRegister = () =>
  useMutation({ mutationFn: accountApi.register });
export const useRequestPasswordReset = () =>
  useMutation({ mutationFn: accountApi.requestPasswordReset });
export const useResetPassword = () =>
  useMutation({
    mutationFn: ({
      token,
      password,
    }: {
      token: string | null;
      password: string;
    }) => accountApi.resetPassword(token, password),
  });
export const useVerifyEmail = () =>
  useMutation({ mutationFn: accountApi.verifyEmail });
