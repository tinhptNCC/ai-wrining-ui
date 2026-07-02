import { http } from "./client";
import { API_PATHS } from "@/constants/api.constants";
import { normalizeListResponse } from "./response.helpers";
import * as types from "@/types/api";

export const adminService = {
  async getOverview(): Promise<types.AdminOverview> {
    const response = await http.get<types.AdminOverview>(API_PATHS.ADMIN.OVERVIEW);
    return response.data;
  },

  async getUsers(
    params?: types.QueryAdminUsersParams,
  ): Promise<types.AdminUsersListResponse> {
    const response = await http.get<types.BackendListResponse<types.User>>(
      API_PATHS.ADMIN.USERS,
      { params },
    );
    return normalizeListResponse(response.data);
  },

  async updateUserRole(
    id: string,
    payload: types.UpdateUserRolePayload,
  ): Promise<types.User> {
    const response = await http.patch<types.BackendDataResponse<types.User>>(
      API_PATHS.ADMIN.USER_ROLE(id),
      payload,
    );
    return response.data.data;
  },

  async updateUserStatus(
    id: string,
    payload: types.UpdateUserStatusPayload,
  ): Promise<types.User> {
    const response = await http.patch<types.BackendDataResponse<types.User>>(
      API_PATHS.ADMIN.USER_STATUS(id),
      payload,
    );
    return response.data.data;
  },
};
