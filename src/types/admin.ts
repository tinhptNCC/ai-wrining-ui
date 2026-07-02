import type { UserRole } from "./user";
import type { ListResponse } from "./common";

export interface QueryAdminUsersParams {
  limit?: number;
  offset?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
}

export type AdminUsersListResponse = ListResponse<import("./user").User>;

export interface UpdateUserRolePayload {
  role: UserRole;
}

export interface UpdateUserStatusPayload {
  isActive: boolean;
}

export interface AdminOverview {
  totalUsers: number;
  totalWritings: number;
  totalAnalyses: number;
  adminCount: number;
}
