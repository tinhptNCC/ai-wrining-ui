"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationResult,
  UseQueryResult,
} from "@tanstack/react-query";
import { adminService } from "@/api";
import { CACHE_TIME, QUERY_KEYS } from "@/constants";
import * as types from "@/types/api";

export function useAdminUsers(
  params?: types.QueryAdminUsersParams,
): UseQueryResult<types.AdminUsersListResponse, Error> {
  return useQuery({
    queryKey: QUERY_KEYS.admin.users(params),
    queryFn: () => adminService.getUsers(params),
    staleTime: CACHE_TIME.SHORT,
  });
}

export function useUpdateUserRole(): UseMutationResult<
  types.User,
  Error,
  { id: string; payload: types.UpdateUserRolePayload }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => adminService.updateUserRole(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user.me });
    },
  });
}

export function useUpdateUserStatus(): UseMutationResult<
  types.User,
  Error,
  { id: string; payload: types.UpdateUserStatusPayload }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => adminService.updateUserStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}
