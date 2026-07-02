"use client";

import { useState } from "react";
import { Shield, ShieldOff, UserCheck, UserX } from "lucide-react";
import { useAuth } from "@/features/auth";
import {
  useAdminUsers,
  useUpdateUserRole,
  useUpdateUserStatus,
} from "../hooks/useAdminUsersApi";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Select } from "@/components/select";
import { Loading } from "@/components/loading";
import { Error } from "@/components/error-state";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/badge";
import { Pagination } from "@/components/pagination";
import { useConfirmDialog } from "@/components/confirm-dialog";
import { usePagination } from "@/hooks/usePagination";
import { toast } from "@/lib/toast";
import { adminUsersMessages } from "@/messages/admin-users";
import { commonMessages } from "@/messages/common";
import { msg } from "@/messages/format";
import { formatDateTime, getErrorMessage } from "@/utils/helpers";
import type { QueryAdminUsersParams, User, UserRole } from "@/types/api";

export function AdminUsersView() {
  const { user: currentUser } = useAuth();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { offset, limit, currentPage, reset, getTotalPages, paginationProps } =
    usePagination({ limit: 20 });

  const params: QueryAdminUsersParams = {
    limit,
    offset,
    ...(appliedSearch && { search: appliedSearch }),
    ...(roleFilter && { role: roleFilter as UserRole }),
    ...(statusFilter && { isActive: statusFilter === "active" }),
  };

  const { data, isLoading, error } = useAdminUsers(params);
  const updateRole = useUpdateUserRole();
  const updateStatus = useUpdateUserStatus();

  if (currentUser?.role !== "admin") {
    return (
      <Error
        title={adminUsersMessages.accessDenied}
        message={adminUsersMessages.accessDenied}
      />
    );
  }

  if (isLoading) {
    return <Loading fullScreen text={adminUsersMessages.loading} />;
  }

  if (error) {
    return (
      <Error
        title={adminUsersMessages.error.title}
        message={adminUsersMessages.error.message}
        retry={() => window.location.reload()}
      />
    );
  }

  const users = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = getTotalPages(total);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(search.trim());
    reset();
  };

  const handleRoleChange = async (target: User, nextRole: UserRole) => {
    if (target.id === currentUser?.id) return;
    if (target.role === nextRole) return;

    const confirmed = await confirm({
      title: msg(
        nextRole === "admin"
          ? adminUsersMessages.confirm.makeAdmin
          : adminUsersMessages.confirm.removeAdmin,
        { username: target.username },
      ),
      description: adminUsersMessages.confirm.description,
      confirmLabel:
        nextRole === "admin"
          ? adminUsersMessages.table.makeAdmin
          : adminUsersMessages.table.removeAdmin,
      cancelLabel: commonMessages.cancel,
      variant: nextRole === "admin" ? "default" : "destructive",
    });
    if (!confirmed) return;

    try {
      await updateRole.mutateAsync({
        id: target.id,
        payload: { role: nextRole },
      });
      toast.success(adminUsersMessages.toast.roleUpdated);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleStatusChange = async (target: User, isActive: boolean) => {
    if (target.id === currentUser?.id && !isActive) return;
    if (target.isActive === isActive) return;

    const confirmed = await confirm({
      title: msg(
        isActive
          ? adminUsersMessages.confirm.activate
          : adminUsersMessages.confirm.deactivate,
        { username: target.username },
      ),
      description: adminUsersMessages.confirm.description,
      confirmLabel: isActive
        ? adminUsersMessages.table.activate
        : adminUsersMessages.table.deactivate,
      cancelLabel: commonMessages.cancel,
      variant: isActive ? "default" : "destructive",
    });
    if (!confirmed) return;

    try {
      await updateStatus.mutateAsync({
        id: target.id,
        payload: { isActive },
      });
      toast.success(adminUsersMessages.toast.statusUpdated);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-8">
      <ConfirmDialog />
      <PageHeader
        variant="glass"
        title={adminUsersMessages.title}
        description={adminUsersMessages.description}
      />

      <div className="panel-glass p-4 space-y-4">
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Input
            name="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={adminUsersMessages.search.placeholder}
            aria-label={adminUsersMessages.search.ariaLabel}
            className="flex-1"
          />
          <Button type="submit" variant="outline">
            {adminUsersMessages.search.submit}
          </Button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label={adminUsersMessages.table.role}
            name="roleFilter"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              reset();
            }}
            options={[
              { value: "", label: adminUsersMessages.filter.allRoles },
              { value: "user", label: adminUsersMessages.filter.roleUser },
              { value: "admin", label: adminUsersMessages.filter.roleAdmin },
            ]}
          />
          <Select
            label={adminUsersMessages.table.status}
            name="statusFilter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              reset();
            }}
            options={[
              { value: "", label: adminUsersMessages.filter.allStatus },
              { value: "active", label: adminUsersMessages.filter.statusActive },
              {
                value: "inactive",
                label: adminUsersMessages.filter.statusInactive,
              },
            ]}
          />
        </div>
      </div>

      <div className="panel-glass overflow-hidden">
        <div className="px-5 py-4 border-b border-border/60">
          <h2 className="text-sm font-semibold text-fg">
            {adminUsersMessages.table.title}
          </h2>
        </div>

        {users.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={adminUsersMessages.table.empty}
              description={adminUsersMessages.table.empty}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-muted">
                  <th className="px-5 py-3 font-medium">
                    {adminUsersMessages.table.username}
                  </th>
                  <th className="px-5 py-3 font-medium">
                    {adminUsersMessages.table.email}
                  </th>
                  <th className="px-5 py-3 font-medium">
                    {adminUsersMessages.table.role}
                  </th>
                  <th className="px-5 py-3 font-medium">
                    {adminUsersMessages.table.status}
                  </th>
                  <th className="px-5 py-3 font-medium">
                    {adminUsersMessages.table.createdAt}
                  </th>
                  <th className="px-5 py-3 font-medium text-right">
                    {adminUsersMessages.table.actions}
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((row) => {
                  const isSelf = row.id === currentUser?.id;
                  const isAdmin = row.role === "admin";
                  const isActive = row.isActive !== false;

                  return (
                    <tr key={row.id} className="border-b border-border/40">
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-fg">
                            {row.username}
                          </span>
                          {isSelf ? (
                            <Badge variant="neutral">
                              {adminUsersMessages.table.you}
                            </Badge>
                          ) : null}
                        </div>
                        {row.fullName ? (
                          <p className="text-xs text-muted mt-0.5">
                            {row.fullName}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-5 py-3 text-muted">
                        {row.email ?? "—"}
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={isAdmin ? "primary" : "neutral"}>
                          {isAdmin
                            ? adminUsersMessages.filter.roleAdmin
                            : adminUsersMessages.filter.roleUser}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={isActive ? "success" : "warning"}>
                          {isActive
                            ? adminUsersMessages.table.statusActive
                            : adminUsersMessages.table.statusInactive}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-muted whitespace-nowrap">
                        {row.createdAt ? formatDateTime(row.createdAt) : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2 flex-wrap">
                          {!isSelf ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1"
                                onClick={() =>
                                  handleRoleChange(
                                    row,
                                    isAdmin ? "user" : "admin",
                                  )
                                }
                                disabled={
                                  updateRole.isPending || updateStatus.isPending
                                }
                              >
                                {isAdmin ? (
                                  <ShieldOff className="h-3.5 w-3.5" />
                                ) : (
                                  <Shield className="h-3.5 w-3.5" />
                                )}
                                {isAdmin
                                  ? adminUsersMessages.table.removeAdmin
                                  : adminUsersMessages.table.makeAdmin}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="gap-1"
                                onClick={() =>
                                  handleStatusChange(row, !isActive)
                                }
                                disabled={
                                  updateRole.isPending || updateStatus.isPending
                                }
                              >
                                {isActive ? (
                                  <UserX className="h-3.5 w-3.5 text-danger" />
                                ) : (
                                  <UserCheck className="h-3.5 w-3.5 text-success" />
                                )}
                                {isActive
                                  ? adminUsersMessages.table.deactivate
                                  : adminUsersMessages.table.activate}
                              </Button>
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevious={paginationProps.onPrevious}
        onNext={paginationProps.onNext}
      />
    </div>
  );
}
