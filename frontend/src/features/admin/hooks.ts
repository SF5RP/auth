import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/lib/api";
import type { User, UserRole } from "@/shared/types/auth";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => api.get<User[]>("/admin/users", { requiresAuth: true }),
  });
}

interface UpdateRoleParams {
  userId: string;
  role: UserRole;
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: UpdateRoleParams) =>
      api.post(`/admin/users/${userId}/role`, { role }, { requiresAuth: true }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
