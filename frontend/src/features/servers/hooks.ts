import { useQuery } from "@tanstack/react-query";
import { STATIC_SERVERS } from "@/shared/lib/servers";
import type { Server } from "@/shared/types/server";

export function useServers() {
  return useQuery<Server[]>({
    queryKey: ["servers"],
    queryFn: async () =>
      STATIC_SERVERS.slice().sort((a, b) => a.serverId - b.serverId),
    staleTime: 5 * 60 * 1000,
  });
}
